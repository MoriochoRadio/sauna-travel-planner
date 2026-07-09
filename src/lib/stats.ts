// 가벼운 모니터링: 폴백 발생 횟수 집계 (무료, 외부 서비스 불필요)
// Vercel Functions 핫 인스턴스 메모리에 누적됨 (운영 참고용)
const stats = { total: 0, fallback: 0 };

export function recordGeneration(usedFallback: boolean) {
  stats.total++;
  if (usedFallback) stats.fallback++;
}

export function getStats() {
  return {
    ...stats,
    fallbackRate: stats.total ? Math.round((stats.fallback / stats.total) * 100) : 0,
  };
}
