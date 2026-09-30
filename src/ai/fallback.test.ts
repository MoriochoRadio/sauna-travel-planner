import { describe, it, expect } from "vitest";
import { fallbackCourse } from "./fallback";
import { getRegion, regions } from "../data/seed";
import type { PlannerInput } from "../data/schema";

const base: PlannerInput = {
  region: "gangwon",
  days: 1,
  preferences: [],
  onsenFocus: false,
  includeLodging: true,
};

describe("fallbackCourse — 새 기능 (사우나 먼저 고르기 / 온천중심 / 숙소추천)", () => {
  it("선택한 사우나가 1일차 첫 stop에 고정된다", () => {
    const region = getRegion("gangwon")!;
    const anchor = region.places.find((p) => p.type === "sauna")!;
    const course = fallbackCourse({ ...base, anchorSaunaId: anchor.id }, region);
    const first = course.days[0].stops[0];
    expect(first.placeId).toBe(anchor.id);
    expect(first.title).toBe(anchor.name);
  });

  it("온천중심 모드일 때 spa(온천) 유형이 우선 배치된다", () => {
    const region = getRegion("gangwon")!;
    const course = fallbackCourse({ ...base, onsenFocus: true }, region);
    const coreStops = course.days[0].stops.filter((s) => s.placeId);
    const hasSpaFirst = region.places.find((p) => p.id === coreStops[0].placeId)?.type === "spa";
    expect(hasSpaFirst).toBe(true);
  });

  it("숙소 추천이 켜지면 onsen/sauna 보유 숙소가 마지막 stop에 온다", () => {
    const region = getRegion("gangwon")!;
    const lodging = region.places.find((p) => p.type === "lodging" && (p.hasOnsen || p.hasSauna));
    // tourAPI 실데이터에 온천/사우나 숙소가 있으면 마지막 stop에 온다
    if (!lodging) return; // 동기화 데이터 없으면 스킵
    const course = fallbackCourse({ ...base, includeLodging: true }, region);
    const last = course.days[0].stops[course.days[0].stops.length - 1];
    const place = region.places.find((p) => p.id === last.placeId);
    expect(place?.type).toBe("lodging");
    expect(place?.hasOnsen || place?.hasSauna).toBe(true);
  });

  it("숙소 추천이 꺼지면 lodging stop이 없다", () => {
    const region = getRegion("gangwon")!;
    const course = fallbackCourse({ ...base, includeLodging: false }, region);
    const anyLodging = course.days[0].stops.some((s) => {
      const p = region.places.find((pp) => pp.id === s.placeId);
      return p?.type === "lodging";
    });
    expect(anyLodging).toBe(false);
  });

  it("사우나를 고르지 않아도 정상 코스가 생성된다", () => {
    const region = getRegion("gangwon")!;
    const course = fallbackCourse({ ...base, anchorSaunaId: undefined }, region);
    expect(course.days).toHaveLength(1);
    expect(course.days[0].stops.length).toBeGreaterThan(0);
  });
});

