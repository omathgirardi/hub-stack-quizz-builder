'use client'

import { useState, useCallback } from 'react'
import { LandingScreen } from './LandingScreen'
import { LeadCaptureScreen } from './LeadCaptureScreen'
import { QuestionScreen } from './QuestionScreen'
import { ResultScreen } from './ResultScreen'
import type { Question, QuizSettings, BandSettings } from '@/lib/sanitize'

type Screen = 'landing' | 'lead' | 'question' | 'calculating' | 'result'

interface QuizData {
  id: string
  title: string
  questions: Question[]
  settings: QuizSettings
}

interface Props {
  quiz: QuizData
  apiBase?: string
}

export function QuizPlayer({ quiz, apiBase = '' }: Props) {
  const s = quiz.settings
  const hasLanding = s.show_landing === true
  const hasLead = !!(s.name_capture || s.email_capture || s.whatsapp_capture)

  const initialScreen: Screen = hasLanding ? 'landing' : hasLead ? 'lead' : 'question'

  const [screen, setScreen] = useState<Screen>(initialScreen)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<{ question_id: string; field_id: string; points: number }[]>([])
  const [responseId, setResponseId] = useState<string | null>(null)
  const [leadData, setLeadData] = useState({ name: '', email: '', whatsapp: '' })
  const [resultBand, setResultBand] = useState('')
  const [bandData, setBandData] = useState<BandSettings | null>(null)

  const totalQuestions = quiz.questions.length

  const getResultBand = useCallback((currentScore: number) => {
    const results = s.results || {}
    let band = 'leve'
    for (const [key, r] of Object.entries(results)) {
      if (r && currentScore >= r.range_min && currentScore <= r.range_max) {
        band = key
      }
    }
    return band
  }, [s.results])

  async function savePartial(data: {
    score: number
    answers: typeof answers
    leadName?: string
    leadEmail?: string
    whatsapp?: string
  }) {
    try {
      const res = await fetch(`${apiBase}/api/public/responses/partial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: quiz.id,
          responseId,
          leadName: data.leadName || leadData.name,
          leadEmail: data.leadEmail || leadData.email,
          whatsapp: data.whatsapp || leadData.whatsapp,
          score: data.score,
          resultBand: getResultBand(data.score),
          answers: data.answers,
          source: typeof window !== 'undefined' ? window.location.href : '',
        }),
      })
      const d = await res.json()
      if (d.response_id) setResponseId(d.response_id)
    } catch { /* silent */ }
  }

  function handleStart() {
    if (hasLead) {
      setScreen('lead')
    } else {
      setScreen('question')
    }
  }

  function handleLeadSubmit(data: { name: string; email: string; whatsapp: string }) {
    setLeadData(data)
    savePartial({ score: 0, answers: [], leadName: data.name, leadEmail: data.email, whatsapp: data.whatsapp })
    setScreen('question')
  }

  function handleAnswer(points: number) {
    const q = quiz.questions[currentQuestion]
    const newScore = score + points
    const newAnswers = [...answers, { question_id: q.id, field_id: q.field_id, points }]

    setScore(newScore)
    setAnswers(newAnswers)
    savePartial({ score: newScore, answers: newAnswers })

    if (currentQuestion + 1 >= totalQuestions) {
      finishQuiz(newScore, newAnswers)
    } else {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  async function finishQuiz(finalScore: number, finalAnswers: typeof answers) {
    setScreen('calculating')
    const band = getResultBand(finalScore)
    setResultBand(band)

    try {
      const res = await fetch(`${apiBase}/api/public/responses/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: quiz.id,
          responseId,
          leadName: leadData.name,
          leadEmail: leadData.email,
          whatsapp: leadData.whatsapp,
          score: finalScore,
          resultBand: band,
          answers: finalAnswers,
          source: typeof window !== 'undefined' ? window.location.href : '',
        }),
      })
      const data = await res.json()
      setBandData(data.result || null)
    } catch {
      setBandData(null)
    }
    setScreen('result')
  }

  return (
    <div className="mx-auto w-full max-w-[708px]" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {screen === 'landing' && (
        <LandingScreen title={quiz.title} settings={s} onStart={handleStart} />
      )}
      {screen === 'lead' && (
        <LeadCaptureScreen settings={s} onSubmit={handleLeadSubmit} />
      )}
      {screen === 'question' && quiz.questions[currentQuestion] && (
        <QuestionScreen
          question={quiz.questions[currentQuestion]}
          questionIndex={currentQuestion}
          totalQuestions={totalQuestions}
          onAnswer={handleAnswer}
        />
      )}
      {screen === 'calculating' && (
        <div className="py-10 text-center text-gray-500">Calculando resultado...</div>
      )}
      {screen === 'result' && (
        <ResultScreen
          settings={s}
          band={resultBand}
          bandData={bandData}
          score={score}
          quizId={quiz.id}
        />
      )}
    </div>
  )
}
