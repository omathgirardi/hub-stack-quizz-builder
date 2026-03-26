import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getGalleryByUser } from '@/lib/db/queries/gallery'
import { Card } from '@/components/ui/Card'
import { GalleryGrid } from './GalleryGrid'

export default async function GalleryPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  let items = []
  try {
    items = await getGalleryByUser(userId)
  } catch (error) {
    console.error('Erro ao buscar galeria:', error)
    return (
      <div className="p-8">
        <Card className="py-16 text-center border-red-200 bg-red-50">
          <p className="text-red-600 font-medium">Erro ao carregar galeria.</p>
          <p className="text-sm text-red-500 mt-1">Por favor, tente novamente em instantes.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Galeria de Imagens</h1>
          <p className="text-sm text-gray-500">Gerencie as imagens que você subiu para seus quizzes.</p>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-gray-500">Sua galeria está vazia.</p>
          <p className="text-sm text-gray-400 mt-1">Imagens que você subir no builder aparecerão aqui.</p>
        </Card>
      ) : (
        <GalleryGrid initialItems={items} />
      )}
    </div>
  )
}
