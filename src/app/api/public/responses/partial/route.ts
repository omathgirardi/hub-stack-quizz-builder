import { NextRequest } from 'next/server'
import { insertResponse, updateResponse } from '@/lib/db/queries/responses'
import { corsResponse, corsOptionsResponse } from '@/lib/cors'


export async function OPTIONS() {
  return corsOptionsResponse()
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.quizId) return corsResponse({ error: 'Missing quizId' }, { status: 400 })

  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'

  let saved
  if (body.responseId) {
    saved = await updateResponse(body.responseId, { answers: body.answers ?? [] })
  } else {
    saved = await insertResponse({
      quizId: body.quizId,
      answers: body.answers ?? [],
      source: req.headers.get('referer') ?? '',
      ipAddress: ip,
      userAgent: req.headers.get('user-agent') ?? '',
    })
  }

  return corsResponse({ response_id: saved.id })
}
