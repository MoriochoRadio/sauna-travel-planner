import { z } from "zod";

// ── 장소 유형 ───────────────────────────────────────────────
export const PlaceType = z.enum([
  "sauna", "jjimjilbang", "spa", "restaurant", "attraction", "lodging",
]);
export type PlaceType = z.infer<typeof PlaceType>;

// 여행의 핵심(사우나/온천/찜질방) vs 부가(맛집/볼거리/숙소)
export const CORE_TYPES: PlaceType[] = ["sauna", "jjimjilbang", "spa", "lodging"];

// ── 지역 ────────────────────────────────────────────────────
export const Region = z.enum([
  "seoul", "busan", "gangwon", "gyeongju", "jeju",
  "incheon", "daejeon", "gwangju", "daegu",
]);
export type Region = z.infer<typeof Region>;

// ── 가격대 ──────────────────────────────────────────────────
export const PriceLevel = z.enum(["low", "mid", "high"]);
export type PriceLevel = z.infer<typeof PriceLevel>;

// ── 장소(사우나/맛집/볼거리 통합) ───────────────────────────
export const PlaceSchema = z.object({
  id: z.string(),                              // 지역내 유일 (예: "seoul-sauna-01")
  name: z.string(),
  type: PlaceType,
  region: Region,
  city: z.string(),                            // 상세 시군구 (예: "서울 중구")
  sigungu: z.string().optional(),              // 시군구 id (예: "seoul-jung") — 지도/드롭다운 선택용
  summary: z.string(),                         // 한 줄 설명
  tags: z.array(z.string()),                   // ["황토","족욕","가성비"]
  priceLevel: PriceLevel,
  avgDurationMin: z.number(),                  // 체류 권장 분
  address: z.string().optional(),
  url: z.string().url().optional(),
  openHours: z.string().optional(),            // 예: "06:00-22:00"
  highlights: z.array(z.string()),             // 추천 포인트
  source: z.enum(["curated", "tourapi", "kakao"]).optional(), // 데이터 출처
  // 숙소(lodging)가 보유한 온천/사우나 시설
  hasOnsen: z.boolean().optional(),            // 노천/실내 온천 보유
  hasSauna: z.boolean().optional(),            // 사우나/찜질방 보유
  // 세부 정보 (tourAPI 실데이터)
  lat: z.number().optional(),                  // 위도
  lng: z.number().optional(),                  // 경도
  homepage: z.string().url().optional(),       // 공식 홈페이지
  tel: z.string().optional(),                  // 전화번호
});
export type Place = z.infer<typeof PlaceSchema>;

// ── 지역 단위 ────────────────────────────────────────────────
export const RegionSchema = z.object({
  id: Region,
  name: z.string(),                            // 한글 표기
  blurb: z.string(),                           // 지역 한 줄 소개
  onsenDistrict: z.boolean().default(false),   // 온천 중심 지역(강원/경주/제주 등)
  places: z.array(PlaceSchema),
});
export type RegionData = z.infer<typeof RegionSchema>;

// ── 취향(입력) ──────────────────────────────────────────────
export const Preference = z.enum([
  "quiet", "budget", "premium", "family", "solo", "outdoor_spa", "foodie",
]);
export type Preference = z.infer<typeof Preference>;

// ── 플래너 입력 ─────────────────────────────────────────────
export const PlannerInputSchema = z.object({
  region: Region,
  sigungu: z.string().optional(),              // 세부 시군구 id (지도/드롭다운 선택)
  days: z.number().int().min(1).max(4),
  preferences: z.array(Preference).default([]),
  note: z.string().optional(),                 // 특이사항 자유텍스트
  anchorSaunaId: z.string().optional(),        // 먼저 고른 핵심 사우나/온천 id
  onsenFocus: z.boolean().default(false),      // 온천 중심 모드
  includeLodging: z.boolean().default(true),   // 온천/사우나 보유 숙소 추천 포함
});
export type PlannerInput = z.infer<typeof PlannerInputSchema>;
