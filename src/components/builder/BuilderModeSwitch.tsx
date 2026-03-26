'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { BuilderLayout } from './BuilderLayout'

const VisualBuilderLayout = dynamic(
  () => import('@/components/visual-builder/VisualBuilderLayout').then((m) => m.VisualBuilderLayout),
  { ssr: false, loading: () => <div className="flex h-screen items-center justify-center text-gray-400">Carregando Visual Builder...</div> },
)

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

export function BuilderModeSwitch({ quiz, onSave }: Props) {
  const [mode, setMode] = useState<'classic' | 'visual'>('visual')

  return (
    <div className="relative h-screen">
      {/* Mode toggle - floating */}
      <div className="absolute left-1/2 top-2 z-50 -translate-x-1/2">
        <div className="flex rounded-full border border-gray-200 bg-white p-0.5 shadow-md">
          <button
            onClick={() => setMode('classic')}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
              mode === 'classic' ? 'bg-[#426a35] text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Clássico
          </button>
          <button
            onClick={() => setMode('visual')}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
              mode === 'visual' ? 'bg-[#426a35] text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Visual
          </button>
        </div>
      </div>

      {mode === 'classic' ? (
        <BuilderLayout quiz={quiz} onSave={onSave} />
      ) : (
        <VisualBuilderLayout quiz={quiz} onSave={onSave} />
      )}
    </div>
  )
}
