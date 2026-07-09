import { describe, it, expect } from "vitest";
import { fallbackCourse } from "./fallback";
import { getRegion } from "../data/seed";
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
