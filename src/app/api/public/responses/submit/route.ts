import { NextRequest } from 'next/server'
import { insertResponse, updateResponse } from '@/lib/db/queries/responses'
import { getQuizById } from '@/lib/db/queries/quizzes'
import { corsResponse, corsOptionsResponse } from '@/lib/cors'
import { rateLimitByIp } from '@/lib/rate-limit'
import type { BandSettings } from '@/lib/sanitize'


export async function OPTIONS() {
  return corsOptionsResponse()
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  if (!rateLimitByIp(ip)) {
    return corsResponse({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.quizId) return corsResponse({ error: 'Missing quizId' }, { status: 400 })

  const quiz = await getQuizById(body.quizId)
  if (!quiz) return corsResponse({ error: 'Quiz not found' }, { status: 404 })

  const settings = quiz.settings as { results?: Record<string, BandSettings> }
  const resultBand = body.resultBand ?? ''
  const bandData = settings?.results?.[resultBand] ?? null

  let saved
  if (body.responseId) {
    saved = await updateResponse(body.responseId, {
      leadName: body.leadName ?? '',
      leadEmail: body.leadEmail ?? '',
      whatsapp: body.whatsapp ?? '',
      score: body.score ?? 0,
      resultBand,
      answers: body.answers ?? [],
      source: body.source ?? '',
      ipAddress: ip,
      userAgent: req.headers.get('user-agent') ?? '',
    })
  } else {
    saved = await insertResponse({
      quizId: body.quizId,
      leadName: body.leadName ?? '',
      leadEmail: body.leadEmail ?? '',
      whatsapp: body.whatsapp ?? '',
      score: body.score ?? 0,
      resultBand,
      answers: body.answers ?? [],
      source: body.source ?? req.headers.get('referer') ?? '',
      ipAddress: ip,
      userAgent: req.headers.get('user-agent') ?? '',
    })
  }

  if (settings?.results && typeof (settings as Record<string, unknown>).webhook_url === 'string') {
    const webhookUrl = (settings as Record<string, unknown>).webhook_url as string
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response_id: saved.id, quiz_id: body.quizId, result_band: resultBand, score: body.score, lead_name: body.leadName, lead_email: body.leadEmail, whatsapp: body.whatsapp }),
      }).catch(() => {})
    }
  }

  return corsResponse({ response_id: saved.id, result: bandData })
}
