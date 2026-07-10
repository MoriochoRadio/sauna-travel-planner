import { generateCourse } from "./engine";
import type { PlannerInput } from "../data/schema";

// 실제 카카오 REST 키가 있으면 live 숙소 병합 경로를 검증.
// 키가 없으면 skip (CI/로컬 기본). 키 값은 로그에 출력하지 않음.
const HAS_KAKAO = !!process.env.KAKAO_REST_KEY;

const baseInput: PlannerInput = {
  region: "daegu",
  sigungu: "daegu-수성구",
  days: 2,
  preferences: [],
  note: undefined,
  onsenFocus: false,
  includeLodging: false, // 토글 OFF여도 다일차(2일)면 live 숙소 포함돼야 함
};

describe("engine live (카카오 실시간 병합)", () => {
  test.skipIf(!HAS_KAKAO)("다일차(토글 OFF)여도 카카오 live 숙소가 코스에 병합된다", async () => {
    const course = await generateCourse(baseInput);
    // 응답에 places 포함 (live+curated)
    expect(Array.isArray((course as any).places)).toBe(true);
    const places = (course as any).places as any[];
    // 카카오 live lodging이 최소 1개 존재
    const liveLodging = places.filter((p) => p.type === "lodging" && p.source === "kakao");
    expect(liveLodging.length).toBeGreaterThan(0);
    // 코스 어딘가에 live 숙소가 배치됐는지 (마지막 Day 21:00 기대)
    const allTitles = course.days.flatMap((d) => d.stops.map((s) => s.title));
    const matched = liveLodging.some((l) => allTitles.includes(l.name));
    expect(matched).toBe(true);
  }, 30000);
});
