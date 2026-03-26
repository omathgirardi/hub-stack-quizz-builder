import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getGalleryByUser, addToGallery, deleteFromGallery } from '@/lib/db/queries/gallery'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await getGalleryByUser(userId)
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url, name } = await req.json()
  if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

  const item = await addToGallery(userId, url, name)
  return NextResponse.json(item)
}

export async function DELETE(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

  await deleteFromGallery(id, userId)
  return NextResponse.json({ success: true })
}
