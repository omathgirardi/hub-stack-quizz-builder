'use client'

import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type OnSelectionChangeFunc,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { QuizNode } from './nodes/QuizNode'
import { quizToNodes, quizToEdges, type QuizNodeData } from './quizToFlow'
import type { Question, QuizSettings } from '@/lib/sanitize'

interface Props {
  questions: Question[]
  settings: QuizSettings
  onNodeSelect: (nodeData: QuizNodeData | null) => void
  onAddQuestion: () => void
}

const nodeTypes = { quizNode: QuizNode }

export function QuizCanvas({ questions, settings, onNodeSelect, onAddQuestion }: Props) {
  const initialNodes = useMemo(() => quizToNodes(questions, settings), [questions, settings])
  const initialEdges = useMemo(() => quizToEdges(questions, settings), [questions, settings])

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  const onSelectionChange: OnSelectionChangeFunc = useCallback(({ nodes: selectedNodes }) => {
    if (selectedNodes.length === 1) {
      onNodeSelect(selectedNodes[0].data as QuizNodeData)
    } else {
      onNodeSelect(null)
    }
  }, [onNodeSelect])

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#e2e8f0" gap={20} size={1} />
        <Controls position="bottom-left" />
        <MiniMap
          position="bottom-right"
          nodeColor={(node) => {
            const data = node.data as QuizNodeData
            if (data.type === 'landing') return '#bfdbfe'
            if (data.type === 'lead-capture') return '#ddd6fe'
            if (data.type === 'question') return '#bbf7d0'
            if (data.type === 'result') return '#fde68a'
            return '#e2e8f0'
          }}
          style={{ borderRadius: 12 }}
        />
      </ReactFlow>

      {/* Floating add question button */}
      <button
        onClick={onAddQuestion}
        className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-xl bg-[#426a35] px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Adicionar Pergunta
      </button>
    </div>
  )
}