describe("fallbackCourse — 중복 배치 방지", () => {
  it("같은 날 안에서 같은 장소가 두 번 배치되지 않는다", () => {
    const region = getRegion("busan")!;
    const course = fallbackCourse({ ...base, region: "busan", days: 2 }, region);
    for (const day of course.days) {
      const ids = day.stops.map((s) => s.placeId).filter(Boolean);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("재고가 충분하면 여러 날에 걸쳐 같은 맛집이 반복되지 않는다", () => {
    const region = getRegion("busan")!;
    const restaurantCount = region.places.filter((p) => p.type === "restaurant").length;
    expect(restaurantCount).toBeGreaterThanOrEqual(4); // 이 지역은 재고가 충분하다는 전제
    const course = fallbackCourse({ ...base, region: "busan", days: 2 }, region);
    const mealIds = course.days.flatMap((d) =>
      d.stops.filter((s) => s.time === "13:00" || s.time === "18:00").map((s) => s.placeId)
    );
    expect(new Set(mealIds).size).toBe(mealIds.length);
  });

  it("15:00 stop 문구에 번역되지 않은 영어 단어가 남아있지 않다", () => {
    const region = getRegion("busan")!;
    const course = fallbackCourse({ ...base, region: "busan", days: 2, anchorSaunaId: undefined }, region);
    for (const day of course.days) {
      for (const stop of day.stops) {
        expect(stop.reason).not.toMatch(/another/i);
      }
    }
  });
});

describe("fallbackCourse — 재고가 적은 지역", () => {
  // 실데이터는 주간 동기화로 바뀌므로, 재고를 일부러 줄인 지역을 만들어 검증한다
  const shrink = (counts: Record<string, number>) => {
    const region = getRegion("seoul")!;
    const left = { ...counts };
    return {
      ...region,
      places: region.places.filter((p) => !(p.type in left) || left[p.type]-- > 0),
    };
  };
  const mealStops = (day: { stops: { time: string; placeId?: string; title: string; reason: string }[] }) =>
    day.stops.filter((s) => s.time === "13:00" || s.time === "18:00");

  it("모든 지역·기간에서 같은 날 같은 장소가 두 번 나오지 않는다", () => {
    for (const r of regions) {
      for (let days = 1; days <= 4; days++) {
        const course = fallbackCourse({ ...base, region: r.id, days }, r);
        for (const day of course.days) {
          const ids = day.stops.map((s) => s.placeId).filter(Boolean);
          expect(new Set(ids).size, `${r.id} ${days}일 코스 ${day.day}일차`).toBe(ids.length);
        }
      }
    }
  });

  it("식당이 하나뿐이면 점심만 그 식당, 저녁은 자유 식사로 정직하게 표기한다", () => {
    const region = shrink({ restaurant: 1 });
    const course = fallbackCourse({ ...base, region: "seoul", days: 1 }, region);
    const [lunch, dinner] = mealStops(course.days[0]);
    expect(lunch.placeId).toBeDefined();
    expect(dinner.placeId).toBeUndefined();
    expect(dinner.title).toBe("자유 식사");
    expect(dinner.reason).not.toMatch(/실패/);
  });

  it("식당이 없어도 끼니를 자유 식사로 두고 코스를 만든다", () => {
    const region = shrink({ restaurant: 0 });
    const course = fallbackCourse({ ...base, region: "seoul", days: 2 }, region);
    for (const day of course.days) {
      for (const meal of mealStops(day)) {
        expect(meal.placeId).toBeUndefined();
        expect(meal.title).toBe("자유 식사");
      }
    }
  });

  it("여러 날에 걸쳐 재사용할 때는 덜 쓴 식당·사우나부터 고른다", () => {
    const region = shrink({ restaurant: 3, sauna: 1, jjimjilbang: 1, spa: 0 });
    const course = fallbackCourse({ ...base, region: "seoul", days: 3 }, region);
    const mealUse = new Map<string, number>();
    for (const day of course.days) {
      const [lunch, dinner] = mealStops(day);
      expect(lunch.placeId).not.toBe(dinner.placeId);
      for (const m of [lunch, dinner]) mealUse.set(m.placeId!, (mealUse.get(m.placeId!) ?? 0) + 1);
    }
    // 끼니 6번을 식당 3곳이 2번씩 나눠 맡는다
    expect([...mealUse.values()]).toEqual([2, 2, 2]);
    // 사우나 2곳이 매일 같은 곳으로 시작하지 않는다
    const starts = new Set(course.days.map((d) => d.stops[0].placeId));
    expect(starts.size).toBe(2);
  });

  it("코스 문구에 '실패'라는 말을 쓰지 않는다", () => {
    for (const r of regions) {
      const course = fallbackCourse({ ...base, region: r.id, days: 3 }, r);
      for (const s of course.days.flatMap((d) => d.stops)) {
        expect(`${s.title} ${s.reason} ${s.tip ?? ""}`).not.toMatch(/실패/);
      }
    }
  });
});
