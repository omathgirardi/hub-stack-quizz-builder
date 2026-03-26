import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { getQuizById, updateQuiz } from '@/lib/db/queries/quizzes'
import { BuilderModeSwitch } from '@/components/builder/BuilderModeSwitch'


export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const quiz = await getQuizById(id, userId)
  if (!quiz) notFound()

  async function handleUpdate(title: string, questions: unknown[], settings: unknown, slug?: string) {
    'use server'
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    await updateQuiz(id, userId, {
      title,
      slug: slug || null,
      questions: questions as never,
      settings: settings as never,
    })
  }

  const quizData = {
    id: quiz.id,
    title: quiz.title,
    slug: quiz.slug ?? undefined,
    questions: (quiz.questions as unknown[]) ?? [],
    settings: (quiz.settings as Record<string, unknown>) ?? {},
  }

  return (
    <BuilderModeSwitch
      quiz={quizData}
      onSave={handleUpdate}
    />
  )
}
