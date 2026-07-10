import type { PlannerInput, RegionData, Place } from "../data/schema";
import { getRegion } from "../data/seed";
import { findSigunguById } from "../data/sigungu";
import { searchKakaoSauna, kakaoToPlace } from "../lib/kakao";
import { searchSaunaPlaces, toSaunaPlace } from "../lib/tourapi";
import { CourseSchema, type CourseResult } from "./course.schema";
import { generateWithLLM } from "./generate";
import { fallbackCourse } from "./fallback";

// 엔진 오케스트레이션: LLM 우선, 실패 시 폴백
export async function generateCourse(input: PlannerInput): Promise<CourseResult> {
  const region = getRegion(input.region);
  if (!region) {
    throw new Error(`unknown region: ${input.region}`);
  }

  // 선택 시군구 실시간 사우나 병합 (카카오 우선 → tourAPI 폴백)
  let regionData: RegionData = region;
  if (input.sigungu) {
    const s = findSigunguById(input.sigungu);
    if (s && s.region === input.region) {
      let live: Place[] = [];
      // 1) 카카오 (키 있으면)
      if (process.env.KAKAO_REST_KEY) {
        try {
          const raw = await searchKakaoSauna(s.lat, s.lng, input.region, input.sigungu);
          live = raw.map((d, i) => kakaoToPlace(d, input.region, input.sigungu!, i + 1));
        } catch (e) {
          console.warn("[engine] 카카오 실시간 병합 실패", (e as Error)?.message);
        }
      }
      // 2) tourAPI 폴백 (카카오 0건 & 키 있으면)
      if (live.length === 0 && process.env.TOURAPI_KEY) {
        try {
          const raw = await searchSaunaPlaces(s.areaCode, "사우나", s.name);
          if (raw.length > 0) {
            live = raw.map((it, i) => toSaunaPlace(it, input.region, input.sigungu!, i + 1));
          }
        } catch (e) {
          console.warn("[engine] tourAPI 병합 실패, curated 사용", (e as Error)?.message);
        }
      }
      if (live.length > 0) {
        regionData = { ...region, places: [...live, ...region.places] };
      }
    }
  }

  const llm = await generateWithLLM(input, regionData);
  if (llm) {
    const validated = CourseSchema.parse(llm);
    return { ...validated, usedFallback: false };
  }

  const fb = fallbackCourse(input, regionData);
  return { ...fb, usedFallback: true };
}
