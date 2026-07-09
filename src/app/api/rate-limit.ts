// IP별 간단 인메모리 rate-limit (Vercel Functions 핫 인스턴스에서 공유)
// 무료 티어 남용 방지 — IP당 1분에 5회
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now > rec.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (rec.count >= MAX_REQUESTS) return false;
  rec.count++;
  return true;
}

export function clientIp(req: { headers: { get(name: string): string | null } }): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || "unknown";
}
