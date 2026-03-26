import { eq, desc, and } from 'drizzle-orm'
import { getDb } from '../index'
import { gallery } from '../schema'

export async function getGalleryByUser(userId: string) {
  const db = getDb()
  return db.select().from(gallery).where(eq(gallery.userId, userId)).orderBy(desc(gallery.createdAt))
}

export async function addToGallery(userId: string, url: string, name?: string) {
  const db = getDb()
  const result = await db.insert(gallery).values({ userId, url, name }).returning()
  return result[0]
}

export async function deleteFromGallery(id: string, userId: string) {
  const db = getDb()
  await db.delete(gallery).where(and(eq(gallery.id, id), eq(gallery.userId, userId)))
}
