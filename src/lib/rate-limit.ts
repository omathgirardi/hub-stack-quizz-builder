const ipMap = new Map<string, { count: number; resetAt: number }>()

export function rateLimitByIp(ip: string, limit = 100, windowMs = 60 * 60 * 1000): boolean {
  const now = Date.now()
  const entry = ipMap.get(ip)

  if (!entry || now > entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false
  entry.count++
  return true
}
