import type { RegionData, Place } from "./schema";
import { enrichedPlaces } from "./seed.enriched";
import { findSigungu } from "./sigungu";
import { computeRating } from "@/lib/rating";

// ───────────────────────────────────────────────────────────
// Phase 1+B 전체 시드 데이터셋 (전국 17시도)
// 하이브리드: 사우나/온천 = curated(실제 선별 + tourAPI 검증),
//           맛집/관광 = curated + tourAPI 보강(seed.enriched.ts 병합).
// curated place의 city 텍스트에서 시군구 id 자동 매핑 + 추천지수 자동 산출

// curated place에 rating 자동 부여
function withRating(p: Place): Place {
  return p.rating != null ? p : { ...p, rating: computeRating(p) };
}

// curated place의 city 텍스트에서 시군구 id 자동 매핑
function withSigungu(p: Place): Place {
  const base = p.rating != null ? p : withRating(p);
  if (base.sigungu) return base;
  const s = findSigungu(base.city);
  return s ? { ...base, sigungu: s } : base;
}

// curated + tourAPI 보강 병합 (중복 id 제거)
function mergeRegionPlaces(curated: Place[], regionId: string): Place[] {
  const enriched = enrichedPlaces[regionId] ?? [];
  const merged = curated.map(withSigungu);
  const seen = new Set(curated.map((p) => p.id));
  for (const p of enriched) {
    if (!seen.has(p.id)) {
      merged.push(withSigungu(p));
      seen.add(p.id);
    }
  }
  return merged;
}

