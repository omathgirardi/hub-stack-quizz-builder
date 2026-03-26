'use client'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'

interface Answer {
  question_id: string
  points: number
  field_id?: string
}

interface Question {
  id: string
  question: string
  options?: { label: string; points: number }[]
}

interface ResponseRowProps {
  r: any
  quizTitle: string
  quizQuestions: any
  bandColor: Record<string, 'green' | 'yellow' | 'red' | 'purple'>
}

export function ResponseRow({ r, quizTitle, quizQuestions, bandColor }: ResponseRowProps) {
  const [expanded, setExpanded] = useState(false)
  const answers = (r.answers || []) as Answer[]
  const questions = (quizQuestions || []) as Question[]

  return (
    <>
      <tr 
        className="hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
          <span className={`text-xs transition-transform ${expanded ? 'rotate-90' : ''}`}>▶</span>
          {r.leadName || '—'}
        </td>
        <td className="px-4 py-3 text-gray-600">{r.leadEmail || '—'}</td>
        <td className="px-4 py-3 text-gray-600">{r.whatsapp || '—'}</td>
        <td className="px-4 py-3">
          {r.resultBand ? (
            <Badge color={bandColor[r.resultBand] ?? 'gray'}>
              {r.resultBand.replace(/_/g, ' ')}
            </Badge>
          ) : '—'}
        </td>
        <td className="px-4 py-3 text-gray-800 font-bold">{r.score}</td>
        <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{quizTitle}</td>
        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
          {r.createdAt ? new Date(r.createdAt).toLocaleString('pt-BR') : '—'}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50/50">
          <td colSpan={7} className="px-8 py-4 border-l-4 border-primary/20">
            <div className="space-y-4">
              <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-2">Respostas Detalhadas:</h4>
              <div className="grid gap-3">
                {questions.map((q, idx) => {
                  const ans = answers.find(a => a.question_id === q.id)
                  const selectedOption = q.options?.find(o => o.points === ans?.points)
                  
                  return (
                    <div key={q.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-start gap-3">
                        <span className="bg-gray-100 text-gray-500 w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-1">{q.question}</p>
                          {ans ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-primary font-semibold">
                                {selectedOption?.label || 'Resposta selecionada'}
                              </span>
                              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
                                +{ans.points} pts
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 italic">Pergunta não respondida ainda</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
                <span>ID da Resposta: {r.id}</span>
                <span>Fonte: {r.source || 'Direta'}</span>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
