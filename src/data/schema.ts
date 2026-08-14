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
  "seoul", "busan", "daegu", "incheon", "gwangju", "daejeon", "ulsan", "sejong",
  "gyeonggi", "gangwon", "chungbuk", "chungnam", "jeonbuk", "jeonnam", "gyeongbuk", "gyeongnam", "jeju",
  "gyeongju", // 경주 (경북 내 온천지구级, 기존 curated 데이터 호환용 독립 region)
]);
export type Region = z.infer<typeof Region>;

// 전국 17시도 한글 명칭
export const REGION_LABELS: Record<Region, string> = {
  seoul: "서울", busan: "부산", daegu: "대구", incheon: "인천", gwangju: "광주",
  daejeon: "대전", ulsan: "울산", sejong: "세종", gyeonggi: "경기", gangwon: "강원",
  chungbuk: "충북", chungnam: "충남", jeonbuk: "전북", jeonnam: "전남",
  gyeongbuk: "경북", gyeongnam: "경남", jeju: "제주", gyeongju: "경주",
};

// 전체 지역 리스트 (드롭다운용)
export const ALL_REGIONS: Region[] = [
  "seoul", "busan", "daegu", "incheon", "gwangju", "daejeon", "ulsan", "sejong",
  "gyeonggi", "gangwon", "chungbuk", "chungnam", "jeonbuk", "jeonnam", "gyeongbuk", "gyeongnam", "jeju", "gyeongju",
];

// ── 가격대 ──────────────────────────────────────────────────
export const PriceLevel = z.enum(["low", "mid", "high"]);
export type PriceLevel = z.infer<typeof PriceLevel>;

// ── 검증 큐레이션 ───────────────────────────────────────────
// "official" = 공식 채널에서 확인함, "curation-draft" = 공식 확인 전 초안.
// 초안 상태에서는 요금·운영 시간 같은 행동 정보를 단정해 보여주지 않는다.
export const PlaceVerificationSchema = z.object({
  status: z.enum(["official", "curation-draft"]),
  verifiedAt: z.string(),                      // YYYY-MM-DD
  sourceLabel: z.string(),
  sourceUrl: z.string().url(),
  officialUrl: z.string().url().optional(),
  operatingNote: z.string().optional(),
});
export type PlaceVerification = z.infer<typeof PlaceVerificationSchema>;

export const NeighborhoodSchema = z.object({
  title: z.string(),
  type: z.enum(["food", "sight"]),
  description: z.string(),
});
export type Neighborhood = z.infer<typeof NeighborhoodSchema>;

// 온열요법 관련 참고 정보. 효과를 보장하는 주장이 아니라 "읽는 법"을 함께 제시한다.
export const PlaceScienceSchema = z.object({
  studyType: z.string(),
  title: z.string(),
  summary: z.string(),
  sourceLabel: z.string(),
  sourceUrl: z.string().url(),
});
export type PlaceScience = z.infer<typeof PlaceScienceSchema>;

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
  rating: z.number().min(0).max(5).optional(), // 추천지수 (리뷰 대체: tags/가성비/온천보유/거리 종합)

  // ── 검증 큐레이션 (선택) ──────────────────────────────────
  // 운영 시간·요금처럼 자주 바뀌는 정보는 앱이 확정하지 않고 공식 출처로 넘긴다.
  // 검증일을 함께 보여줘 사용자가 정보의 신선도를 스스로 판단할 수 있게 한다.
  verification: PlaceVerificationSchema.optional(),
  usageTip: z.string().optional(),             // 이용 전후 유의사항 한 줄
  neighborhood: z.array(NeighborhoodSchema).optional(), // 주변 맛집·볼거리
  science: PlaceScienceSchema.optional(),      // 온열요법 관련 근거 메모
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
