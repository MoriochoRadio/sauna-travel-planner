import type { PlannerInput, RegionData, Place, Preference } from "../data/schema";
import type { Course, Day, CourseStop } from "./course.schema";

const PRICE_BASE: Record<Place["priceLevel"], number> = { low: 12000, mid: 25000, high: 55000 };

// 취향 기반 가중 점수
function score(place: Place, prefs: Preference[]): number {
  let s = 1;
  if (typeof place.rating === "number") s += place.rating - 3; // 추천지수 반영 (저평점 장소 자연 감점)
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

// 배치 기록: used = 코스 전체에서 장소별 배치 횟수, today = 오늘 이미 넣은 장소
type Usage = { used: Map<string, number>; today: Set<string> };

function take(u: Usage, p: Place): Place {
  u.used.set(p.id, (u.used.get(p.id) ?? 0) + 1);
  u.today.add(p.id);
  return p;
}

// 후보 중 최고 점수를 고르되, 같은 날 이미 넣은 장소는 절대 다시 쓰지 않는다.
// 다른 날 쓴 장소는 재고가 모자랄 때만 — 가장 덜 쓴 곳부터 — 다시 쓴다.
// 오늘 쓸 수 있는 후보가 없으면 undefined (호출부가 "자유 식사"처럼 비워 둔다).
function pickBest(candidates: Place[], u: Usage, sortFn: (a: Place, b: Place) => number): Place | undefined {
  const available = candidates.filter((p) => !u.today.has(p.id));
  if (available.length === 0) return undefined;
  const minUse = Math.min(...available.map((p) => u.used.get(p.id) ?? 0));
  const pool = available.filter((p) => (u.used.get(p.id) ?? 0) === minUse);
  return take(u, [...pool].sort(sortFn)[0] ?? pick(pool));
}

// second 사우나처럼 "없으면 다른 카드로 대체"가 가능한 슬롯은 재사용을 허용하지 않는다.
function pickFreshOnly(candidates: Place[], u: Usage, sortFn: (a: Place, b: Place) => number): Place | undefined {
  const fresh = candidates.filter((p) => !u.used.has(p.id));
  if (fresh.length === 0) return undefined;
  return take(u, [...fresh].sort(sortFn)[0]);
}

// 시간대 템플릿 (도메인 규칙 R-1~R-4)
function buildDay(
  day: number,
  region: RegionData,
  prefs: Preference[],
  note: string | undefined,
  opts: { anchorSauna?: Place; onsenFocus?: boolean; includeLodging?: boolean; sigungu?: string; used: Map<string, number> }
): Day {
  const { anchorSauna, onsenFocus, includeLodging, sigungu } = opts;
  const u: Usage = { used: opts.used, today: new Set() };
  // 시군구 가중 (세부 지역 지정 시 해당 동네 장소 우선)
  const sigunguBoost = (p: Place) => (sigungu && p.sigungu === sigungu ? 5 : 0);
  // 핵심(사우나/온천/찜질방) 후보 — 선택 사우나 제외
  const saunaLike = region.places.filter(
    (p) => ["sauna", "jjimjilbang", "spa"].includes(p.type) && p.id !== anchorSauna?.id
  );
  // 온천 중심 모드: spa(온천) 우선 정렬
  const sortCore = (a: Place, b: Place) => {
    if (onsenFocus) {
      const aO = a.type === "spa" ? 2 : 0;
      const bO = b.type === "spa" ? 2 : 0;
      if (aO !== bO) return bO - aO;
    }
    return score(b, prefs) + sigunguBoost(b) - (score(a, prefs) + sigunguBoost(a));
  };
  const restaurants = region.places.filter((p) => p.type === "restaurant");
  const attractions = region.places.filter((p) => p.type === "attraction");
  const sortByPref = (a: Place, b: Place) => score(b, prefs) + sigunguBoost(b) - (score(a, prefs) + sigunguBoost(a));

  // 첫 stop = 선택 사우나(있으면), 없으면 점수 높은 핵심(다른 날 이미 쓴 곳은 최대한 배제)
  let first: Place | undefined;
  if (anchorSauna) {
    first = take(u, anchorSauna);
  } else {
    first = pickBest(saunaLike, u, sortCore);
  }
  // 둘째 사우나: 위에서 고른 first와 절대 겹치지 않게 — 후보가 없으면 완충 스팟으로 대체
  const second = pickFreshOnly(saunaLike, u, sortCore);
  // 점심과 저녁은 같은 식당이 될 수 없다. 식당이 모자라면 한 끼는 자유 식사로 비워 둔다.
  const lunch = pickBest(restaurants, u, sortByPref);
  const dinner = pickBest(restaurants, u, sortByPref);
  // 볼거리는 둘째 사우나가 없을 때만 실제로 배치하므로 그때만 고른다 (안 쓴 곳을 쓴 것으로 세지 않게)
  const attraction = second ? undefined : pickBest(attractions, u, sortByPref);
  const freeMeal = restaurants.length > 0
    ? "추천 맛집은 다른 끼니에 넣었어요. 이번 끼니는 근처에서 자유롭게 골라 보세요."
    : "근처에서 자유롭게 골라 보세요.";
  // 숙소 추천: includeLodging이거나 다일차(2일+) 여행이면 마지막에 배치
  // 온천/사우나 보유 숙소 우선, 없으면 일반 숙소도 포함(카카오 호텔 대부분 플래그 없음)
  const wantLodging = includeLodging || day >= 2;
  const lodgings = wantLodging ? region.places.filter((p) => p.type === "lodging") : [];
  const lodging = lodgings.length
    ? [...lodgings].sort((a, b) => {
        const aO = a.hasOnsen || a.hasSauna ? 2 : 0;
        const bO = b.hasOnsen || b.hasSauna ? 2 : 0;
        if (aO !== bO) return bO - aO;
        return score(b, prefs) + sigunguBoost(b) - (score(a, prefs) + sigunguBoost(a));
      })[(day - 1) % lodgings.length]
    : undefined;

  const stops: CourseStop[] = [
    {
      time: "10:00",
      placeId: first?.id,
      title: first?.name ?? "사우나",
      reason: anchorSauna
        ? `${anchorSauna.name}에서 하루를 시작하는 힐링`
        : `${first?.name ?? "사우나"}에서 하루를 시작하는 힐링`,
      tip: "입욕 전 수분을 챙기세요.",
    },
    {
      time: "13:00",
      placeId: lunch?.id,
      title: lunch?.name ?? "자유 식사",
      reason: lunch ? "사우나 전 가볍게 든든한 한 끼" : freeMeal,
    },
    {
      time: "15:00",
      placeId: second?.id ?? attraction?.id,
      title: second?.name ?? attraction?.name ?? "볼거리",
      reason: second ? `이어서 ${second.name}에서 하루를 이어가요` : "사우나 사이 완충 겸 산책",
      tip: note?.includes("차 없음") ? "대중교통 동선을 확인하세요." : undefined,
    },
    {
      time: "18:00",
      placeId: dinner?.id,
      title: dinner?.name ?? "자유 식사",
      reason: dinner ? "하루 마무리 보양 식사" : freeMeal,
    },
  ];

  // 숙소 추천이 있으면 마지막에 추가
  if (lodging) {
    stops.push({
      time: "21:00",
      placeId: lodging.id,
      title: lodging.name,
      reason: `온천·사우나 완비 숙소에서 하루 마무리 (${lodging.hasOnsen ? "온천" : "사우나"} 보유)`,
      tip: "숙소 온천은 밤에도 운영되는지 확인하세요.",
    });
  }

  const theme = anchorSauna
    ? `${anchorSauna.name} 중심 코스`
    : onsenFocus
    ? "온천 중심 힐링"
    : prefs.includes("premium")
    ? "프리미엄 온천 힐링"
    : prefs.includes("budget")
    ? "가성비 사우나 여행"
    : prefs.includes("outdoor_spa")
    ? "야외 온천 중심 코스"
    : "균형 잡힌 사우나 여행";

  return { day, theme, stops };
}

export function fallbackCourse(input: PlannerInput, region: RegionData): Course {
  const anchorSauna = input.anchorSaunaId
    ? region.places.find((p) => p.id === input.anchorSaunaId)
    : undefined;
  const days: Day[] = [];
  const used = new Map<string, number>(); // 날짜를 넘나드는 중복 배치 방지(같은 사우나·맛집 재등장 억제)
  for (let d = 1; d <= input.days; d++) {
    days.push(
      buildDay(d, region, input.preferences, input.note, {
        anchorSauna: d === 1 ? anchorSauna : undefined, // 선택 사우나는 1일차에 고정
        onsenFocus: input.onsenFocus,
        includeLodging: input.includeLodging,
        sigungu: input.sigungu,
        used,
      })
    );
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
    summary: anchorSauna
      ? `${input.days}일간 ${anchorSauna.name}을 중심으로 사우나·온천을 즐기며, 수분 500ml를 챙기세요.`
      : `${input.days}일간 하루 1회 사우나·온천을 중심으로, 수분 500ml를 챙기며 여유롭게 즐겨보세요.`,
  };
}
