'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export function ImportQuizButton() {
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const content = await file.text()
      const data = JSON.parse(content)

      const res = await fetch('/api/quizzes/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Erro ao importar quiz')

      const { id } = await res.json()
      router.push(`/quizzes/${id}/edit`)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao importar')
    } finally {
      setLoading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <>
      <input
        type="file"
        accept=".json"
        className="hidden"
        ref={fileRef}
        onChange={handleImport}
      />
      <Button
        variant="secondary"
        onClick={() => fileRef.current?.click()}
        loading={loading}
      >
        📥 Importar Quiz
      </Button>
    </>
  )
}
