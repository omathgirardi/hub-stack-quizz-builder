import { eq, and, desc, sql } from 'drizzle-orm'
import { getDb } from '../index'
import { quizzes, responses } from '../schema'
import type { NewQuiz } from '../schema'

export async function getQuizzesByUser(userId: string) {
  const db = getDb()
  const result = await db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      status: quizzes.status,
      createdAt: quizzes.createdAt,
      updatedAt: quizzes.updatedAt,
      responseCount: sql<number>`count(${responses.id})::int`,
    })
    .from(quizzes)
    .leftJoin(responses, eq(responses.quizId, quizzes.id))
    .where(eq(quizzes.userId, userId))
    .groupBy(quizzes.id)
    .orderBy(desc(quizzes.createdAt))
  return result
}

export async function getQuizById(id: string, userId?: string) {
  const db = getDb()
  const conditions = userId
    ? and(eq(quizzes.id, id), eq(quizzes.userId, userId))
    : eq(quizzes.id, id)
  const result = await db.select().from(quizzes).where(conditions).limit(1)
  return result[0] ?? null
}

export async function createQuiz(data: NewQuiz) {
  const db = getDb()
  const result = await db.insert(quizzes).values(data).returning()
  return result[0]
}

export async function updateQuiz(id: string, userId: string, data: Partial<NewQuiz>) {
  const db = getDb()
  const result = await db
    .update(quizzes)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(quizzes.id, id), eq(quizzes.userId, userId)))
    .returning()
  return result[0]
}

export async function deleteQuiz(id: string, userId: string) {
  const db = getDb()
  await db.delete(quizzes).where(and(eq(quizzes.id, id), eq(quizzes.userId, userId)))
}

export async function getAllQuizzes() {
  const db = getDb()
  return db.select().from(quizzes).orderBy(desc(quizzes.createdAt))
}