export const regions: RegionData[] = [
  {
    id: "seoul", name: "서울", blurb: "도심 속 사우나와 골목 맛집이 공존하는 당일 힐링",
    onsenDistrict: false,
    places: mergeRegionPlaces([      { id: "seoul-sauna-01", name: "청파상가 사우나", type: "sauna", region: "seoul", city: "서울 중구", summary: "오래된 동네 사우나, 가성비와 탕질 본연의 맛", tags: ["가성비","동네사우나","족욕"], priceLevel: "low", avgDurationMin: 120, openHours: "24시간", highlights: ["저렴한 이용료","한증막","조용한 분위기"] },
      { id: "seoul-sauna-02", name: "스파레이(여의도)", type: "jjimjilbang", region: "seoul", city: "서울 영등포구", summary: "한강 뷰 찜질방, 캡슐형 휴식", tags: ["프리미엄","한강뷰","야간"], priceLevel: "mid", avgDurationMin: 240, openHours: "24시간", highlights: ["한강 조망","수면실","식사 메뉴 다양"] },
      { id: "seoul-sauna-03", name: "서울역 사우나(캡슐)", type: "sauna", region: "seoul", city: "서울 용산구", summary: "이동 동선 중심 동네 사우나, 혼자 쉬기 좋음", tags: ["혼자","가성비","조용한"], priceLevel: "low", avgDurationMin: 150, openHours: "24시간", highlights: ["캡슐 휴식","교통 편리","조용"] },
      { id: "seoul-food-01", name: "을지로 국밥 거리", type: "restaurant", region: "seoul", city: "서울 중구", summary: "사우나 전후 든든한 국밥 한 그릇", tags: ["저녁","가성비"], priceLevel: "low", avgDurationMin: 60, highlights: ["뼈해장국","곰탕","야식하기 좋음"] },
      { id: "seoul-food-02", name: "명동 교자", type: "restaurant", region: "seoul", city: "서울 중구", summary: "칼국수·만두 본점, 사우나 전 가볍게", tags: ["점심","유명맛집"], priceLevel: "mid", avgDurationMin: 50, highlights: ["냉면","군만두","대기 있음"] },
      { id: "seoul-food-03", name: "광장시장 빈대떡·육회", type: "restaurant", region: "seoul", city: "서울 종로구", summary: "전통시장 야식 코스", tags: ["야간","가족"], priceLevel: "low", avgDurationMin: 70, highlights: ["빈대떡","육회","분위기"] },
      { id: "seoul-att-01", name: "덕수궁 돌담길", type: "attraction", region: "seoul", city: "서울 중구", summary: "사우나 앞뒤 산책하기 좋은 정적 코스", tags: ["산책","사진","조용한"], priceLevel: "low", avgDurationMin: 40, highlights: ["석조전","가을 은행","도심 산책"] },
      { id: "seoul-att-02", name: "북촌 한옥마을", type: "attraction", region: "seoul", city: "서울 종로구", summary: "한옥 골목 산책, 사우나 완충 코스", tags: ["산책","사진","가족"], priceLevel: "low", avgDurationMin: 60, highlights: ["한옥","골목","카페"] },
    ], "seoul")
  },
  {
    id: "busan", name: "부산", blurb: "바다와 함께 누리는 해운대·광안리 찜질 문화",
    onsenDistrict: false,
    places: mergeRegionPlaces([      { id: "busan-sauna-01", name: "해운대 스파빌", type: "jjimjilbang", region: "busan", city: "부산 해운대구", summary: "바다 앞 찜질방, 야외 족욕과 온천", tags: ["해변","족욕","가족"], priceLevel: "mid", avgDurationMin: 210, openHours: "24시간", highlights: ["바다 전망","야외 족욕","키즈존"] },
      { id: "busan-sauna-02", name: "광안리 온천 사우나", type: "spa", region: "busan", city: "부산 수영구", summary: "광안대교 뷰 온천, 프리미엄 노천", tags: ["야외온천","프리미엄","야경"], priceLevel: "high", avgDurationMin: 150, highlights: ["노천탕","야경","마사지"] },
      { id: "busan-sauna-03", name: "동래 온천 사우나", type: "sauna", region: "busan", city: "부산 동래구", summary: "역사 깊은 온천 town 동네 사우나", tags: ["온천","조용한","가성비"], priceLevel: "low", avgDurationMin: 120, openHours: "06:00-22:00", highlights: ["전통 온천","저렴","조용"] },
      { id: "busan-food-01", name: "해운대 돼지국밥 거리", type: "restaurant", region: "busan", city: "부산 해운대구", summary: "사우나 나와서 뜨끈한 국밥", tags: ["아침","저녁","부산맛"], priceLevel: "low", avgDurationMin: 60, highlights: ["국밥","순대국","반찬 자율"] },
      { id: "busan-food-02", name: "광안리 회·조개구이", type: "restaurant", region: "busan", city: "부산 수영구", summary: "바다 근처 신선 해산물", tags: ["회","야간","프리미엄"], priceLevel: "high", avgDurationMin: 90, highlights: ["활어회","조개구이","바다뷰"] },
      { id: "busan-food-03", name: "부산 어묵(엄궁 엄마손)", type: "restaurant", region: "busan", city: "부산 부산진구", summary: "사우나 후 따뜻한 어묵 국물", tags: ["간식","가성비"], priceLevel: "low", avgDurationMin: 40, highlights: ["어묵","국물","골목"] },
      { id: "busan-att-01", name: "광안대교 산책로", type: "attraction", region: "busan", city: "부산 수영구", summary: "사우나 전후 바다 산책 코스", tags: ["산책","야경","사진"], priceLevel: "low", avgDurationMin: 50, highlights: ["야간 조명","해변","자전거"] },
      { id: "busan-att-02", name: "감천문화마을", type: "attraction", region: "busan", city: "부산 사하구", summary: "색채 마을 산책, 오후 완충 코스", tags: ["사진","가족","산책"], priceLevel: "low", avgDurationMin: 90, highlights: ["벽화","전망","골목"] },
    ], "busan")
  },
  {
    id: "gangwon", name: "강원", blurb: "산속 온천과 송어·감자 요리로 겨울 힐링",
    onsenDistrict: true,
    places: mergeRegionPlaces([      { id: "gangwon-sauna-01", name: "평창 용평 온천", type: "spa", region: "gangwon", city: "강원 평창군", summary: "설원 속 노천온천, 프리미엄 힐링", tags: ["야외온천","설경","프리미엄"], priceLevel: "high", avgDurationMin: 180, openHours: "07:00-21:00", highlights: ["노천탕","설경","리조트 연계"] },
      { id: "gangwon-sauna-02", name: "강릉 시내 사우나", type: "sauna", region: "gangwon", city: "강원 강릉시", summary: "커피거리 근처 동네 사우나", tags: ["가성비","동네","조용한"], priceLevel: "low", avgDurationMin: 120, openHours: "24시간", highlights: ["저렴","한증막","조용"] },
      { id: "gangwon-sauna-03", name: "춘천 온천 리조트", type: "spa", region: "gangwon", city: "강원 춘천시", summary: "호수 근처 패밀리 온천", tags: ["가족","야외온천","프리미엄"], priceLevel: "mid", avgDurationMin: 200, openHours: "08:00-22:00", highlights: ["가족탕","호수뷰","수영장"] },
      { id: "gangwon-food-01", name: "평창 송어 회·매운탕", type: "restaurant", region: "gangwon", city: "강원 평창군", summary: "산간 송어 요리, 사우나 전 보양", tags: ["회","보양","겨울"], priceLevel: "mid", avgDurationMin: 80, highlights: ["송어회","매운탕","신선"] },
      { id: "gangwon-food-02", name: "강릉 안목 커피거리", type: "restaurant", region: "gangwon", city: "강원 강릉시", summary: "바다 앞 카페 거리, 사우나 후 휴식", tags: ["카페","바다","데이트"], priceLevel: "mid", avgDurationMin: 70, highlights: ["바다뷰","테라스","디저트"] },
      { id: "gangwon-food-03", name: "춘천 닭갈비 골목", type: "restaurant", region: "gangwon", city: "강원 춘천시", summary: "사우나 후 든든한 닭갈비", tags: ["저녁","가족"], priceLevel: "mid", avgDurationMin: 90, highlights: ["닭갈비","막국수","분위기"] },
      { id: "gangwon-att-01", name: "오대산 국립공원", type: "attraction", region: "gangwon", city: "강원 평창군", summary: "온천 전후 숲 산책 코스", tags: ["등산","사찰","자연"], priceLevel: "low", avgDurationMin: 120, highlights: ["월정사","숲길","단풍"] },
      { id: "gangwon-att-02", name: "강릉 커피박물관·오죽헌", type: "attraction", region: "gangwon", city: "강원 강릉시", summary: "문화 산책, 오후 완충", tags: ["산책","문화","사진"], priceLevel: "low", avgDurationMin: 80, highlights: ["오죽헌","육송","전통"] },
    ], "gangwon")
  },
  {
    id: "gyeongju", name: "경주", blurb: "천년 고도의 온천과 한정식으로 즐기는 힐링",
    onsenDistrict: true,
    places: mergeRegionPlaces([      { id: "gyeongju-sauna-01", name: "경주 황남 온천", type: "spa", region: "gyeongju", city: "경북 경주시", summary: "불국사 근처 온천, 프리미엄 노천", tags: ["야외온천","프리미엄","조용한"], priceLevel: "mid", avgDurationMin: 170, openHours: "07:00-21:00", highlights: ["노천탕","한적","관광 연계"] },
      { id: "gyeongju-sauna-02", name: "경주 시내 사우나", type: "sauna", region: "gyeongju", city: "경북 경주시", summary: "번화가 동네 사우나, 가성비", tags: ["가성비","동네","혼자"], priceLevel: "low", avgDurationMin: 120, openHours: "24시간", highlights: ["저렴","한증막","조용"] },
      { id: "gyeongju-sauna-03", name: "보문단지 온천 리조트", type: "jjimjilbang", region: "gyeongju", city: "경북 경주시", summary: "호수 리조트 찜질방, 가족 친화", tags: ["가족","호수","프리미엄"], priceLevel: "high", avgDurationMin: 220, openHours: "24시간", highlights: ["호수뷰","키즈존","수영장"] },
      { id: "gyeongju-food-01", name: "황남빵 본점", type: "restaurant", region: "gyeongju", city: "경북 경주시", summary: "사우나 전 가벼운 간식 코스", tags: ["간식","유명맛집"], priceLevel: "low", avgDurationMin: 30, highlights: ["황남빵","전통","선물"] },
      { id: "gyeongju-food-02", name: "경주 한정식(교촌 마을)", type: "restaurant", region: "gyeongju", city: "경북 경주시", summary: "한옥 마을 한정식, 점심 추천", tags: ["점심","프리미엄","가족"], priceLevel: "mid", avgDurationMin: 90, highlights: ["한정식","한옥","전통"] },
      { id: "gyeongju-food-03", name: "대릉원 근처 막국수·술집", type: "restaurant", region: "gyeongju", city: "경북 경주시", summary: "야간 가볍게, 사우나 후", tags: ["야간","저녁"], priceLevel: "low", avgDurationMin: 70, highlights: ["막국수","막걸리","분위기"] },
      { id: "gyeongju-att-01", name: "첨성대·대릉원", type: "attraction", region: "gyeongju", city: "경북 경주시", summary: "고분 공원 산책, 오후 완충", tags: ["산책","사진","문화"], priceLevel: "low", avgDurationMin: 70, highlights: ["첨성대","대릉원","야경"] },
      { id: "gyeongju-att-02", name: "불국사", type: "attraction", region: "gyeongju", city: "경북 경주시", summary: "온천 전후 사찰 탐방", tags: ["사찰","자연","조용한"], priceLevel: "low", avgDurationMin: 120, highlights: ["석탑","산사","세계유산"] },
    ], "gyeongju")
  },
  {
    id: "jeju", name: "제주", blurb: "바다 뷰 온천과 흑돼지·해산물로 완성하는 힐링",
    onsenDistrict: false,
    places: mergeRegionPlaces([      { id: "jeju-sauna-01", name: "제주 시티 사우나", type: "sauna", region: "jeju", city: "제주 제주시", summary: "공항 근처 동네 사우나, 가성비", tags: ["가성비","동네","혼자"], priceLevel: "low", avgDurationMin: 120, openHours: "24시간", highlights: ["저렴","한증막","교통 편리"] },
      { id: "jeju-sauna-02", name: "서귀포 리조트 온천", type: "spa", region: "jeju", city: "제주 서귀포시", summary: "바다 뷰 노천온천, 프리미엄", tags: ["야외온천","바다","프리미엄"], priceLevel: "high", avgDurationMin: 180, openHours: "08:00-22:00", highlights: ["노천탕","바다뷰","마사지"] },
      { id: "jeju-sauna-03", name: "제주 찜질방(올레)", type: "jjimjilbang", region: "jeju", city: "제주 제주시", summary: "가족 친화 찜질방", tags: ["가족","야간"], priceLevel: "mid", avgDurationMin: 200, openHours: "24시간", highlights: ["수면실","키즈존","식사"] },
      { id: "jeju-food-01", name: "제주 흑돼지 거리", type: "restaurant", region: "jeju", city: "제주 제주시", summary: "사우나 후 든든한 흑돼지", tags: ["저녁","프리미엄","가족"], priceLevel: "mid", avgDurationMin: 100, highlights: ["흑돼지","구이","보양"] },
      { id: "jeju-food-02", name: "동문시장 칼국수·성게미역", type: "restaurant", region: "jeju", city: "제주 제주시", summary: "시장 골목 점심 코스", tags: ["점심","가성비"], priceLevel: "low", avgDurationMin: 60, highlights: ["칼국수","성게미역","시장"] },
      { id: "jeju-food-03", name: "서귀포 해산물·갈치", type: "restaurant", region: "jeju", city: "제주 서귀포시", summary: "바다 근처 신선 해산물", tags: ["회","야간","프리미엄"], priceLevel: "high", avgDurationMin: 90, highlights: ["갈치","활어회","바다뷰"] },
      { id: "jeju-att-01", name: "성산일출봉", type: "attraction", region: "jeju", city: "제주 서귀포시", summary: "오전 산책 코스, 사우나 완충", tags: ["등산","자연","사진"], priceLevel: "low", avgDurationMin: 120, highlights: ["분화구","해돋이","올레"] },
      { id: "jeju-att-02", name: "협재·한림 해변", type: "attraction", region: "jeju", city: "제주 제주시", summary: "바다 산책, 오후 완충", tags: ["산책","바다","가족"], priceLevel: "low", avgDurationMin: 90, highlights: ["에메랄드 바다","카페","해변"] },
    ], "jeju")
  },
  {
    id: "incheon", name: "인천", blurb: "바다 도시의 온천과 차이나타운 먹거리",
    onsenDistrict: false,
    places: mergeRegionPlaces([      { id: "incheon-sauna-01", name: "계양산 산림욕장 인근 사우나", type: "sauna", region: "incheon", city: "인천 계양구", summary: "산림욕장 근처 동네 사우나", tags: ["조용한","가성비","동네"], priceLevel: "low", avgDurationMin: 120, openHours: "24시간", highlights: ["산책 연계","저렴","조용"] },
      { id: "incheon-sauna-02", name: "송도 온천 사우나", type: "spa", region: "incheon", city: "인천 연수구", summary: "송도 신도시 온천, 프리미엄", tags: ["야외온천","프리미엄","조용한"], priceLevel: "mid", avgDurationMin: 160, openHours: "07:00-21:00", highlights: ["노천탕","신도시","마사지"] },
      { id: "incheon-sauna-03", name: "인천 공항 근처 사우나", type: "sauna", region: "incheon", city: "인천 중구", summary: "이동 동선 사우나, 혼자 쉬기 좋음", tags: ["혼자","가성비"], priceLevel: "low", avgDurationMin: 140, openHours: "24시간", highlights: ["캡슐","교통 편리"] },
      { id: "incheon-food-01", name: "차이나타운 짜장면 거리", type: "restaurant", region: "incheon", city: "인천 중구", summary: "사우나 후 대표 먹거리", tags: ["점심","저녁","유명맛집"], priceLevel: "low", avgDurationMin: 70, highlights: ["짜장면","차이나타운","역사"] },
      { id: "incheon-food-02", name: "신포동 닭강정 거리", type: "restaurant", region: "incheon", city: "인천 중구", summary: "야간 간식 코스", tags: ["야간","가성비"], priceLevel: "low", avgDurationMin: 50, highlights: ["닭강정","골목","분위기"] },
      { id: "incheon-food-03", name: "월미도 회·해산물", type: "restaurant", region: "incheon", city: "인천 중구", summary: "바다 근처 신선 해산물", tags: ["회","야간","프리미엄"], priceLevel: "mid", avgDurationMin: 90, highlights: ["활어회","바다뷰","산책"] },
      { id: "incheon-att-01", name: "월미도", type: "attraction", region: "incheon", city: "인천 중구", summary: "바다 산책과 관광차, 오후 완충", tags: ["산책","바다","가족"], priceLevel: "low", avgDurationMin: 90, highlights: ["관광차","해변","야경"] },
      { id: "incheon-att-02", name: "송도 센트럴파크", type: "attraction", region: "incheon", city: "인천 연수구", summary: "도심 공원 산책, 사우나 완충", tags: ["산책","자연","조용한"], priceLevel: "low", avgDurationMin: 70, highlights: ["호수","자전거","잔디"] },
    ], "incheon")
  },
  {
    id: "daejeon", name: "대전", blurb: "유성 온천의 본고장, 과학도시 힐링",
    onsenDistrict: false,
    places: mergeRegionPlaces([      { id: "daejeon-sauna-01", name: "유성온천지구 사우나", type: "spa", region: "daejeon", city: "대전 유성구", summary: "유성온천 본고장 노천온천", tags: ["야외온천","프리미엄","조용한"], priceLevel: "mid", avgDurationMin: 180, openHours: "07:00-21:00", highlights: ["노천탕","온천거리","역사"] },
      { id: "daejeon-sauna-02", name: "대전 시내 사우나", type: "sauna", region: "daejeon", city: "대전 서구", summary: "번화가 동네 사우나, 가성비", tags: ["가성비","동네","혼자"], priceLevel: "low", avgDurationMin: 120, openHours: "24시간", highlights: ["저렴","한증막","조용"] },
      { id: "daejeon-sauna-03", name: "둔산 찜질방", type: "jjimjilbang", region: "daejeon", city: "대전 서구", summary: "둔산 상권 찜질방, 가족 친화", tags: ["가족","야간"], priceLevel: "mid", avgDurationMin: 200, openHours: "24시간", highlights: ["수면실","키즈존","식사"] },
      { id: "daejeon-food-01", name: "성심당(둔산점)", type: "restaurant", region: "daejeon", city: "대전 서구", summary: "사우나 전 가벼운 베이커리", tags: ["간식","유명맛집"], priceLevel: "low", avgDurationMin: 40, highlights: ["튀김빵","베이커리","선물"] },
      { id: "daejeon-food-02", name: "둔산 먹자골목", type: "restaurant", region: "daejeon", city: "대전 서구", summary: "사우나 후 든든한 한 끼", tags: ["저녁","가족"], priceLevel: "mid", avgDurationMin: 80, highlights: ["골목","다양","분위기"] },
      { id: "daejeon-food-03", name: "유성 온천거리 막창·곱창", type: "restaurant", region: "daejeon", city: "대전 유성구", summary: "온천 마무리 보양 안주", tags: ["야간","저녁"], priceLevel: "mid", avgDurationMin: 90, highlights: ["막창","곱창","술집"] },
      { id: "daejeon-att-01", name: "엑스포과학공원", type: "attraction", region: "daejeon", city: "대전 유성구", summary: "온천 전후 산책 코스", tags: ["산책","문화","가족"], priceLevel: "low", avgDurationMin: 90, highlights: ["전시","잔디","야경"] },
      { id: "daejeon-att-02", name: "보문산 전망대", type: "attraction", region: "daejeon", city: "대전 중구", summary: "도시 전망 산책, 오후 완충", tags: ["산책","사진","자연"], priceLevel: "low", avgDurationMin: 80, highlights: ["전망대","케이블카","야경"] },
    ], "daejeon")
  },
  {
    id: "gwangju", name: "광주", blurb: "남도 음식의 중심, 예술의 거리 힐링",
    onsenDistrict: false,
    places: mergeRegionPlaces([      { id: "gwangju-sauna-01", name: "광주 시내 사우나", type: "sauna", region: "gwangju", city: "광주 동구", summary: "번화가 동네 사우나, 가성비", tags: ["가성비","동네","혼자"], priceLevel: "low", avgDurationMin: 120, openHours: "24시간", highlights: ["저렴","한증막","조용"] },
      { id: "gwangju-sauna-02", name: "무등산 온천 사우나", type: "spa", region: "gwangju", city: "광주 동구", summary: "무등산 기슭 온천, 프리미엄", tags: ["야외온천","프리미엄","조용한"], priceLevel: "mid", avgDurationMin: 160, openHours: "07:00-21:00", highlights: ["노천탕","산자락","마사지"] },
      { id: "gwangju-sauna-03", name: "광주 찜질방", type: "jjimjilbang", region: "gwangju", city: "광주 서구", summary: "상권 찜질방, 가족 친화", tags: ["가족","야간"], priceLevel: "mid", avgDurationMin: 200, openHours: "24시간", highlights: ["수면실","키즈존","식사"] },
      { id: "gwangju-food-01", name: "충장로 돼지국밥 거리", type: "restaurant", region: "gwangju", city: "광주 동구", summary: "사우나 나와서 뜨끈한 국밥", tags: ["아침","저녁","가성비"], priceLevel: "low", avgDurationMin: 60, highlights: ["국밥","보양","아침"] },
      { id: "gwangju-food-02", name: "남도 맛집(한정식)", type: "restaurant", region: "gwangju", city: "광주 북구", summary: "남도 정성 한정식, 점심 추천", tags: ["점심","프리미엄","가족"], priceLevel: "mid", avgDurationMin: 90, highlights: ["한정식","남도","전통"] },
      { id: "gwangju-food-03", name: "양동시장 떡갈비·맛집", type: "restaurant", region: "gwangju", city: "광주 북구", summary: "시장 골목 야식 코스", tags: ["야간","가성비"], priceLevel: "low", avgDurationMin: 70, highlights: ["떡갈비","시장","분위기"] },
      { id: "gwangju-att-01", name: "무등산 국립공원", type: "attraction", region: "gwangju", city: "광주 동구", summary: "온천 전후 산책 코스", tags: ["등산","자연","사진"], priceLevel: "low", avgDurationMin: 120, highlights: ["규봉","바위","단풍"] },
      { id: "gwangju-att-02", name: "우치공원·패밀리랜드", type: "attraction", region: "gwangju", city: "광주 북구", summary: "가족 공원 산책, 오후 완충", tags: ["산책","가족","자연"], priceLevel: "low", avgDurationMin: 90, highlights: ["호수","동물원","잔디"] },
    ], "gwangju")
  },
  {
    id: "daegu", name: "대구", blurb: "약령시와 스파밸리, 온천과 먹거리 도시",
    onsenDistrict: false,
    places: mergeRegionPlaces([      { id: "daegu-sauna-01", name: "리조트 스파밸리", type: "spa", region: "daegu", city: "대구 달서구", summary: "대규모 스파 리조트, 프리미엄", tags: ["야외온천","프리미엄","가족"], priceLevel: "high", avgDurationMin: 200, openHours: "08:00-22:00", highlights: ["노천탕","워터파크","마사지"] },
      { id: "daegu-sauna-02", name: "동성로 사우나", type: "sauna", region: "daegu", city: "대구 중구", summary: "번화가 동네 사우나, 가성비", tags: ["가성비","동네","혼자"], priceLevel: "low", avgDurationMin: 120, openHours: "24시간", highlights: ["저렴","한증막","조용"] },
      { id: "daegu-sauna-03", name: "수성구 온천 사우나", type: "spa", region: "daegu", city: "대구 수성구", summary: "수성못 근처 온천, 프리미엄", tags: ["야외온천","조용한","프리미엄"], priceLevel: "mid", avgDurationMin: 160, openHours: "07:00-21:00", highlights: ["노천탕","못뷰","마사지"] },
      { id: "daegu-food-01", name: "동성로 먹자골목", type: "restaurant", region: "daegu", city: "대구 중구", summary: "사우나 후 든든한 한 끼", tags: ["저녁","가족","가성비"], priceLevel: "low", avgDurationMin: 80, highlights: ["골목","다양","분위기"] },
      { id: "daegu-food-02", name: "안지랑 곱창골목", type: "restaurant", region: "daegu", city: "대구 남구", summary: "대구 명물 곱창, 저녁 추천", tags: ["저녁","유명맛집","야간"], priceLevel: "mid", avgDurationMin: 90, highlights: ["곱창","골목","술집"] },
      { id: "daegu-food-03", name: "약령시 한방차·보양식", type: "restaurant", region: "daegu", city: "대구 중구", summary: "사우나 전 보양 차 한 잔", tags: ["점심","보양"], priceLevel: "low", avgDurationMin: 50, highlights: ["한방","약초","전통"] },
      { id: "daegu-att-01", name: "수성못", type: "attraction", region: "daegu", city: "대구 수성구", summary: "호수 산책, 오후 완충", tags: ["산책","바다","가족"], priceLevel: "low", avgDurationMin: 80, highlights: ["호수","분수","야경"] },
      { id: "daegu-att-02", name: "대구향교·공산성", type: "attraction", region: "daegu", city: "대구 중구", summary: "문화 산책, 사우나 완충", tags: ["산책","문화","사진"], priceLevel: "low", avgDurationMin: 70, highlights: ["향교","전통","골목"] },
    ], "daegu")
  },
  {
    id: "gyeonggi", name: "경기", blurb: "수도권 온천과 대형 찜질방, 당일치기 힐링",
    onsenDistrict: false,
    places: mergeRegionPlaces([
      { id: "gyeonggi-sauna-01", name: "수원 인계 사우나", type: "sauna", region: "gyeonggi", city: "경기 수원시", summary: "절다운 동네 사우나, 가성비", tags: ["가성비","동네","혼자"], priceLevel: "low", avgDurationMin: 120, openHours: "24시간", highlights: ["저렴","한증막","조용"] },
      { id: "gyeonggi-sauna-02", name: "용인 리조트 온천", type: "spa", region: "gyeonggi", city: "경기 용인시", summary: "에버랜드 근처 노천온천, 가족 친화", tags: ["야외온천","가족","프리미엄"], priceLevel: "high", avgDurationMin: 200, openHours: "08:00-22:00", highlights: ["노천탕","워터파크","키즈존"] },
      { id: "gyeonggi-sauna-03", name: "성남 분당 사우나", type: "sauna", region: "gyeonggi", city: "경기 성남시", summary: "신도시 동네 사우나, 조용", tags: ["조용한","혼자"], priceLevel: "low", avgDurationMin: 130, openHours: "24시간", highlights: ["저렴","수면실"] },
      { id: "gyeonggi-lodging-01", name: "화성 오토캠핑 리조트", type: "lodging", region: "gyeonggi", city: "경기 화성시", summary: "온천 보유 펜션, 사우나 패키지", tags: ["온천","가족","프리미엄"], priceLevel: "high", avgDurationMin: 600, hasOnsen: true, highlights: ["개별 온천","바베큐","주차"] },
      { id: "gyeonggi-food-01", name: "수원 팔달문 야리", type: "restaurant", region: "gyeonggi", city: "경기 수원시", summary: "사우나 후 든든한 야리", tags: ["저녁","가성비"], priceLevel: "low", avgDurationMin: 70, highlights: ["갈비","막국수","시장"] },
      { id: "gyeonggi-att-01", name: "수원 화성행궁", type: "attraction", region: "gyeonggi", city: "경기 수원시", summary: "온천 전후 산책 코스", tags: ["산책","문화","사진"], priceLevel: "low", avgDurationMin: 100, highlights: ["행궁","요새","야경"] },
    ], "gyeonggi")
  },
  {
    id: "chungbuk", name: "충북", blurb: "청주·충주 온천과 산골 한정식 힐링",
    onsenDistrict: false,
    places: mergeRegionPlaces([
      { id: "chungbuk-sauna-01", name: "청주 사우나", type: "sauna", region: "chungbuk", city: "충북 청주시", summary: "도심 동네 사우나, 가성비", tags: ["가성비","동네","혼자"], priceLevel: "low", avgDurationMin: 120, openHours: "24시간", highlights: ["저렴","한증막"] },
      { id: "chungbuk-sauna-02", name: "충주 온천 리조트", type: "spa", region: "chungbuk", city: "충북 충주시", summary: "호수 근처 노천온천", tags: ["야외온천","프리미엄"], priceLevel: "mid", avgDurationMin: 180, highlights: ["노천탕","호수뷰"] },
      { id: "chungbuk-food-01", name: "청주 막국수 거리", type: "restaurant", region: "chungbuk", city: "충북 청주시", summary: "사우나 후 막국수", tags: ["저녁","가성비"], priceLevel: "low", avgDurationMin: 50, highlights: ["막국수","순대국"] },
      { id: "chungbuk-att-01", name: "청남대", type: "attraction", region: "chungbuk", city: "충북 청주시", summary: "온천 전후 산책", tags: ["산책","자연","조용한"], priceLevel: "low", avgDurationMin: 90, highlights: ["대통령별장","호수","잔디"] },
    ], "chungbuk")
  },
  {
    id: "chungnam", name: "충남", blurb: "아산 온양온천·보령 머드축제로 유명한 온천 지방",
    onsenDistrict: true,
    places: mergeRegionPlaces([
      { id: "chungnam-sauna-01", name: "아산 온양온천 사우나", type: "spa", region: "chungnam", city: "충남 아산시", summary: "유서 깊은 온천 본고장", tags: ["온천","조용한","가성비"], priceLevel: "mid", avgDurationMin: 180, openHours: "06:00-22:00", highlights: ["전통 온천","저렴","역사"] },
      { id: "chungnam-sauna-02", name: "천안 사우나", type: "sauna", region: "chungnam", city: "충남 천안시", summary: "터미널 근처 동네 사우나", tags: ["가성비","혼자"], priceLevel: "low", avgDurationMin: 120, openHours: "24시간", highlights: ["교통편리","저렴"] },
      { id: "chungnam-sauna-03", name: "보령 머드온천", type: "spa", region: "chungnam", city: "충남 보령시", summary: "바다 근처 온천, 프리미엄", tags: ["야외온천","바다","프리미엄"], priceLevel: "high", avgDurationMin: 160, highlights: ["노천탕","바다뷰"] },
      { id: "chungnam-food-01", name: "아산 온양맛집(민물장어)", type: "restaurant", region: "chungnam", city: "충남 아산시", summary: "온천 후 보양식", tags: ["보양","유명맛집"], priceLevel: "mid", avgDurationMin: 80, highlights: ["장어구이","전통"] },
      { id: "chungnam-att-01", name: "독립기념관", type: "attraction", region: "chungnam", city: "충남 천안시", summary: "온천 전후 사적", tags: ["산책","문화"], priceLevel: "low", avgDurationMin: 90, highlights: ["사적","자연"] },
    ], "chungnam")
  },
  {
    id: "jeonbuk", name: "전북", blurb: "전주 한옥마을·군산 근대 거리와 온천",
    onsenDistrict: false,
    places: mergeRegionPlaces([
      { id: "jeonbuk-sauna-01", name: "전주 한옥 온천 사우나", type: "spa", region: "jeonbuk", city: "전북 전주시", summary: "한옥마을 근처 노천온천", tags: ["야외온천","한옥","조용한"], priceLevel: "mid", avgDurationMin: 170, highlights: ["노천탕","한적"] },
      { id: "jeonbuk-sauna-02", name: "군산 사우나", type: "sauna", region: "jeonbuk", city: "전북 군산시", summary: "근대 거리 동네 사우나, 가성비", tags: ["가성비","동네"], priceLevel: "low", avgDurationMin: 120, openHours: "24시간", highlights: ["저렴","한증막"] },
      { id: "jeonbuk-food-01", name: "전주 한정식(교동 마을)", type: "restaurant", region: "jeonbuk", city: "전북 전주시", summary: "사우나 전 한정식", tags: ["점심","프리미엄","가족"], priceLevel: "mid", avgDurationMin: 90, highlights: ["한정식","한옥","전통"] },
      { id: "jeonbuk-food-02", name: "군산 낙지·간장게장", type: "restaurant", region: "jeonbuk", city: "전북 군산시", summary: "바다 근처 보양식", tags: ["회","야간","프리미엄"], priceLevel: "high", avgDurationMin: 90, highlights: ["낙지","게장","바다뷰"] },
      { id: "jeonbuk-att-01", name: "전주 한옥마을", type: "attraction", region: "jeonbuk", city: "전북 전주시", summary: "온천 전후 골목 산책", tags: ["산책","사진","가족"], priceLevel: "low", avgDurationMin: 90, highlights: ["한옥","골목","카페"] },
    ], "jeonbuk")
  },
  {
    id: "jeonnam", name: "전남", blurb: "여수·순천 바다와 농경지 온천",
    onsenDistrict: false,
    places: mergeRegionPlaces([
      { id: "jeonnam-sauna-01", name: "여수 오동도 온천 사우나", type: "spa", region: "jeonnam", city: "전남 여수시", summary: "바다 뷰 노천온천", tags: ["야외온천","바다","프리미엄"], priceLevel: "high", avgDurationMin: 170, highlights: ["노천탕","바다뷰","마사지"] },
      { id: "jeonnam-sauna-02", name: "순천 사우나", type: "sauna", region: "jeonnam", city: "전남 순천시", summary: "호수 공원 근처 동네 사우나", tags: ["가성비","조용한"], priceLevel: "low", avgDurationMin: 120, openHours: "24시간", highlights: ["저렴","한증막"] },
      { id: "jeonnam-food-01", name: "여수 회·돌산갓김치", type: "restaurant", region: "jeonnam", city: "전남 여수시", summary: "바다 근처 신선 해산물", tags: ["회","야간","프리미엄"], priceLevel: "high", avgDurationMin: 90, highlights: ["활어회","갓김치","바다뷰"] },
      { id: "jeonnam-att-01", name: "순천만 정원", type: "attraction", region: "jeonnam", city: "전남 순천시", summary: "온천 전후 습지 산책", tags: ["산책","자연","사진"], priceLevel: "low", avgDurationMin: 120, highlights: ["갈대","습지","야경"] },
    ], "jeonnam")
  },
  {
    id: "gyeongbuk", name: "경북", blurb: "경주·안동 온천과 한옥 스파",
    onsenDistrict: true,
    places: mergeRegionPlaces([
      { id: "gyeongbuk-sauna-01", name: "안동 하회 온천 사우나", type: "spa", region: "gyeongbuk", city: "경북 안동시", summary: "하회마을 근처 노천온천", tags: ["야외온천","한옥","조용한"], priceLevel: "mid", avgDurationMin: 170, highlights: ["노천탕","한적","전통"] },
      { id: "gyeongbuk-sauna-02", name: "포항 사우나", type: "sauna", region: "gyeongbuk", city: "경북 포항시", summary: "바다 근처 동네 사우나, 가성비", tags: ["가성비","동네"], priceLevel: "low", avgDurationMin: 120, openHours: "24시간", highlights: ["저렴","한증막"] },
      { id: "gyeongbuk-sauna-03", name: "경주 보문 온천 리조트", type: "jjimjilbang", region: "gyeongbuk", city: "경북 경주시", summary: "호수 리조트 찜질방, 가족 친화", tags: ["가족","호수","프리미엄"], priceLevel: "high", avgDurationMin: 220, openHours: "24시간", highlights: ["호수뷰","키즈존","수영장"] },
      { id: "gyeongbuk-food-01", name: "안동 간고등어·찜닭", type: "restaurant", region: "gyeongbuk", city: "경북 안동시", summary: "사우나 후 보양식", tags: ["보양","유명맛집"], priceLevel: "mid", avgDurationMin: 80, highlights: ["간고등어","찜닭","전통"] },
      { id: "gyeongbuk-att-01", name: "경주 불국사", type: "attraction", region: "gyeongbuk", city: "경북 경주시", summary: "온천 전후 사찰 탐방", tags: ["사찰","자연","조용한"], priceLevel: "low", avgDurationMin: 120, highlights: ["석탑","산사","세계유산"] },
    ], "gyeongbuk")
  },
  {
    id: "gyeongnam", name: "경남", blurb: "창원·거제 바다 온천과 한방 사우나",
    onsenDistrict: false,
    places: mergeRegionPlaces([
      { id: "gyeongnam-sauna-01", name: "창원 사우나", type: "sauna", region: "gyeongnam", city: "경남 창원시", summary: "도심 동네 사우나, 가성비", tags: ["가성비","동네","혼자"], priceLevel: "low", avgDurationMin: 120, openHours: "24시간", highlights: ["저렴","한증막","조용"] },
      { id: "gyeongnam-sauna-02", name: "거제 바다 온천", type: "spa", region: "gyeongnam", city: "경남 거제시", summary: "바다 뷰 노천온천, 프리미엄", tags: ["야외온천","바다","프리미엄"], priceLevel: "high", avgDurationMin: 180, highlights: ["노천탕","바다뷰","마사지"] },
      { id: "gyeongnam-sauna-03", name: "김해 한방 사우나", type: "sauna", region: "gyeongnam", city: "경남 김해시", summary: "한방 찜질, 건강 중심", tags: ["한방","조용한","혼자"], priceLevel: "mid", avgDurationMin: 150, highlights: ["한방탕","족욕","조용"] },
      { id: "gyeongnam-food-01", name: "통영 충무김밥·굴", type: "restaurant", region: "gyeongnam", city: "경남 통영시", summary: "바다 근처 신선 해산물", tags: ["회","야간","가성비"], priceLevel: "mid", avgDurationMin: 80, highlights: ["굴","김밥","바다뷰"] },
      { id: "gyeongnam-att-01", name: "거제 해금강", type: "attraction", region: "gyeongnam", city: "경남 거제시", summary: "온천 전후 바다 산책", tags: ["산책","바다","사진"], priceLevel: "low", avgDurationMin: 120, highlights: ["바위섬","유람선","야경"] },
    ], "gyeongnam")
  },
  {
    id: "ulsan", name: "울산", blurb: "산업 도시의 숨은 온천과 바다 사우나",
    onsenDistrict: false,
    places: mergeRegionPlaces([
      { id: "ulsan-sauna-01", name: "울산 시내 사우나", type: "sauna", region: "ulsan", city: "울산 남구", summary: "도심 동네 사우나, 가성비", tags: ["가성비","동네","혼자"], priceLevel: "low", avgDurationMin: 120, openHours: "24시간", highlights: ["저렴","한증막","조용"] },
      { id: "ulsan-sauna-02", name: "울주 온천 리조트", type: "spa", region: "ulsan", city: "울산 울주군", summary: "산속 노천온천, 프리미엄", tags: ["야외온천","자연","프리미엄"], priceLevel: "high", avgDurationMin: 190, highlights: ["노천탕","산자락","마사지"] },
      { id: "ulsan-food-01", name: "울산 고기거리", type: "restaurant", region: "ulsan", city: "울산 남구", summary: "사우나 후 든든한 고기", tags: ["저녁","가족"], priceLevel: "mid", avgDurationMin: 90, highlights: ["소고기","골목","분위기"] },
      { id: "ulsan-att-01", name: "태화강 대숲", type: "attraction", region: "ulsan", city: "울산 중구", summary: "온천 전후 강 산책", tags: ["산책","자연","조용한"], priceLevel: "low", avgDurationMin: 80, highlights: ["억새","강뷰","야경"] },
    ], "ulsan")
  },
  {
    id: "sejong", name: "세종", blurb: "계획 도시의 조용한 사우나와 호수 산책",
    onsenDistrict: false,
    places: mergeRegionPlaces([
      { id: "sejong-sauna-01", name: "세종 사우나", type: "sauna", region: "sejong", city: "세종 세종시", summary: "행정도시 동네 사우나, 가성비", tags: ["가성비","조용한","혼자"], priceLevel: "low", avgDurationMin: 120, openHours: "24시간", highlights: ["저렴","한증막","조용"] },
      { id: "sejong-food-01", name: "세종 호수공원 맛집", type: "restaurant", region: "sejong", city: "세종 세종시", summary: "사우나 후 가볍게", tags: ["점심","가성비"], priceLevel: "low", avgDurationMin: 60, highlights: ["카페","파스타","호수뷰"] },
      { id: "sejong-att-01", name: "세종 호수공원", type: "attraction", region: "sejong", city: "세종 세종시", summary: "온천 전후 산책 코스", tags: ["산책","자연","가족"], priceLevel: "low", avgDurationMin: 70, highlights: ["호수","분수","잔디"] },
    ], "sejong")
  },
];

