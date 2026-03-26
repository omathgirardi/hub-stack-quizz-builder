import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getAllResponses } from '@/lib/db/queries/responses'


export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const sp = req.nextUrl.searchParams
  const rows = await getAllResponses(userId)

  const csvRows = [
    ['ID', 'Quiz', 'Nome', 'E-mail', 'WhatsApp', 'Faixa', 'Score', 'Fonte', 'Data'].join(','),
    ...rows.map(({ response: r, quizTitle }) =>
      [r.id, quizTitle, r.leadName, r.leadEmail, r.whatsapp, r.resultBand, r.score, r.source, r.createdAt?.toISOString()].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n')

  return new Response(csvRows, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="respostas.csv"',
    },
  })
}
