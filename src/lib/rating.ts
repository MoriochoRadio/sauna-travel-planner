import type { Place } from "@/data/schema";

// 리뷰 평점 대체 지표: 카카오 API는 평점 미제공 → 자체 추천지수 산출
// 항목: 가성비(priceLevel), 온천/사우나 보유, 핵심 카테고리(tag), 정보완성도(주소/전화/홈페이지)
export function computeRating(p: Partial<Place>): number {
  let score = 3.0; // 기본

  // 가성비 가산
  if (p.priceLevel === "low") score += 0.8;
  else if (p.priceLevel === "mid") score += 0.3;
  else if (p.priceLevel === "high") score -= 0.3;

  // 온천/사우나 시설 보유 가산
  if (p.hasOnsen) score += 0.7;
  if (p.hasSauna) score += 0.4;

  // 핵심 태그 가산
  const tags = p.tags ?? [];
  if (tags.some((t) => ["황토", "족욕", "노천", "한방", "가성비", "뷰맛"].includes(t))) score += 0.4;
  if (tags.some((t) => ["인스타", "핫플", "신규", "프리미엄"].includes(t))) score += 0.2;

  // 정보 완성도 가산 (신뢰도)
  if (p.address) score += 0.2;
  if (p.tel) score += 0.15;
  if (p.homepage) score += 0.1;
  if (p.lat && p.lng) score += 0.15;

  // 실시간 데이터(kakao/tourapi)는 신뢰도 높음
  if (p.source === "kakao" || p.source === "tourapi") score += 0.3;

  return Math.max(0, Math.min(5, Math.round(score * 10) / 10));
}

// 코스 내 장소 정렬 (추천지수 내림차순)
export function sortByRating<T extends Partial<Place>>(places: T[]): T[] {
  return [...places].sort((a, b) => computeRating(b) - computeRating(a));
}
