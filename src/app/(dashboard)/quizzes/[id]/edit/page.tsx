import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { getQuizById, updateQuiz } from '@/lib/db/queries/quizzes'
import { BuilderLayout } from '@/components/builder/BuilderLayout'

export const runtime = 'edge'

export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const quiz = await getQuizById(id, userId)
  if (!quiz) notFound()

  async function handleUpdate(title: string, questions: unknown[], settings: unknown) {
    'use server'
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    await updateQuiz(id, userId, {
      title,
      questions: questions as never,
      settings: settings as never,
    })
    redirect('/quizzes')
  }

  return (
    <BuilderLayout
      quiz={{
        id: quiz.id,
        title: quiz.title,
        questions: (quiz.questions as unknown[]) ?? [],
        settings: (quiz.settings as Record<string, unknown>) ?? {},
      }}
      onSave={handleUpdate}
    />
  )
}
