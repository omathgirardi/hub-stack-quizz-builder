import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { getDashboardStats } from '@/lib/db/queries/responses'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const stats = await getDashboardStats(userId)

  const bandColors: Record<string, string> = {
    leve: '#22c55e',
    moderada: '#f59e0b',
    moderada_avancada: '#f97316',
    avancada: '#ef4444',
  }

  const bandTotal = stats.bandStats.reduce((sum, b) => sum + b.count, 0)

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-gray-500">Total de Quizzes</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{stats.totalQuizzes}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-500">Total de Respostas</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{stats.totalResponses}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-500">Pontuação Média</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{stats.avgScore.toFixed(1)}</p>
        </Card>
      </div>

      {bandTotal > 0 && (
        <Card>
          <h2 className="mb-4 text-base font-semibold text-gray-800">Distribuição por Faixa</h2>
          <div className="space-y-3">
            {stats.bandStats.map((b) => {
              const pct = bandTotal > 0 ? Math.round((b.count / bandTotal) * 100) : 0
              const color = bandColors[b.resultBand ?? ''] ?? '#6b7280'
              return (
                <div key={b.resultBand} className="flex items-center gap-3">
                  <div className="w-28 truncate text-sm font-medium capitalize text-gray-700">
                    {b.resultBand?.replace(/_/g, ' ')}
                  </div>
                  <div className="flex-1 overflow-hidden rounded-full bg-gray-100 h-3">
                    <div
                      className="h-3 rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm text-gray-500">{pct}%</span>
                  <span className="w-10 text-right text-sm font-semibold text-gray-800">{b.count}</span>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
