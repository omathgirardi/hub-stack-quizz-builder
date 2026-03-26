import { NextRequest } from 'next/server'
import { getQuizById } from '@/lib/db/queries/quizzes'
import { corsResponse, corsOptionsResponse } from '@/lib/cors'

export const runtime = 'edge'

export async function OPTIONS() {
  return corsOptionsResponse()
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const quiz = await getQuizById(id)
  if (!quiz) return corsResponse({ error: 'Quiz not found' }, { status: 404 })
  if (quiz.status !== 'active') return corsResponse({ error: 'Quiz inactive' }, { status: 403 })

  return corsResponse({
    id: quiz.id,
    title: quiz.title,
    questions: quiz.questions,
    settings: quiz.settings,
  })
}
