'use client'

import { Step1General } from '@/components/builder/Step1General'
import { Step2Lead } from '@/components/builder/Step2Lead'
import { Step3Bands } from '@/components/builder/Step3Bands'
import { Step4Questions } from '@/components/builder/Step4Questions'
import { Step5ResultPage } from '@/components/builder/Step5ResultPage'
import type { Question, QuizSettings } from '@/lib/sanitize'
import type { QuizNodeData } from './quizToFlow'

interface Props {
  selectedNode: QuizNodeData | null
  questions: Question[]
  settings: QuizSettings
  slug: string
  onQuestionsChange: (q: Question[]) => void
  onSettingsChange: (s: QuizSettings) => void
  onSlugChange: (slug: string) => void
}

export function SettingsPanel({
  selectedNode,
  questions,
  settings,
  slug,
  onQuestionsChange,
  onSettingsChange,
  onSlugChange,
}: Props) {
  if (!selectedNode) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-gray-400">
        <div>
          <svg className="mx-auto mb-3 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <p>Clique em um bloco no canvas para editar suas configurações</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      {selectedNode.type === 'landing' && (
        <Step1General
          settings={settings}
          onChange={onSettingsChange}
          slug={slug}
          onSlugChange={onSlugChange}
        />
      )}
      {selectedNode.type === 'lead-capture' && (
        <Step2Lead settings={settings} onChange={onSettingsChange} />
      )}
      {selectedNode.type === 'question' && (
        <Step4Questions questions={questions} onChange={onQuestionsChange} />
      )}
      {selectedNode.type === 'result' && (
        <div className="space-y-6">
          <Step3Bands settings={settings} onChange={onSettingsChange} />
          <div className="border-t pt-6">
            <Step5ResultPage settings={settings} onChange={onSettingsChange} />
          </div>
        </div>
      )}
    </div>
  )
}
