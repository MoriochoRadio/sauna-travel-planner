import type { PlannerInput, RegionData } from "../data/schema";
import { getRegion } from "../data/seed";
import { findSigunguById } from "../data/sigungu";
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

  // 선택 시군구 실시간 사우나 병합 (tourAPI 키 있을 때만)
  let regionData: RegionData = region;
  if (input.sigungu) {
    const s = findSigunguById(input.sigungu);
    if (s && s.region === input.region) {
      try {
        const raw = await searchSaunaPlaces(s.areaCode, "사우나", s.name);
        if (raw.length > 0) {
          const live = raw.map((it, i) => toSaunaPlace(it, input.region, input.sigungu!, i + 1));
          regionData = { ...region, places: [...live, ...region.places] };
        }
      } catch (e) {
        console.warn("[engine] 실시간 사우나 병합 실패, curated 사용", (e as Error)?.message);
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
