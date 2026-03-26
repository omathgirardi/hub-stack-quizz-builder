'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { QuizCanvas } from './QuizCanvas'
import { SettingsPanel } from './SettingsPanel'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { Question, QuizSettings } from '@/lib/sanitize'
import type { QuizNodeData } from './quizToFlow'

interface Quiz {
  id?: string
  title: string
  slug?: string
  questions: unknown[]
  settings: Record<string, unknown>
}

interface Props {
  quiz?: Quiz
  onSave: (title: string, questions: unknown[], settings: unknown, slug?: string) => Promise<void>
}

export function VisualBuilderLayout({ quiz, onSave }: Props) {
  const [title, setTitle] = useState(quiz?.title ?? '')
  const [slug, setSlug] = useState(quiz?.slug ?? '')
  const [questions, setQuestions] = useState<Question[]>((quiz?.questions as Question[]) ?? [])
  const [settings, setSettings] = useState<QuizSettings>((quiz?.settings as QuizSettings) ?? {})
  const [selectedNode, setSelectedNode] = useState<QuizNodeData | null>(null)
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [showCopyModal, setShowCopyModal] = useState(false)
  const [canvasKey, setCanvasKey] = useState(0)
  const router = useRouter()

  function handleSave() {
    startTransition(async () => {
      try {
        await onSave(title, questions, settings, slug || undefined)
        setSaved(true)
        setShowCopyModal(true)
        setTimeout(() => setSaved(false), 3000)
      } catch (error) {
        console.error('Erro ao salvar quiz:', error)
        alert('Erro ao salvar quiz.')
      }
    })
  }

  function handleAddQuestion() {
    const newQ: Question = {
      id: crypto.randomUUID(),
      field_id: crypto.randomUUID(),
      question: '',
      icon: '❓',
      image_url: '',
      use_carousel: false,
      carousel_images: [],
      is_informational: false,
      media_position: 'top',
      options: [
        { label: '', points: 1, letter: 'A' },
        { label: '', points: 2, letter: 'B' },
        { label: '', points: 3, letter: 'C' },
        { label: '', points: 4, letter: 'D' },
      ],
    }
    setQuestions([...questions, newQ])
    setCanvasKey((k) => k + 1)
  }

  const handleNodeSelect = useCallback((node: QuizNodeData | null) => {
    setSelectedNode(node)
  }, [])

  const handleQuestionsChange = useCallback((q: Question[]) => {
    setQuestions(q)
    setCanvasKey((k) => k + 1)
  }, [])

  const handleSettingsChange = useCallback((s: QuizSettings) => {
    setSettings(s)
    setCanvasKey((k) => k + 1)
  }, [])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const embedCode = quiz?.id ? `<script src="${appUrl}/embed/${quiz.id}.js"></script>` : ''
  const hostedUrl = slug ? `${appUrl}/q/${slug}` : ''

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/quizzes')} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do quiz"
            className="w-60 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium focus:border-[#426a35] focus:outline-none focus:ring-1 focus:ring-[#426a35]"
          />
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">Visual Builder</span>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm font-medium text-green-600">✓ Salvo</span>}
          {quiz?.id && (
            <a
              href={`/api/quizzes/${quiz.id}/export`}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Exportar
            </a>
          )}
          <Button onClick={handleSave} loading={pending} size="sm">
            {pending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </header>

      {/* Modal */}
      <Modal open={showCopyModal} onClose={() => setShowCopyModal(false)} title="Quiz Salvo! 🚀">
        <div className="space-y-4">
          {hostedUrl && (
            <>
              <p className="text-sm font-medium text-gray-700">Página hospedada:</p>
              <div className="relative rounded-lg bg-[#426a35] p-4 font-mono text-sm text-white">
                <a href={hostedUrl} target="_blank" rel="noopener noreferrer" className="break-all text-white underline">{hostedUrl}</a>
                <button
                  onClick={() => { navigator.clipboard.writeText(hostedUrl); alert('URL copiada!') }}
                  className="absolute right-2 top-2 rounded bg-white/20 px-2 py-1 text-[10px] text-white hover:bg-white/30"
                >
                  Copiar
                </button>
              </div>
            </>
          )}
          <p className="text-sm text-gray-500">Embed (WordPress):</p>
          <div className="relative rounded-lg bg-gray-900 p-3 font-mono text-xs text-green-400">
            <pre className="whitespace-pre-wrap break-all">{embedCode}</pre>
            <button
              onClick={() => { navigator.clipboard.writeText(embedCode); alert('Copiado!') }}
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

      {/* Body: Canvas + Settings Panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1">
          <QuizCanvas
            key={canvasKey}
            questions={questions}
            settings={settings}
            onNodeSelect={handleNodeSelect}
            onAddQuestion={handleAddQuestion}
          />
        </div>

        {/* Settings Panel */}
        <div className="w-[420px] shrink-0 border-l bg-white shadow-inner">
          <SettingsPanel
            selectedNode={selectedNode}
            questions={questions}
            settings={settings}
            slug={slug}
            onQuestionsChange={handleQuestionsChange}
            onSettingsChange={handleSettingsChange}
            onSlugChange={setSlug}
          />
        </div>
      </div>
    </div>
  )
}
