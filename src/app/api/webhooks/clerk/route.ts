import { NextRequest } from 'next/server'


export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  // Sincronização de usuários Clerk — expandir conforme necessidade
  console.log('[clerk-webhook]', body?.type)
  return Response.json({ ok: true })
}
