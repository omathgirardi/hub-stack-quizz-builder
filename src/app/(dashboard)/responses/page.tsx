import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getResponses } from '@/lib/db/queries/responses'
import { getQuizzesByUser } from '@/lib/db/queries/quizzes'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { ResponsesClient } from './ResponsesClient'
import { ResponseRow } from './ResponseRow'


interface SearchParams {
  quizId?: string
  resultBand?: string
  dateFrom?: string
  dateTo?: string
  page?: string
}

export default async function ResponsesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const page = Number(sp.page ?? 1)
  const [{ rows, total }, quizzes] = await Promise.all([
    getResponses({ userId, quizId: sp.quizId, resultBand: sp.resultBand, dateFrom: sp.dateFrom, dateTo: sp.dateTo, page, pageSize: 50 }),
    getQuizzesByUser(userId),
  ])

  const bandColor: Record<string, 'green' | 'yellow' | 'red' | 'purple'> = {
    leve: 'green',
    moderada: 'yellow',
    moderada_avancada: 'red',
    avancada: 'purple',
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Respostas</h1>
        <a
          href={`/api/responses/export?quizId=${sp.quizId ?? ''}&resultBand=${sp.resultBand ?? ''}&dateFrom=${sp.dateFrom ?? ''}&dateTo=${sp.dateTo ?? ''}`}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ⬇ Exportar CSV
        </a>
      </div>

      <ResponsesClient quizzes={quizzes.map((q) => ({ id: q.id, title: q.title }))} filters={{ quizId: sp.quizId, resultBand: sp.resultBand, dateFrom: sp.dateFrom, dateTo: sp.dateTo }} />

      <Card padding={false} className="mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Nome</th>
              <th className="px-4 py-3 text-left">E-mail</th>
              <th className="px-4 py-3 text-left">WhatsApp</th>
              <th className="px-4 py-3 text-left">Faixa</th>
              <th className="px-4 py-3 text-left">Score</th>
              <th className="px-4 py-3 text-left">Quiz</th>
              <th className="px-4 py-3 text-left">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  Nenhuma resposta encontrada.
                </td>
              </tr>
            ) : (
              rows.map(({ response: r, quizTitle, quizQuestions }) => (
                <ResponseRow
                  key={r.id}
                  r={r}
                  quizTitle={quizTitle}
                  quizQuestions={quizQuestions}
                  bandColor={bandColor}
                />
              ))
            )}
          </tbody>
        </table>
      </Card>

      <div className="mt-4 text-sm text-gray-500">
        Total: <strong>{total}</strong> respostas
      </div>
    </div>
  )
}
