import { pgTable, uuid, text, integer, jsonb, timestamp, index } from 'drizzle-orm/pg-core'

export const quizzes = pgTable('quizzes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  questions: jsonb('questions').notNull().default([]),
  settings: jsonb('settings').notNull().default({}),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
  userIdIdx: index('idx_quizzes_user_id').on(t.userId),
}))

export const responses = pgTable('responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  quizId: uuid('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  leadName: text('lead_name').default(''),
  leadEmail: text('lead_email').default(''),
  whatsapp: text('whatsapp').default(''),
  score: integer('score').default(0),
  resultBand: text('result_band').default(''),
  answers: jsonb('answers').default([]),
  ipAddress: text('ip_address').default(''),
  userAgent: text('user_agent').default(''),
  source: text('source').default(''),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => ({
  quizIdIdx: index('idx_responses_quiz_id').on(t.quizId),
  resultBandIdx: index('idx_responses_result_band').on(t.resultBand),
  createdAtIdx: index('idx_responses_created_at').on(t.createdAt),
}))

export const gallery = pgTable('gallery', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  url: text('url').notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => ({
  userIdIdx: index('idx_gallery_user_id').on(t.userId),
}))

export type Quiz = typeof quizzes.$inferSelect
export type NewQuiz = typeof quizzes.$inferInsert
export type Response = typeof responses.$inferSelect
export type NewResponse = typeof responses.$inferInsert
