import type { Node, Edge } from '@xyflow/react'
import type { Question, QuizSettings } from '@/lib/sanitize'

export interface QuizNodeData extends Record<string, unknown> {
  type: 'landing' | 'lead-capture' | 'question' | 'result'
  label: string
  questionIndex?: number
  question?: Question
  settings?: QuizSettings
  bandKey?: string
}

const NODE_WIDTH = 240
const NODE_GAP_Y = 100
const NODE_START_X = 100
const NODE_START_Y = 50

export function quizToNodes(
  questions: Question[],
  settings: QuizSettings,
): Node<QuizNodeData>[] {
  const nodes: Node<QuizNodeData>[] = []
  let y = NODE_START_Y

  // Landing node
  nodes.push({
    id: 'landing',
    type: 'quizNode',
    position: { x: NODE_START_X, y },
    data: {
      type: 'landing',
      label: settings.show_landing ? '🏠 Capa' : '🏠 Capa (desativada)',
      settings,
    },
  })
  y += NODE_GAP_Y

  // Lead capture node
  const hasLead = !!(settings.name_capture || settings.email_capture || settings.whatsapp_capture)
  nodes.push({
    id: 'lead',
    type: 'quizNode',
    position: { x: NODE_START_X, y },
    data: {
      type: 'lead-capture',
      label: hasLead ? '📋 Captura de Lead' : '📋 Lead (desativado)',
      settings,
    },
  })
  y += NODE_GAP_Y

  // Question nodes
  questions.forEach((q, i) => {
    nodes.push({
      id: `question-${i}`,
      type: 'quizNode',
      position: { x: NODE_START_X, y },
      data: {
        type: 'question',
        label: `${q.icon || '❓'} P${i + 1}: ${q.question?.slice(0, 30) || 'Sem texto'}${(q.question?.length || 0) > 30 ? '...' : ''}`,
        questionIndex: i,
        question: q,
      },
    })
    y += NODE_GAP_Y
  })

  // Result nodes (one per band)
  const bands = ['leve', 'moderada', 'moderada_avancada', 'avancada'] as const
  const bandEmojis: Record<string, string> = { leve: '🟡', moderada: '🟠', moderada_avancada: '🔴', avancada: '⛔' }

  // Place result nodes side by side
  const resultStartX = NODE_START_X - (bands.length * (NODE_WIDTH + 20)) / 2 + NODE_WIDTH / 2
  bands.forEach((band, i) => {
    const bandSettings = settings.results?.[band]
    nodes.push({
      id: `result-${band}`,
      type: 'quizNode',
      position: { x: resultStartX + i * (NODE_WIDTH + 20), y },
      data: {
        type: 'result',
        label: `${bandEmojis[band]} ${bandSettings?.label || band}`,
        bandKey: band,
        settings,
      },
    })
  })

  return nodes
}

export function quizToEdges(questions: Question[], settings: QuizSettings): Edge[] {
  const edges: Edge[] = []

  // Landing -> Lead
  edges.push({
    id: 'e-landing-lead',
    source: 'landing',
    target: 'lead',
    animated: true,
    style: { stroke: '#426a35' },
  })

  // Lead -> first question
  if (questions.length > 0) {
    edges.push({
      id: 'e-lead-q0',
      source: 'lead',
      target: 'question-0',
      animated: true,
      style: { stroke: '#426a35' },
    })
  }

  // Question -> next question
  for (let i = 0; i < questions.length - 1; i++) {
    edges.push({
      id: `e-q${i}-q${i + 1}`,
      source: `question-${i}`,
      target: `question-${i + 1}`,
      animated: true,
      style: { stroke: '#426a35' },
    })
  }

  // Last question -> all result bands
  if (questions.length > 0) {
    const lastQ = `question-${questions.length - 1}`
    const bands = ['leve', 'moderada', 'moderada_avancada', 'avancada']
    bands.forEach((band) => {
      edges.push({
        id: `e-last-${band}`,
        source: lastQ,
        target: `result-${band}`,
        style: { stroke: '#94a3b8' },
      })
    })
  }

  return edges
}
