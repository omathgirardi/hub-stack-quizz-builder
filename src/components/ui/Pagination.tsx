'use client'
import { Button } from './Button'

interface PaginationProps {
  page: number
  total: number
  pageSize: number
  onChange: (p: number) => void
}

export function Pagination({ page, total, pageSize, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between text-sm text-gray-600">
      <span>
        Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} de {total}
      </span>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => onChange(page - 1)}>
          Anterior
        </Button>
        <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => onChange(page + 1)}>
          Próximo
        </Button>
      </div>
    </div>
  )
}