// ── 17시도 온천·사우나 보유 숙소 curated (코스 자동 포함용) ──
// 각 시도 1~2개, hasOnsen/hasSauna 표기로 fallback/LLM에서 숙소 추천 가중
const LODGING_BY_REGION: Record<string, Place[]> = {
  seoul: [
    { id: "seoul-lodging-01", name: "서울 스파 캡슐 호텔", type: "lodging", region: "seoul", city: "서울 중구", summary: "동대문 인근 온천·사우나 복합 숙소", tags: ["온천","사우나","프리미엄"], priceLevel: "mid", avgDurationMin: 480, hasOnsen: true, hasSauna: true, highlights: ["노천탕","캡슐","중심가"] },
  ],
  busan: [
    { id: "busan-lodging-01", name: "해운대 스파 리조트", type: "lodging", region: "busan", city: "부산 해운대구", summary: "바다 뷰 온천 리조트", tags: ["온천","바다","가족"], priceLevel: "high", avgDurationMin: 600, hasOnsen: true, highlights: ["노천탕","바다뷰","수영장"] },
  ],
  daegu: [
    { id: "daegu-lodging-01", name: "수성 스파 호텔", type: "lodging", region: "daegu", city: "대구 수성구", summary: "수성못 근처 온천 호텔", tags: ["온천","프리미엄"], priceLevel: "mid", avgDurationMin: 480, hasOnsen: true, highlights: ["노천탕","못뷰"] },
  ],
  incheon: [
    { id: "incheon-lodging-01", name: "송도 온천 호텔", type: "lodging", region: "incheon", city: "인천 연수구", summary: "송도 신도시 온천 숙소", tags: ["온천","조용한"], priceLevel: "mid", avgDurationMin: 480, hasOnsen: true, highlights: ["노천탕","신도시"] },
  ],
  gwangju: [
    { id: "gwangju-lodging-01", name: "무등산 온천 펜션", type: "lodging", region: "gwangju", city: "광주 동구", summary: "무등산 기슭 온천 펜션", tags: ["온천","자연"], priceLevel: "mid", avgDurationMin: 540, hasOnsen: true, highlights: ["노천탕","산자락"] },
  ],
  daejeon: [
    { id: "daejeon-lodging-01", name: "유성온천 리조트", type: "lodging", region: "daejeon", city: "대전 유성구", summary: "유성온천 본고장 리조트", tags: ["온천","역사","가족"], priceLevel: "high", avgDurationMin: 600, hasOnsen: true, highlights: ["노천탕","온천거리"] },
  ],
  ulsan: [
    { id: "ulsan-lodging-01", name: "울주 온천 콘도", type: "lodging", region: "ulsan", city: "울산 울주군", summary: "산속 온천 콘도", tags: ["온천","자연","가족"], priceLevel: "mid", avgDurationMin: 540, hasOnsen: true, highlights: ["노천탕","산자락"] },
  ],
  sejong: [
    { id: "sejong-lodging-01", name: "세종 호수 리조트", type: "lodging", region: "sejong", city: "세종 세종시", summary: "호수공원 인근 온천 리조트", tags: ["온천","가족"], priceLevel: "mid", avgDurationMin: 540, hasOnsen: true, highlights: ["노천탕","호수뷰"] },
  ],
  gyeonggi: [
    { id: "gyeonggi-lodging-01", name: "화성 오토캠핑 리조트", type: "lodging", region: "gyeonggi", city: "경기 화성시", summary: "온천 보유 펜션, 사우나 패키지", tags: ["온천","가족","프리미엄"], priceLevel: "high", avgDurationMin: 600, hasOnsen: true, hasSauna: true, highlights: ["개별 온천","바베큐","주차"] },
    { id: "gyeonggi-lodging-02", name: "가평 온천 펜션", type: "lodging", region: "gyeonggi", city: "경기 가평군", summary: "계곡 온천 펜션", tags: ["온천","자연","조용한"], priceLevel: "mid", avgDurationMin: 540, hasOnsen: true, highlights: ["노천탕","계곡"] },
  ],
  gangwon: [
    { id: "gangwon-lodging-01", name: "강릉 바다 온천 리조트", type: "lodging", region: "gangwon", city: "강원 강릉시", summary: "바다 뷰 온천 리조트", tags: ["온천","바다","가족"], priceLevel: "high", avgDurationMin: 600, hasOnsen: true, highlights: ["노천탕","바다뷰"] },
    { id: "gangwon-lodging-02", name: "평창 스파 콘도", type: "lodging", region: "gangwon", city: "강원 평창군", summary: "스키장 인근 온천 콘도", tags: ["온천","자연"], priceLevel: "mid", avgDurationMin: 540, hasOnsen: true, highlights: ["노천탕","산자락"] },
  ],
  chungbuk: [
    { id: "chungbuk-lodging-01", name: "충주 호수 온천 리조트", type: "lodging", region: "chungbuk", city: "충북 충주시", summary: "호수 근처 온천 리조트", tags: ["온천","가족"], priceLevel: "high", avgDurationMin: 600, hasOnsen: true, highlights: ["노천탕","호수뷰"] },
  ],
  chungnam: [
    { id: "chungnam-lodging-01", name: "아산 온양 온천 호텔", type: "lodging", region: "chungnam", city: "충남 아산시", summary: "온양온천 본고장 호텔", tags: ["온천","역사"], priceLevel: "mid", avgDurationMin: 480, hasOnsen: true, highlights: ["전통 온천","저렴"] },
    { id: "chungnam-lodging-02", name: "보령 머드 온천 리조트", type: "lodging", region: "chungnam", city: "충남 보령시", summary: "바다 온천 리조트", tags: ["온천","바다"], priceLevel: "high", avgDurationMin: 600, hasOnsen: true, highlights: ["노천탕","바다뷰"] },
  ],
  jeonbuk: [
    { id: "jeonbuk-lodging-01", name: "전주 한옥 온천 스테이", type: "lodging", region: "jeonbuk", city: "전북 전주시", summary: "한옥마을 온천 게스트하우스", tags: ["온천","한옥","조용한"], priceLevel: "mid", avgDurationMin: 480, hasOnsen: true, highlights: ["한옥","노천탕"] },
  ],
  jeonnam: [
    { id: "jeonnam-lodging-01", name: "여수 바다 온천 리조트", type: "lodging", region: "jeonnam", city: "전남 여수시", summary: "바다 뷰 온천 리조트", tags: ["온천","바다","프리미엄"], priceLevel: "high", avgDurationMin: 600, hasOnsen: true, highlights: ["노천탕","바다뷰"] },
    { id: "jeonnam-lodging-02", name: "순천만 온천 펜션", type: "lodging", region: "jeonnam", city: "전남 순천시", summary: "습지 근처 온천 펜션", tags: ["온천","자연"], priceLevel: "mid", avgDurationMin: 540, hasOnsen: true, highlights: ["노천탕","갈대"] },
  ],
  gyeongbuk: [
    { id: "gyeongbuk-lodging-01", name: "안동 하회 온천 한옥", type: "lodging", region: "gyeongbuk", city: "경북 안동시", summary: "하회마을 온천 한옥", tags: ["온천","한옥","조용한"], priceLevel: "mid", avgDurationMin: 480, hasOnsen: true, highlights: ["한옥","노천탕"] },
    { id: "gyeongbuk-lodging-02", name: "경주 보문 온천 리조트", type: "lodging", region: "gyeongbuk", city: "경북 경주시", summary: "호수 온천 리조트", tags: ["온천","가족","호수"], priceLevel: "high", avgDurationMin: 600, hasOnsen: true, highlights: ["노천탕","호수뷰"] },
  ],
  gyeongnam: [
    { id: "gyeongnam-lodging-01", name: "거제 바다 온천 리조트", type: "lodging", region: "gyeongnam", city: "경남 거제시", summary: "바다 뷰 온천 리조트", tags: ["온천","바다","프리미엄"], priceLevel: "high", avgDurationMin: 600, hasOnsen: true, highlights: ["노천탕","바다뷰"] },
    { id: "gyeongnam-lodging-02", name: "김해 한방 온천 호텔", type: "lodging", region: "gyeongnam", city: "경남 김해시", summary: "한방 온천 호텔", tags: ["온천","한방"], priceLevel: "mid", avgDurationMin: 480, hasOnsen: true, highlights: ["한방탕","족욕"] },
  ],
  jeju: [
    { id: "jeju-lodging-01", name: "서귀포 바다 온천 리조트", type: "lodging", region: "jeju", city: "제주 서귀포시", summary: "바다 뷰 온천 리조트", tags: ["온천","바다","프리미엄"], priceLevel: "high", avgDurationMin: 600, hasOnsen: true, highlights: ["노천탕","바다뷰"] },
    { id: "jeju-lodging-02", name: "제주 시티 사우나 호텔", type: "lodging", region: "jeju", city: "제주 제주시", summary: "사우나 복합 시티 호텔", tags: ["사우나","가성비"], priceLevel: "low", avgDurationMin: 420, hasSauna: true, highlights: ["한증막","저렴"] },
  ],
  gyeongju: [
    { id: "gyeongju-lodging-01", name: "경주 황남 온천 한옥", type: "lodging", region: "gyeongju", city: "경북 경주시", summary: "불국사 인근 온천 한옥", tags: ["온천","한옥","조용한"], priceLevel: "mid", avgDurationMin: 480, hasOnsen: true, highlights: ["한옥","노천탕"] },
  ],
};

// 각 지역에 curated 숙소 주입 (중복 id 방지)
for (const r of regions) {
  const extra = LODGING_BY_REGION[r.id] ?? [];
  for (const p of extra) {
    if (!r.places.some((x) => x.id === p.id)) r.places.push(withSigungu(p));
  }
}


export function getRegion(id: string): RegionData | undefined {
  return regions.find((r) => r.id === id);
}
