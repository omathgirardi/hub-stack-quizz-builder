import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getQuizById } from '@/lib/db/queries/quizzes'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const quiz = await getQuizById(id, userId)
  if (!quiz) return Response.json({ error: 'Not found' }, { status: 404 })

  const exportData = { v: 1, title: quiz.title, questions: quiz.questions, settings: quiz.settings }
  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="quiz-${quiz.id}.json"`,
    },
  })
}
