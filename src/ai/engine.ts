import type { PlannerInput, RegionData, Place } from "@/data/schema";
import { getRegion } from "@/data/seed";
import { findSigunguById } from "@/data/sigungu";
import { searchKakaoSauna, searchKakaoLodging, kakaoToPlace } from "@/lib/kakao";
import { searchSaunaPlaces, toSaunaPlace } from "@/lib/tourapi";
import { computeRating } from "@/lib/rating";
import { CourseSchema, type CourseResult } from "./course.schema";
import { findCuratedCourse } from "@/data/curatedCourses";
import { fallbackCourse } from "./fallback";

// 카카오/tourAPI 실시간 결과와 curated seed에 같은 장소가 다른 id로 중복 등록되는 것을 방지
function normalizeName(name: string): string {
  return name.replace(/\s+/g, "").toLowerCase();
}
function dedupeByName(primary: Place[], secondary: Place[]): Place[] {
  const seenNames = new Set(primary.map((p) => normalizeName(p.name)));
  return secondary.filter((p) => !seenNames.has(normalizeName(p.name)));
}

// 엔진 오케스트레이션: 손수 짠 코스 우선, 없으면 규칙 기반 생성
//
// 이전에는 LLM으로 코스를 만들고 실패하면 규칙 기반으로 넘어갔다. 실제로는
// 키가 없어 늘 규칙 기반으로 돌면서 화면에는 "AI 생성 실패"라고 표시됐다.
// 매번 달라지는 생성 결과보다 검증한 장소로 미리 짜 둔 코스가 품질이 일정하다.
export async function generateCourse(input: PlannerInput): Promise<CourseResult> {
  const region = getRegion(input.region);
  if (!region) {
    throw new Error(`unknown region: ${input.region}`);
  }

  // 선택 시군구 실시간 사우나/숙소 병합 (카카오 우선 → tourAPI 폴백)
  let regionData: RegionData = region;
  if (input.sigungu) {
    const s = findSigunguById(input.sigungu);
    if (s && s.region === input.region) {
      let live: Place[] = [];
      // 1) 카카오 사우나/찜질방/온천 (키 있으면)
      if (process.env.KAKAO_REST_KEY) {
        try {
          const raw = await searchKakaoSauna(s.lat, s.lng, input.region, input.sigungu);
          live = raw.map((d, i) => kakaoToPlace(d, input.region, input.sigungu!, i + 1));
        } catch (e) {
          console.warn("[engine] 카카오 사우나 병합 실패", (e as Error)?.message);
        }
      }
      // 1-2) 카카오 숙소 (숙소 옵션 켜짐 OR 다일차 자동포함)
      if ((input.includeLodging || input.days >= 2) && process.env.KAKAO_REST_KEY) {
        try {
          const raw = await searchKakaoLodging(s.lat, s.lng, input.region, input.sigungu);
          live = [...live, ...raw.map((d, i) => kakaoToPlace(d, input.region, input.sigungu!, i + 1))];
        } catch (e) {
          console.warn("[engine] 카카오 숙소 병합 실패", (e as Error)?.message);
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
        // 추천지수 계산
        live = live.map((p) => ({ ...p, rating: computeRating(p) }));
        // curated seed 중 실시간 결과와 이름이 같은 장소는 제외(중복 방지, 실시간 데이터 우선)
        const curatedRest = dedupeByName(live, region.places);
        regionData = { ...region, places: [...live, ...curatedRest] };
      }
    }
  }

  const curated = findCuratedCourse(input);
  if (curated) {
    const validated = CourseSchema.parse(curated);
    return { ...validated, curated: true, places: regionData.places };
  }

  const fb = fallbackCourse(input, regionData);
  return { ...fb, curated: false, places: regionData.places };
}
