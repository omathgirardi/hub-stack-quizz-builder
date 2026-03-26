import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getQuizzesByUser } from '@/lib/db/queries/quizzes'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { QuizzesActions } from './QuizzesActions'


export default async function QuizzesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const quizzes = await getQuizzesByUser(userId)

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
        <Link href="/quizzes/new">
          <Button>+ Novo Quiz</Button>
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-gray-500">Nenhum quiz criado ainda.</p>
          <Link href="/quizzes/new" className="mt-3 inline-block">
            <Button>Criar meu primeiro quiz</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((q) => (
            <Card key={q.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold text-gray-900 line-clamp-2">{q.title}</h2>
                <Badge color={q.status === 'active' ? 'green' : 'gray'}>
                  {q.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">{q.responseCount} respostas</p>
              <div className="mt-auto flex flex-wrap gap-2">
                <Link href={`/quizzes/${q.id}/edit`}>
                  <Button variant="secondary" size="sm">Editar</Button>
                </Link>
                <QuizzesActions quiz={q} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
