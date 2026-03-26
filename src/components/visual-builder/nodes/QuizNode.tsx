'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import type { QuizNodeData } from '../quizToFlow'

const typeColors: Record<string, { bg: string; border: string; badge: string }> = {
  'landing': { bg: 'bg-blue-50', border: 'border-blue-300', badge: 'bg-blue-100 text-blue-700' },
  'lead-capture': { bg: 'bg-purple-50', border: 'border-purple-300', badge: 'bg-purple-100 text-purple-700' },
  'question': { bg: 'bg-white', border: 'border-green-300', badge: 'bg-green-100 text-green-700' },
  'result': { bg: 'bg-amber-50', border: 'border-amber-300', badge: 'bg-amber-100 text-amber-700' },
}

const typeLabels: Record<string, string> = {
  'landing': 'CAPA',
  'lead-capture': 'LEAD',
  'question': 'PERGUNTA',
  'result': 'RESULTADO',
}

function QuizNodeComponent({ data, selected }: NodeProps<Node<QuizNodeData>>) {
  const colors = typeColors[data.type] || typeColors.question
  const optionCount = data.question?.options?.filter((o) => o.label).length

  return (
    <div
      className={`min-w-[220px] max-w-[260px] rounded-xl border-2 ${colors.border} ${colors.bg} p-3 shadow-sm transition-shadow ${
        selected ? 'shadow-lg ring-2 ring-[#426a35] ring-offset-2' : 'hover:shadow-md'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!h-2.5 !w-2.5 !border-2 !border-white !bg-[#426a35]" />

      <div className="mb-1.5 flex items-center gap-2">
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${colors.badge}`}>
          {typeLabels[data.type]}
        </span>
      </div>

      <p className="m-0 text-sm font-medium leading-snug text-gray-800">
        {data.label}
      </p>

      {data.type === 'question' && optionCount !== undefined && (
        <p className="m-0 mt-1 text-xs text-gray-400">{optionCount} opções</p>
      )}

      {data.type === 'result' && data.bandKey && (
        <p className="m-0 mt-1 text-xs text-gray-400">
          {data.settings?.results?.[data.bandKey as keyof typeof data.settings.results]?.range_min ?? '?'}–
          {data.settings?.results?.[data.bandKey as keyof typeof data.settings.results]?.range_max ?? '?'} pts
        </p>
      )}

      <Handle type="source" position={Position.Bottom} className="!h-2.5 !w-2.5 !border-2 !border-white !bg-[#426a35]" />
    </div>
  )
}

export const QuizNode = memo(QuizNodeComponent)
