// IP별 간단 인메모리 rate-limit (Vercel Functions 핫 인스턴스에서 공유)
// 무료 티어 남용 방지 — IP당 1분에 10회
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const hits = new Map<string, { count: number; resetAt: number }>();

// fail-open: 내부 상태 이상 시에도 서비스 가용성을 우선해 허용
export function rateLimit(ip: string): boolean {
  // 신뢰 헤더를 못 얻은(unknown) 요청은 구분 불가하므로 차단하지 않음
  // (광범위 오탐 차단 방지 — 대신 Vercel이 신뢰 헤더를 항상 주입함)
  if (ip === "unknown") return true;
  try {
    const now = Date.now();
    const rec = hits.get(ip);
    if (!rec || now > rec.resetAt) {
      hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
      return true;
    }
    if (rec.count >= MAX_REQUESTS) return false;
    rec.count++;
    return true;
  } catch {
    return true;
  }
}

// Vercel은 조작 불가능한 신뢰 헤더를 제공: x-vercel-forwarded-for > x-real-ip
// 그 외 프록시 체인(x-forwarded-for)은 마지막 hop을 신뢰
export function clientIp(req: { headers: { get(name: string): string | null } }): string {
  const vercel = req.headers.get("x-vercel-forwarded-for");
  if (vercel) return vercel.split(",")[0]?.trim() || "unknown";
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",").pop()?.trim() || "unknown";
}
