import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createQuiz } from '@/lib/db/queries/quizzes'
import { BuilderLayout } from '@/components/builder/BuilderLayout'


export default async function NewQuizPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  async function handleCreate(title: string, questions: unknown[], settings: unknown) {
    'use server'
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    const quiz = await createQuiz({
      userId,
      title,
      questions: questions as never,
      settings: settings as never,
    })
    redirect(`/quizzes/${quiz.id}/edit`)
  }

  return <BuilderLayout onSave={handleCreate} />
}
