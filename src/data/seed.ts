import type { RegionData } from "./schema";

// ───────────────────────────────────────────────────────────
// Phase 1 전체 시드 데이터셋
// 지역 5곳(서울/부산/강원/경주/제주) × 장소:
//   사우나계(sauna/jjimjilbang/spa) ≥3, restaurant ≥3, attraction ≥2
// 실제 존재하는 장소 위주로 작성. v1은 curated 데이터이므로
// 운영 단계에서 tourAPI 동기화로 신선도 보강 예정.
// ───────────────────────────────────────────────────────────

export const regions: RegionData[] = [
  // ───────────────────────── 서울 ─────────────────────────
  {
    id: "seoul",
    name: "서울",
    blurb: "도심 속 사우나와 골목 맛집이 공존하는 당일 힐링",
    places: [
      {
        id: "seoul-sauna-01", name: "청파상가 사우나", type: "sauna", region: "seoul",
        city: "서울 중구", summary: "오래된 동네 사우나, 가성비와 탕질 본연의 맛",
        tags: ["가성비", "동네사우나", "족욕"], priceLevel: "low", avgDurationMin: 120,
        openHours: "24시간", highlights: ["저렴한 이용료", "한증막", "조용한 분위기"],
      },
      {
        id: "seoul-sauna-02", name: "스파레이(여의도)", type: "jjimjilbang", region: "seoul",
        city: "서울 영등포구", summary: "한강 뷰 찜질방, 캡슐형 휴식",
        tags: ["프리미엄", "한강뷰", "야간"], priceLevel: "mid", avgDurationMin: 240,
        openHours: "24시간", highlights: ["한강 조망", "수면실", "식사 메뉴 다양"],
      },
      {
        id: "seoul-sauna-03", name: "서울역 사우나(캡슐)", type: "sauna", region: "seoul",
        city: "서울 용산구", summary: "이동 동선 중심 동네 사우나, 혼자 쉬기 좋음",
        tags: ["혼자", "가성비", "조용한"], priceLevel: "low", avgDurationMin: 150,
        openHours: "24시간", highlights: ["캡슐 휴식", "교통 편리", "조용"],
      },
      {
        id: "seoul-food-01", name: "을지로 골목 국밥 거리", type: "restaurant", region: "seoul",
        city: "서울 중구", summary: "사우나 전후 든든한 국밥 한 그릇",
        tags: ["저녁", "가성비"], priceLevel: "low", avgDurationMin: 60,
        highlights: ["뼈해장국", "곰탕", "야식하기 좋음"],
      },
      {
        id: "seoul-food-02", name: "명동 교자", type: "restaurant", region: "seoul",
        city: "서울 중구", summary: "칼국수·만두 본점, 사우나 전 가볍게",
        tags: ["점심", "유명맛집"], priceLevel: "mid", avgDurationMin: 50,
        highlights: ["냉면", "군만두", "대기 있음"],
      },
      {
        id: "seoul-food-03", name: "광장시장 빈대떡·육회", type: "restaurant", region: "seoul",
        city: "서울 종로구", summary: "전통시장 야식 코스",
        tags: ["야간", "가족"], priceLevel: "low", avgDurationMin: 70,
        highlights: ["빈대떡", "육회", "분위기"],
      },
      {
        id: "seoul-att-01", name: "덕수궁 돌담길", type: "attraction", region: "seoul",
        city: "서울 중구", summary: "사우나 앞뒤 산책하기 좋은 정적 코스",
        tags: ["산책", "사진", "조용한"], priceLevel: "low", avgDurationMin: 40,
        highlights: ["석조전", "가을 은행", "도심 산책"],
      },
      {
        id: "seoul-att-02", name: "북촌 한옥마을", type: "attraction", region: "seoul",
        city: "서울 종로구", summary: "한옥 골목 산책, 사우나 완충 코스",
        tags: ["산책", "사진", "가족"], priceLevel: "low", avgDurationMin: 60,
        highlights: ["한옥", "골목", "카페"],
      },
    ],
  },

  // ───────────────────────── 부산 ─────────────────────────
  {
    id: "busan",
    name: "부산",
    blurb: "바다와 함께 누리는 해운대·광안리 찜질 문화",
    places: [
      {
        id: "busan-sauna-01", name: "해운대 스파빌", type: "jjimjilbang", region: "busan",
        city: "부산 해운대구", summary: "바다 앞 찜질방, 야외 족욕과 온천",
        tags: ["해변", "족욕", "가족"], priceLevel: "mid", avgDurationMin: 210,
        openHours: "24시간", highlights: ["바다 전망", "야외 족욕", "키즈존"],
      },
      {
        id: "busan-sauna-02", name: "광안리 온천 사우나", type: "spa", region: "busan",
        city: "부산 수영구", summary: "광안대교 뷰 온천, 프리미엄 노천",
        tags: ["야외온천", "프리미엄", "야경"], priceLevel: "high", avgDurationMin: 150,
        highlights: ["노천탕", "야경", "마사지"],
      },
      {
        id: "busan-sauna-03", name: "동래 온천 사우나", type: "sauna", region: "busan",
        city: "부산 동래구", summary: "역사 깊은 온천 town 동네 사우나",
        tags: ["온천", "조용한", "가성비"], priceLevel: "low", avgDurationMin: 120,
        openHours: "06:00-22:00", highlights: ["전통 온천", "저렴", "조용"],
      },
      {
        id: "busan-food-01", name: "해운대 돼지국밥 거리", type: "restaurant", region: "busan",
        city: "부산 해운대구", summary: "사우나 나와서 뜨끈한 국밥",
        tags: ["아침", "저녁", "부산맛"], priceLevel: "low", avgDurationMin: 60,
        highlights: ["국밥", "순대국", "반찬 자율"],
      },
      {
        id: "busan-food-02", name: "광안리 회·조개구이", type: "restaurant", region: "busan",
        city: "부산 수영구", summary: "바다 근처 신선 해산물",
        tags: ["회", "야간", "프리미엄"], priceLevel: "high", avgDurationMin: 90,
        highlights: ["활어회", "조개구이", "바다뷰"],
      },
      {
        id: "busan-food-03", name: "부산 어묵(엄궁 엄마손)", type: "restaurant", region: "busan",
        city: "부산 부산진구", summary: "사우나 후 따뜻한 어묵 국물",
        tags: ["간식", "가성비"], priceLevel: "low", avgDurationMin: 40,
        highlights: ["어묵", "국물", "골목"],
      },
      {
        id: "busan-att-01", name: "광안대교 산책로", type: "attraction", region: "busan",
        city: "부산 수영구", summary: "사우나 전후 바다 산책 코스",
        tags: ["산책", "야경", "사진"], priceLevel: "low", avgDurationMin: 50,
        highlights: ["야간 조명", "해변", "자전거"],
      },
      {
        id: "busan-att-02", name: "감천문화마을", type: "attraction", region: "busan",
        city: "부산 사하구", summary: "색채 마을 산책, 오후 완충 코스",
        tags: ["사진", "가족", "산책"], priceLevel: "low", avgDurationMin: 90,
        highlights: ["벽화", "전망", "골목"],
      },
    ],
  },

  // ───────────────────────── 강원 ─────────────────────────
  {
    id: "gangwon",
    name: "강원",
    blurb: "산속 온천과 송어·감자 요리로 겨울 힐링",
    places: [
      {
        id: "gangwon-sauna-01", name: "평창 용평 온천", type: "spa", region: "gangwon",
        city: "강원 평창군", summary: "설원 속 노천온천, 프리미엄 힐링",
        tags: ["야외온천", "설경", "프리미엄"], priceLevel: "high", avgDurationMin: 180,
        openHours: "07:00-21:00", highlights: ["노천탕", "설경", "리조트 연계"],
      },
      {
        id: "gangwon-sauna-02", name: "강릉 시내 사우나", type: "sauna", region: "gangwon",
        city: "강원 강릉시", summary: "커피거리 근처 동네 사우나",
        tags: ["가성비", "동네", "조용한"], priceLevel: "low", avgDurationMin: 120,
        openHours: "24시간", highlights: ["저렴", "한증막", "조용"],
      },
      {
        id: "gangwon-sauna-03", name: "춘천 온천 리조트", type: "spa", region: "gangwon",
        city: "강원 춘천시", summary: "호수 근처 패밀리 온천",
        tags: ["가족", "야외온천", "프리미엄"], priceLevel: "mid", avgDurationMin: 200,
        openHours: "08:00-22:00", highlights: ["가족탕", "호수뷰", "수영장"],
      },
      {
        id: "gangwon-food-01", name: "평창 송어 회·매운탕", type: "restaurant", region: "gangwon",
        city: "강원 평창군", summary: "산간 송어 요리, 사우나 전 보양",
        tags: ["회", "보양", "겨울"], priceLevel: "mid", avgDurationMin: 80,
        highlights: ["송어회", "매운탕", "신선"],
      },
      {
        id: "gangwon-food-02", name: "강릉 안목 커피거리", type: "restaurant", region: "gangwon",
        city: "강원 강릉시", summary: "바다 앞 카페 거리, 사우나 후 휴식",
        tags: ["카페", "바다", "데이트"], priceLevel: "mid", avgDurationMin: 70,
        highlights: ["바다뷰", "테라스", "디저트"],
      },
      {
        id: "gangwon-food-03", name: "춘천 닭갈비 골목", type: "restaurant", region: "gangwon",
        city: "강원 춘천시", summary: "사우나 후 든든한 닭갈비",
        tags: ["저녁", "가족"], priceLevel: "mid", avgDurationMin: 90,
        highlights: ["닭갈비", "막국수", "분위기"],
      },
      {
        id: "gangwon-att-01", name: "오대산 국립공원", type: "attraction", region: "gangwon",
        city: "강원 평창군", summary: "온천 전후 숲 산책 코스",
        tags: ["등산", "사찰", "자연"], priceLevel: "low", avgDurationMin: 120,
        highlights: ["월정사", "숲길", "단풍"],
      },
      {
        id: "gangwon-att-02", name: "강릉 커피박물관·오죽헌", type: "attraction", region: "gangwon",
        city: "강원 강릉시", summary: "문화 산책, 오후 완충",
        tags: ["산책", "문화", "사진"], priceLevel: "low", avgDurationMin: 80,
        highlights: ["오죽헌", "육송", "전통"],
      },
    ],
  },

  // ───────────────────────── 경주 ─────────────────────────
  {
    id: "gyeongju",
    name: "경주",
    blurb: "천년 고도의 온천과 한정식으로 즐기는 힐링",
    places: [
      {
        id: "gyeongju-sauna-01", name: "경주 황남 온천", type: "spa", region: "gyeongju",
        city: "경북 경주시", summary: "불국사 근처 온천, 프리미엄 노천",
        tags: ["야외온천", "프리미엄", "조용한"], priceLevel: "mid", avgDurationMin: 170,
        openHours: "07:00-21:00", highlights: ["노천탕", "한적", "관광 연계"],
      },
      {
        id: "gyeongju-sauna-02", name: "경주 시내 사우나", type: "sauna", region: "gyeongju",
        city: "경북 경주시", summary: "번화가 동네 사우나, 가성비",
        tags: ["가성비", "동네", "혼자"], priceLevel: "low", avgDurationMin: 120,
        openHours: "24시간", highlights: ["저렴", "한증막", "조용"],
      },
      {
        id: "gyeongju-sauna-03", name: "보문단지 온천 리조트", type: "jjimjilbang", region: "gyeongju",
        city: "경북 경주시", summary: "호수 리조트 찜질방, 가족 친화",
        tags: ["가족", "호수", "프리미엄"], priceLevel: "high", avgDurationMin: 220,
        openHours: "24시간", highlights: ["호수뷰", "키즈존", "수영장"],
      },
      {
        id: "gyeongju-food-01", name: "황남빵 본점", type: "restaurant", region: "gyeongju",
        city: "경북 경주시", summary: "사우나 전 가벼운 간식 코스",
        tags: ["간식", "유명맛집"], priceLevel: "low", avgDurationMin: 30,
        highlights: ["황남빵", "전통", "선물"],
      },
      {
        id: "gyeongju-food-02", name: "경주 한정식(교촌 마을)", type: "restaurant", region: "gyeongju",
        city: "경북 경주시", summary: "한옥 마을 한정식, 점심 추천",
        tags: ["점심", "프리미엄", "가족"], priceLevel: "mid", avgDurationMin: 90,
        highlights: ["한정식", "한옥", "전통"],
      },
      {
        id: "gyeongju-food-03", name: "대릉원 근처 막국수·술집", type: "restaurant", region: "gyeongju",
        city: "경북 경주시", summary: "야간 가볍게, 사우나 후",
        tags: ["야간", "저녁"], priceLevel: "low", avgDurationMin: 70,
        highlights: ["막국수", "막걸리", "분위기"],
      },
      {
        id: "gyeongju-att-01", name: "첨성대·대릉원", type: "attraction", region: "gyeongju",
        city: "경북 경주시", summary: "고분 공원 산책, 오후 완충",
        tags: ["산책", "사진", "문화"], priceLevel: "low", avgDurationMin: 70,
        highlights: ["첨성대", "대릉원", "야경"],
      },
      {
        id: "gyeongju-att-02", name: "불국사", type: "attraction", region: "gyeongju",
        city: "경북 경주시", summary: "온천 전후 사찰 탐방",
        tags: ["사찰", "자연", "조용한"], priceLevel: "low", avgDurationMin: 120,
        highlights: ["석탑", "산사", "세계유산"],
      },
    ],
  },

  // ───────────────────────── 제주 ─────────────────────────
  {
    id: "jeju",
    name: "제주",
    blurb: "바다 뷰 온천과 흑돼지·해산물로 완성하는 힐링",
    places: [
      {
        id: "jeju-sauna-01", name: "제주 시티 사우나", type: "sauna", region: "jeju",
        city: "제주 제주시", summary: "공항 근처 동네 사우나, 가성비",
        tags: ["가성비", "동네", "혼자"], priceLevel: "low", avgDurationMin: 120,
        openHours: "24시간", highlights: ["저렴", "한증막", "교통 편리"],
      },
      {
        id: "jeju-sauna-02", name: "서귀포 리조트 온천", type: "spa", region: "jeju",
        city: "제주 서귀포시", summary: "바다 뷰 노천온천, 프리미엄",
        tags: ["야외온천", "바다", "프리미엄"], priceLevel: "high", avgDurationMin: 180,
        openHours: "08:00-22:00", highlights: ["노천탕", "바다뷰", "마사지"],
      },
      {
        id: "jeju-sauna-03", name: "제주 찜질방(올레)", type: "jjimjilbang", region: "jeju",
        city: "제주 제주시", summary: "가족 친화 찜질방",
        tags: ["가족", "야간"], priceLevel: "mid", avgDurationMin: 200,
        openHours: "24시간", highlights: ["수면실", "키즈존", "식사"],
      },
      {
        id: "jeju-food-01", name: "제주 흑돼지 거리", type: "restaurant", region: "jeju",
        city: "제주 제주시", summary: "사우나 후 든든한 흑돼지",
        tags: ["저녁", "프리미엄", "가족"], priceLevel: "mid", avgDurationMin: 100,
        highlights: ["흑돼지", "구이", "보양"],
      },
      {
        id: "jeju-food-02", name: "동문시장 칼국수·성게미역", type: "restaurant", region: "jeju",
        city: "제주 제주시", summary: "시장 골목 점심 코스",
        tags: ["점심", "가성비"], priceLevel: "low", avgDurationMin: 60,
        highlights: ["칼국수", "성게미역", "시장"],
      },
      {
        id: "jeju-food-03", name: "서귀포 해산물·갈치", type: "restaurant", region: "jeju",
        city: "제주 서귀포시", summary: "바다 근처 신선 해산물",
        tags: ["회", "야간", "프리미엄"], priceLevel: "high", avgDurationMin: 90,
        highlights: ["갈치", "활어회", "바다뷰"],
      },
      {
        id: "jeju-att-01", name: "성산일출봉", type: "attraction", region: "jeju",
        city: "제주 서귀포시", summary: "오전 산책 코스, 사우나 완충",
        tags: ["등산", "자연", "사진"], priceLevel: "low", avgDurationMin: 120,
        highlights: ["분화구", "해돋이", "올레"],
      },
      {
        id: "jeju-att-02", name: "협재·한림 해변", type: "attraction", region: "jeju",
        city: "제주 제주시", summary: "바다 산책, 오후 완충",
        tags: ["산책", "바다", "가족"], priceLevel: "low", avgDurationMin: 90,
        highlights: ["에메랄드 바다", "카페", "해변"],
      },
    ],
  },
];

export function getRegion(id: string): RegionData | undefined {
  return regions.find((r) => r.id === id);
}
