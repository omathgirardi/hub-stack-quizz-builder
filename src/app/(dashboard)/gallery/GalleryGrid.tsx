'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface GalleryItem {
  id: string
  url: string
  name?: string | null
}

export function GalleryGrid({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems)

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta imagem da galeria?')) return
    
    await fetch('/api/gallery', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    })
    setItems(items.filter((i) => i.id !== id))
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => (
        <Card key={item.id} className="group relative overflow-hidden p-0">
          <img src={item.url} alt="" className="aspect-square w-full object-cover" />
          <div className="absolute inset-0 flex flex-col justify-end bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="p-3">
              <p className="mb-2 truncate text-xs text-white font-medium">{item.name || 'Sem nome'}</p>
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  className="h-8 w-full"
                  onClick={() => handleDelete(item.id)}
                >
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
