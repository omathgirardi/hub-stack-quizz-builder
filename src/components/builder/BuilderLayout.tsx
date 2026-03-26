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
import { Modal } from '@/components/ui/Modal'
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
  const [showCopyModal, setShowCopyModal] = useState(false)
  const router = useRouter()

  function handleSave() {
    startTransition(async () => {
      try {
        await onSave(title, questions, settings)
        setSaved(true)
        setShowCopyModal(true)
        setTimeout(() => setSaved(false), 3000)
      } catch (error) {
        console.error('Erro ao salvar quiz:', error)
        alert('Erro ao salvar quiz. Certifique-se de que as imagens não sejam excessivamente grandes.')
      }
    })
  }

  const embedCode = quiz?.id ? `<script src="${process.env.NEXT_PUBLIC_APP_URL ?? ''}/embed/${quiz.id}.js"></script>` : ''

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/quizzes')} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do quiz"
            className="w-72 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm font-medium text-green-600">✓ Salvo com sucesso</span>}
          {quiz?.id && (
            <a
              href={`/api/quizzes/${quiz.id}/export`}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              ⬇ Exportar
            </a>
          )}
          <Button onClick={handleSave} loading={pending} size="sm">
            {pending ? 'Salvando...' : 'Salvar Quiz'}
          </Button>
        </div>
      </header>

      <Modal open={showCopyModal} onClose={() => setShowCopyModal(false)} title="Quiz Salvo! 🚀">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Seu quiz foi salvo com sucesso. Use o código abaixo para incorporá-lo em qualquer site (Elementor, WordPress, etc):</p>
          
          <div className="relative rounded-lg bg-gray-900 p-4 font-mono text-xs text-green-400">
            <pre className="whitespace-pre-wrap break-all">{embedCode}</pre>
            <button
              onClick={() => {
                navigator.clipboard.writeText(embedCode)
                alert('Código copiado!')
              }}
              className="absolute right-2 top-2 rounded bg-white/10 px-2 py-1 text-[10px] text-white hover:bg-white/20"
            >
              Copiar
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
             <Button variant="secondary" onClick={() => setShowCopyModal(false)}>Continuar editando</Button>
             <Button onClick={() => router.push('/quizzes')}>Ir para a lista</Button>
           </div>
        </div>
      </Modal>

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
