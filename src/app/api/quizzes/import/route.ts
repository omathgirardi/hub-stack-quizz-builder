import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createQuiz } from '@/lib/db/queries/quizzes'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body?.title) return Response.json({ error: 'Invalid JSON' }, { status: 400 })

  const quiz = await createQuiz({
    userId,
    title: `${body.title} (Importado)`,
    questions: body.questions ?? [],
    settings: body.settings ?? {},
  })

  return Response.json({ id: quiz.id })
}
