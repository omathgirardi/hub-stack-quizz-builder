import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getQuizBySlug } from '@/lib/db/queries/quizzes'
import { QuizPlayer } from '@/components/quiz-player/QuizPlayer'
import type { Question, QuizSettings } from '@/lib/sanitize'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getQuiz(slug: string) {
  const quiz = await getQuizBySlug(slug)
  if (!quiz || quiz.status !== 'active') return null
  return quiz
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const quiz = await getQuiz(slug)
  if (!quiz) return { title: 'Quiz não encontrado' }

  const s = (quiz.settings as QuizSettings) || {}
  const title = s.headline?.replace(/<[^>]*>/g, '') || quiz.title
  const description = s.subheadline?.replace(/<[^>]*>/g, '') || 'Quiz interativo'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: s.landing_image ? [{ url: s.landing_image }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: s.landing_image ? [s.landing_image] : [],
    },
  }
}

export default async function QuizPage({ params }: PageProps) {
  const { slug } = await params
  const quiz = await getQuiz(slug)
  if (!quiz) notFound()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  return (
    <main className="flex min-h-screen items-start justify-center bg-gray-50 px-4 py-6">
      <QuizPlayer
        quiz={{
          id: quiz.id,
          title: quiz.title,
          questions: (quiz.questions as Question[]) || [],
          settings: (quiz.settings as QuizSettings) || {},
        }}
        apiBase={appUrl}
      />
    </main>
  )
}
