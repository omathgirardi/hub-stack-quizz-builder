'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface Quiz {
  id: string
  title: string
}

export function QuizzesActions({ quiz }: { quiz: Quiz }) {
  const [showEmbed, setShowEmbed] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const embedCode = `<script src="${process.env.NEXT_PUBLIC_APP_URL ?? ''}/embed/${quiz.id}.js"></script>`

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/quizzes/${quiz.id}`, { method: 'DELETE' })
    setDeleting(false)
    setShowDelete(false)
    router.refresh()
  }

  function handleCopy() {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setShowEmbed(true)}>
        {'</>'}  Embed
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setShowDelete(true)}>
        🗑
      </Button>

      <Modal open={showEmbed} onClose={() => setShowEmbed(false)} title="Código de Embed">
        <p className="mb-3 text-sm text-gray-600">
          Cole este script no HTML do seu site (ex: Widget HTML do Elementor):
        </p>
        <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-green-400">
          {embedCode}
        </pre>
        <Button onClick={handleCopy} variant="secondary" className="w-full">
          {copied ? '✓ Copiado!' : 'Copiar'}
        </Button>
      </Modal>

      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Excluir Quiz">
        <p className="mb-6 text-gray-600">
          Tem certeza que deseja excluir <strong>{quiz.title}</strong>? Todas as respostas serão perdidas.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowDelete(false)} className="flex-1">
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting} className="flex-1">
            Excluir
          </Button>
        </div>
      </Modal>
    </>
  )
}
