'use client'
import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface GalleryItem {
  id: string
  url: string
  name?: string
}

interface GalleryModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string) => void
}

export function GalleryModal({ isOpen, onClose, onSelect }: GalleryModalProps) {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetch('/api/gallery')
        .then((r) => r.json())
        .then((data) => {
          setItems(Array.isArray(data) ? data : [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [isOpen])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Excluir esta imagem?')) return
    await fetch('/api/gallery', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    })
    setItems(items.filter((item) => item.id !== id))
  }

  return (
    <Modal open={isOpen} onClose={onClose} title="Minha Galeria">
      <div className="space-y-4">
        {loading ? (
          <p className="py-8 text-center text-gray-500">Carregando...</p>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-gray-500">Nenhuma imagem na galeria ainda.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 overflow-y-auto max-h-[400px] p-1">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item.url)
                  onClose()
                }}
                className="group relative cursor-pointer overflow-hidden rounded-lg border-2 border-transparent hover:border-primary"
              >
                <img src={item.url} alt="" className="aspect-square w-full object-cover" />
                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </Modal>
  )
}
