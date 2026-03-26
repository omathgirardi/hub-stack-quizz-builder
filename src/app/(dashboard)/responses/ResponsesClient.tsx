'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface Quiz { id: string; title: string }
interface Filters { quizId?: string; resultBand?: string; dateFrom?: string; dateTo?: string }

const BANDS = ['leve', 'moderada', 'moderada_avancada', 'avancada']

export function ResponsesClient({ quizzes, filters }: { quizzes: Quiz[]; filters: Filters }) {
  const router = useRouter()
  const sp = useSearchParams()
  const [quizId, setQuizId] = useState(filters.quizId ?? '')
  const [resultBand, setResultBand] = useState(filters.resultBand ?? '')
  const [dateFrom, setDateFrom] = useState(filters.dateFrom ?? '')
  const [dateTo, setDateTo] = useState(filters.dateTo ?? '')

  function applyFilters() {
    const params = new URLSearchParams(sp.toString())
    if (quizId) params.set('quizId', quizId); else params.delete('quizId')
    if (resultBand) params.set('resultBand', resultBand); else params.delete('resultBand')
    if (dateFrom) params.set('dateFrom', dateFrom); else params.delete('dateFrom')
    if (dateTo) params.set('dateTo', dateTo); else params.delete('dateTo')
    params.set('page', '1')
    router.push(`/responses?${params.toString()}`)
  }

  function clearFilters() {
    setQuizId(''); setResultBand(''); setDateFrom(''); setDateTo('')
    router.push('/responses')
  }

  return (
    <div className="mb-4 flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-4">
      <select value={quizId} onChange={(e) => setQuizId(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
        <option value="">Todos os quizzes</option>
        {quizzes.map((q) => <option key={q.id} value={q.id}>{q.title}</option>)}
      </select>
      <select value={resultBand} onChange={(e) => setResultBand(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
        <option value="">Todas as faixas</option>
        {BANDS.map((b) => <option key={b} value={b}>{b.replace(/_/g, ' ')}</option>)}
      </select>
      <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      <Button onClick={applyFilters} size="sm">Filtrar</Button>
      <Button onClick={clearFilters} variant="ghost" size="sm">Limpar</Button>
    </div>
  )
}
