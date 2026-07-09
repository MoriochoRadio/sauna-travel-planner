import type { PlannerInput, RegionData, Place, Preference } from "../data/schema";
import type { Course, Day, CourseStop } from "./course.schema";

const PRICE_BASE: Record<Place["priceLevel"], number> = { low: 12000, mid: 25000, high: 55000 };

// 취향 기반 가중 점수
function score(place: Place, prefs: Preference[]): number {
  let s = 1;
  if (prefs.includes("budget")) {
    if (place.priceLevel === "low") s += 2;
    if (place.priceLevel === "high") s -= 2;
  }
  if (prefs.includes("premium") && place.priceLevel === "high") s += 2;
  if (prefs.includes("outdoor_spa") && place.tags.includes("야외온천")) s += 3;
  if (prefs.includes("family") && place.tags.includes("가족")) s += 2;
  if (prefs.includes("quiet") && place.tags.includes("조용한")) s += 2;
  if (prefs.includes("solo") && place.tags.includes("혼자")) s += 2;
  if (prefs.includes("foodie") && place.type === "restaurant") s += 1;
  return s;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 시간대 템플릿 (도메인 규칙 R-1~R-4)
function buildDay(day: number, region: RegionData, prefs: Preference[], note?: string): Day {
  const saunaLike = region.places.filter((p) => ["sauna", "jjimjilbang", "spa"].includes(p.type));
  const restaurants = region.places.filter((p) => p.type === "restaurant");
  const attractions = region.places.filter((p) => p.type === "attraction");

  const sauna = [...saunaLike].sort((a, b) => score(b, prefs) - score(a, prefs))[0] ?? pick(saunaLike);
  const lunch = [...restaurants].sort((a, b) => score(b, prefs) - score(a, prefs))[0] ?? pick(restaurants);
  const dinner = [...restaurants].sort((a, b) => score(b, prefs) - score(a, prefs))[1] ?? pick(restaurants);
  const attraction = [...attractions].sort((a, b) => score(b, prefs) - score(a, prefs))[0] ?? pick(attractions);

  const stops: CourseStop[] = [
    {
      time: "10:00",
      placeId: sauna?.id,
      title: sauna?.name ?? "사우나",
      reason: `${sauna?.name ?? "사우나"}에서 하루를 시작하는 힐링`,
      tip: "입욕 전 수분을 챙기세요.",
    },
    {
      time: "13:00",
      placeId: lunch?.id,
      title: lunch?.name ?? "점심",
      reason: "사우나 전 가볍게 든든한 한 끼",
    },
    {
      time: "15:00",
      placeId: attraction?.id,
      title: attraction?.name ?? "볼거리",
      reason: "사우나 사이 완충 겸 산책",
      tip: note?.includes("차 없음") ? "대중교통 동선을 확인하세요." : undefined,
    },
    {
      time: "18:00",
      placeId: dinner?.id,
      title: dinner?.name ?? "저녁",
      reason: "하루 마무리 보양 식사",
    },
  ];

  const theme = prefs.includes("premium")
    ? "프리미엄 온천 힐링"
    : prefs.includes("budget")
    ? "가성비 사우나 여행"
    : prefs.includes("outdoor_spa")
    ? "야외 온천 중심 코스"
    : "균형 잡힌 사우나 여행";

  return { day, theme, stops };
}

export function fallbackCourse(input: PlannerInput, region: RegionData): Course {
  const days: Day[] = [];
  for (let d = 1; d <= input.days; d++) {
    days.push(buildDay(d, region, input.preferences, input.note));
  }

  // 예상 비용: 선택된 장소 기준 1인 합산
  let cost = 0;
  region.places.forEach((p) => {
    if (days.some((dd) => dd.stops.some((s) => s.placeId === p.id))) cost += PRICE_BASE[p.priceLevel];
  });

  return {
    region: region.name,
    days,
    estCostKrw: cost,
    summary: `${input.days}일간 하루 1회 사우나·온천을 중심으로, 수분 500ml를 챙기며 여유롭게 즐겨보세요.`,
  };
}
