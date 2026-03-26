'use client'

import { useState } from 'react'
import type { Question } from '@/lib/sanitize'

interface Props {
  question: Question
  questionIndex: number
  totalQuestions: number
  onAnswer: (points: number) => void
}

export function QuestionScreen({ question: q, questionIndex, totalQuestions, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const progress = Math.round((questionIndex / totalQuestions) * 100)
  const validOptions = (q.options || []).filter((opt) => opt && opt.label)

  function handleSelect(idx: number, points: number) {
    if (selected !== null) return
    setSelected(idx)
    setTimeout(() => onAnswer(points), 300)
  }

  const mediaImg = q.image_url ? (
    <img
      src={q.image_url}
      alt=""
      className="mx-auto block h-80 w-full max-w-[708px] rounded-xl object-cover"
    />
  ) : null

  return (
    <>
      {/* Fixed progress bar */}
      <div className="fixed left-0 top-0 z-[9999] h-2 w-full overflow-hidden bg-gray-100">
        <div
          className="h-full bg-[#426a35] transition-[width] duration-400 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-6 rounded-xl bg-white p-8">
        <p className="mb-3 text-[0.85em] font-bold uppercase tracking-wider text-gray-400">
          {questionIndex + 1} de {totalQuestions}
        </p>

        {q.icon && (
          <span className="mb-3 block text-[2.5em]">{q.icon}</span>
        )}

        {q.media_position === 'top' && mediaImg && (
          <div className="mb-5">{mediaImg}</div>
        )}

        <h3 className="mb-6 text-[1.3em] font-bold leading-snug text-gray-900">
          {q.question}
        </h3>

        {q.media_position !== 'top' && mediaImg && (
          <div className="mt-5">{mediaImg}</div>
        )}

        {validOptions.length > 0 ? (
          <div className="space-y-3">
            {validOptions.map((opt, i) => {
              const letter = opt.letter || String.fromCharCode(65 + i)
              const isSelected = selected === i
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i, opt.points || 0)}
                  className={`flex w-full items-center rounded-xl border-2 px-5 py-4 text-left text-base leading-snug transition-all ${
                    isSelected
                      ? 'border-[#426a35] bg-[#f1f7ee]'
                      : 'border-gray-200 bg-white hover:border-[#426a35] hover:bg-[#f1f7ee]'
                  }`}
                >
                  <span
                    className={`mr-3 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-[0.9em] font-bold ${
                      isSelected
                        ? 'border-[#426a35] bg-[#426a35] text-white'
                        : 'border-gray-100 bg-gray-50 text-gray-500'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="flex-1 break-words">{opt.label}</span>
                </button>
              )
            })}
          </div>
        ) : (
          !q.is_informational && (
            <p className="text-center text-red-500">Nenhuma opção configurada para esta pergunta.</p>
          )
        )}
      </div>
    </>
  )
}
