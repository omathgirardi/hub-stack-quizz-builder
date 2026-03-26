import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { deleteQuiz } from '@/lib/db/queries/quizzes'

export const runtime = 'edge'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  await deleteQuiz(id, userId)
  return Response.json({ ok: true })
}
