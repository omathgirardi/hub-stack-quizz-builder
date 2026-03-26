'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { BuilderSidebar } from './BuilderSidebar'
import { Step1General } from './Step1General'
import { Step2Lead } from './Step2Lead'
import { Step3Bands } from './Step3Bands'
import { Step4Questions } from './Step4Questions'
import { Step5ResultPage } from './Step5ResultPage'
import { Button } from '@/components/ui/Button'
import type { Question, QuizSettings } from '@/lib/sanitize'

interface Quiz {
  id?: string
  title: string
  questions: unknown[]
  settings: Record<string, unknown>
}

interface Props {
  quiz?: Quiz
  onSave: (title: string, questions: unknown[], settings: unknown) => Promise<void>
}

export function BuilderLayout({ quiz, onSave }: Props) {
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState(quiz?.title ?? '')
  const [questions, setQuestions] = useState<Question[]>((quiz?.questions as Question[]) ?? [])
  const [settings, setSettings] = useState<QuizSettings>((quiz?.settings as QuizSettings) ?? {})
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  function handleSave() {
    startTransition(async () => {
      await onSave(title, questions, settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/quizzes')} className="text-sm text-gray-500 hover:text-gray-800">← Voltar</button>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do quiz"
            className="w-72 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-3">
          {quiz?.id && (
            <a
              href={`/api/quizzes/${quiz.id}/export`}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              ⬇ Exportar
            </a>
          )}
          <Button onClick={handleSave} loading={pending} size="sm">
            {saved ? '✓ Salvo!' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <BuilderSidebar activeStep={step} onChange={setStep} />
        <main className="flex-1 overflow-y-auto p-8">
          {step === 1 && <Step1General settings={settings} onChange={setSettings} />}
          {step === 2 && <Step2Lead settings={settings} onChange={setSettings} />}
          {step === 3 && <Step3Bands settings={settings} onChange={setSettings} />}
          {step === 4 && <Step4Questions questions={questions} onChange={setQuestions} />}
          {step === 5 && <Step5ResultPage settings={settings} onChange={setSettings} />}
        </main>
      </div>
    </div>
  )
}
