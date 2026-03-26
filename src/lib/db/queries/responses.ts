import { eq, and, desc, gte, lte, sql, inArray } from 'drizzle-orm'
import { getDb } from '../index'
import { responses, quizzes } from '../schema'
import type { NewResponse } from '../schema'

export async function getResponses(filters: {
  userId: string
  quizId?: string
  resultBand?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}) {
  const db = getDb()
  const { userId, quizId, resultBand, dateFrom, dateTo, page = 1, pageSize = 50 } = filters

  const userQuizzes = db
    .select({ id: quizzes.id })
    .from(quizzes)
    .where(eq(quizzes.userId, userId))

  const conditions = [inArray(responses.quizId, userQuizzes)]
  if (quizId) conditions.push(eq(responses.quizId, quizId))
  if (resultBand) conditions.push(eq(responses.resultBand, resultBand))
  if (dateFrom) conditions.push(gte(responses.createdAt, new Date(dateFrom)))
  if (dateTo) conditions.push(lte(responses.createdAt, new Date(dateTo)))

  const offset = (page - 1) * pageSize

  const [rows, countResult] = await Promise.all([
    db
      .select({ response: responses, quizTitle: quizzes.title, quizQuestions: quizzes.questions })
      .from(responses)
      .innerJoin(quizzes, eq(responses.quizId, quizzes.id))
      .where(and(...conditions))
      .orderBy(desc(responses.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(responses)
      .innerJoin(quizzes, eq(responses.quizId, quizzes.id))
      .where(and(...conditions)),
  ])

  return { rows, total: countResult[0]?.count ?? 0 }
}

export async function getAllResponses(userId: string) {
  const db = getDb()
  const userQuizzes = db.select({ id: quizzes.id }).from(quizzes).where(eq(quizzes.userId, userId))
  return db
    .select({ response: responses, quizTitle: quizzes.title })
    .from(responses)
    .innerJoin(quizzes, eq(responses.quizId, quizzes.id))
    .where(inArray(responses.quizId, userQuizzes))
    .orderBy(desc(responses.createdAt))
}

export async function insertResponse(data: NewResponse) {
  const db = getDb()
  const result = await db.insert(responses).values(data).returning()
  return result[0]
}

export async function updateResponse(id: string, data: Partial<NewResponse>) {
  const db = getDb()
  const result = await db.update(responses).set(data).where(eq(responses.id, id)).returning()
  return result[0]
}

export async function deleteResponses(ids: string[]) {
  const db = getDb()
  await db.delete(responses).where(inArray(responses.id, ids))
}

export async function getDashboardStats(userId: string, dateStart?: string, dateEnd?: string) {
  const db = getDb()
  const userQuizzes = db.select({ id: quizzes.id }).from(quizzes).where(eq(quizzes.userId, userId))

  const conditions = [inArray(responses.quizId, userQuizzes)]
  if (dateStart) conditions.push(gte(responses.createdAt, new Date(dateStart)))
  if (dateEnd) conditions.push(lte(responses.createdAt, new Date(dateEnd)))

  const [stats, bandStats, totalQuizzes] = await Promise.all([
    db
      .select({
        totalResponses: sql<number>`count(*)::int`,
        avgScore: sql<number>`avg(${responses.score})::numeric(10,2)`,
      })
      .from(responses)
      .where(and(...conditions)),
    db
      .select({
        resultBand: responses.resultBand,
        count: sql<number>`count(*)::int`,
      })
      .from(responses)
      .where(and(...conditions))
      .groupBy(responses.resultBand),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(quizzes)
      .where(eq(quizzes.userId, userId)),
  ])

  return {
    totalResponses: stats[0]?.totalResponses ?? 0,
    avgScore: Number(stats[0]?.avgScore ?? 0),
    totalQuizzes: totalQuizzes[0]?.count ?? 0,
    bandStats,
  }
}

export async function getResultBandData(quizId: string) {
  const db = getDb()
  return db
    .select({
      resultBand: responses.resultBand,
      count: sql<number>`count(*)::int`,
    })
    .from(responses)
    .where(eq(responses.quizId, quizId))
    .groupBy(responses.resultBand)
}
