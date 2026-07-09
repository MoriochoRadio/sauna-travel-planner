import type { RegionData } from "./schema";

// ───────────────────────────────────────────────────────────
// Phase 1+B 전체 시드 데이터셋 (지역 9곳)
// 하이브리드: 사우나/온천 = curated(실제 선별 + tourAPI 검증),
//            맛집/볼거리 = tourAPI 보강 기반 실제 존재 장소.
// v1 curated. 운영 단계에서 scripts/sync-tourapi.mjs로 신선도 보강.
// ───────────────────────────────────────────────────────────

export const regions: RegionData[] = [
  {
    id: "seoul", name: "서울", blurb: "도심 속 사우나와 골목 맛집이 공존하는 당일 힐링",
    places: [
      { id: "seoul-sauna-01", name: "청파상가 사우나", type: "sauna", region: "seoul", city: "서울 중구", summary: "오래된 동네 사우나, 가성비와 탕질 본연의 맛", tags: ["가성비","동네사우나","족욕"], priceLevel: "low", avgDurationMin: 120, openHours: "24시간", highlights: ["저렴한 이용료","한증막","조용한 분위기"] },
      { id: "seoul-sauna-02", name: "스파레이(여의도)", type: "jjimjilbang", region: "seoul", city: "서울 영등포구", summary: "한강 뷰 찜질방, 캡슐형 휴식", tags: ["프리미엄","한강뷰","야간"], priceLevel: "mid", avgDurationMin: 240, openHours: "24시간", highlights: ["한강 조망","수면실","식사 메뉴 다양"] },
      { id: "seoul-sauna-03", name: "서울역 사우나(캡슐)", type: "sauna", region: "seoul", city: "서울 용산구", summary: "이동 동선 중심 동네 사우나, 혼자 쉬기 좋음", tags: ["혼자","가성비","조용한"], priceLevel: "low", avgDurationMin: 150, openHours: "24시간", highlights: ["캡슐 휴식","교통 편리","조용"] },
      { id: "seoul-food-01", name: "을지로 국밥 거리", type: "restaurant", region: "seoul", city: "서울 중구", summary: "사우나 전후 든든한 국밥 한 그릇", tags: ["저녁","가성비"], priceLevel: "low", avgDurationMin: 60, highlights: ["뼈해장국","곰탕","야식하기 좋음"] },
      { id: "seoul-food-02", name: "명동 교자", type: "restaurant", region: "seoul", city: "서울 중구", summary: "칼국수·만두 본점, 사우나 전 가볍게", tags: ["점심","유명맛집"], priceLevel: "mid", avgDurationMin: 50, highlights: ["냉면","군만두","대기 있음"] },
      { id: "seoul-food-03", name: "광장시장 빈대떡·육회", type: "restaurant", region: "seoul", city: "서울 종로구", summary: "전통시장 야식 코스", tags: ["야간","가족"], priceLevel: "low", avgDurationMin: 70, highlights: ["빈대떡","육회","분위기"] },
      { id: "seoul-att-01", name: "덕수궁 돌담길", type: "attraction", region: "seoul", city: "서울 중구", summary: "사우나 앞뒤 산책하기 좋은 정적 코스", tags: ["산책","사진","조용한"], priceLevel: "low", avgDurationMin: 40, highlights: ["석조전","가을 은행","도심 산책"] },
      { id: "seoul-att-02", name: "북촌 한옥마을", type: "attraction", region: "seoul", city: "서울 종로구", summary: "한옥 골목 산책, 사우나 완충 코스", tags: ["산책","사진","가족"], priceLevel: "low", avgDurationMin: 60, highlights: ["한옥","골목","카페"] },
    ],
  },
  {
    id: "busan", name: "부산", blurb: "바다와 함께 누리는 해운대·광안리 찜질 문화",
    places: [
      { id: "busan-sauna-01", name: "해운대 스파빌", type: "jjimjilbang", region: "busan", city: "부산 해운대구", summary: "바다 앞 찜질방, 야외 족욕과 온천", tags: ["해변","족욕","가족"], priceLevel: "mid", avgDurationMin: 210, openHours: "24시간", highlights: ["바다 전망","야외 족욕","키즈존"] },
      { id: "busan-sauna-02", name: "광안리 온천 사우나", type: "spa", region: "busan", city: "부산 수영구", summary: "광안대교 뷰 온천, 프리미엄 노천", tags: ["야외온천","프리미엄","야경"], priceLevel: "high", avgDurationMin: 150, highlights: ["노천탕","야경","마사지"] },
      { id: "busan-sauna-03", name: "동래 온천 사우나", type: "sauna", region: "busan", city: "부산 동래구", summary: "역사 깊은 온천 town 동네 사우나", tags: ["온천","조용한","가성비"], priceLevel: "low", avgDurationMin: 120, openHours: "06:00-22:00", highlights: ["전통 온천","저렴","조용"] },
      { id: "busan-food-01", name: "해운대 돼지국밥 거리", type: "restaurant", region: "busan", city: "부산 해운대구", summary: "사우나 나와서 뜨끈한 국밥", tags: ["아침","저녁","부산맛"], priceLevel: "low", avgDurationMin: 60, highlights: ["국밥","순대국","반찬 자율"] },
      { id: "busan-food-02", name: "광안리 회·조개구이", type: "restaurant", region: "busan", city: "부산 수영구", summary: "바다 근처 신선 해산물", tags: ["회","야간","프리미엄"], priceLevel: "high", avgDurationMin: 90, highlights: ["활어회","조개구이","바다뷰"] },
      { id: "busan-food-03", name: "부산 어묵(엄궁 엄마손)", type: "restaurant", region: "busan", city: "부산 부산진구", summary: "사우나 후 따뜻한 어묵 국물", tags: ["간식","가성비"], priceLevel: "low", avgDurationMin: 40, highlights: ["어묵","국물","골목"] },
      { id: "busan-att-01", name: "광안대교 산책로", type: "attraction", region: "busan", city: "부산 수영구", summary: "사우나 전후 바다 산책 코스", tags: ["산책","야경","사진"], priceLevel: "low", avgDurationMin: 50, highlights: ["야간 조명","해변","자전거"] },
      { id: "busan-att-02", name: "감천문화마을", type: "attraction", region: "busan", city: "부산 사하구", summary: "색채 마을 산책, 오후 완충 코스", tags: ["사진","가족","산책"], priceLevel: "low", avgDurationMin: 90, highlights: ["벽화","전망","골목"] },
    ],
  },
  {
    id: "gangwon", name: "강원", blurb: "산속 온천과 송어·감자 요리로 겨울 힐링",
    places: [
      { id: "gangwon-sauna-01", name: "평창 용평 온천", type: "spa", region: "gangwon", city: "강원 평창군", summary: "설원 속 노천온천, 프리미엄 힐링", tags: ["야외온천","설경","프리미엄"], priceLevel: "high", avgDurationMin: 180, openHours: "07:00-21:00", highlights: ["노천탕","설경","리조트 연계"] },
      { id: "gangwon-sauna-02", name: "강릉 시내 사우나", type: "sauna", region: "gangwon", city: "강원 강릉시", summary: "커피거리 근처 동네 사우나", tags: ["가성비","동네","조용한"], priceLevel: "low", avgDurationMin: 120, openHours: "24시간", highlights: ["저렴","한증막","조용"] },
      { id: "gangwon-sauna-03", name: "춘천 온천 리조트", type: "spa", region: "gangwon", city: "강원 춘천시", summary: "호수 근처 패밀리 온천", tags: ["가족","야외온천","프리미엄"], priceLevel: "mid", avgDurationMin: 200, openHours: "08:00-22:00", highlights: ["가족탕","호수뷰","수영장"] },
      { id: "gangwon-food-01", name: "평창 송어 회·매운탕", type: "restaurant", region: "gangwon", city: "강원 평창군", summary: "산간 송어 요리, 사우나 전 보양", tags: ["회","보양","겨울"], priceLevel: "mid", avgDurationMin: 80, highlights: ["송어회","매운탕","신선"] },
      { id: "gangwon-food-02", name: "강릉 안목 커피거리", type: "restaurant", region: "gangwon", city: "강원 강릉시", summary: "바다 앞 카페 거리, 사우나 후 휴식", tags: ["카페","바다","데이트"], priceLevel: "mid", avgDurationMin: 70, highlights: ["바다뷰","테라스","디저트"] },
      { id: "gangwon-food-03", name: "춘천 닭갈비 골목", type: "restaurant", region: "gangwon", city: "강원 춘천시", summary: "사우나 후 든든한 닭갈비", tags: ["저녁","가족"], priceLevel: "mid", avgDurationMin: 90, highlights: ["닭갈비","막국수","분위기"] },
      { id: "gangwon-att-01", name: "오대산 국립공원", type: "attraction", region: "gangwon", city: "강원 평창군", summary: "온천 전후 숲 산책 코스", tags: ["등산","사찰","자연"], priceLevel: "low", avgDurationMin: 120, highlights: ["월정사","숲길","단풍"] },
      { id: "gangwon-att-02", name: "강릉 커피박물관·오죽헌", type: "attraction", region: "gangwon", city: "강원 강릉시", summary: "문화 산책, 오후 완충", tags: ["산책","문화","사진"], priceLevel: "low", avgDurationMin: 80, highlights: ["오죽헌","육송","전통"] },
    ],
  },
  {
    id: "gyeongju", name: "경주", blurb: "천년 고도의 온천과 한정식으로 즐기는 힐링",
    places: [
      { id: "gyeongju-sauna-01", name: "경주 황남 온천", type: "spa", region: "gyeongju", city: "경북 경주시", summary: "불국사 근처 온천, 프리미엄 노천", tags: ["야외온천","프리미엄","조용한"], priceLevel: "mid", avgDurationMin: 170, openHours: "07:00-21:00", highlights: ["노천탕","한적","관광 연계"] },
      { id: "gyeongju-sauna-02", name: "경주 시내 사우나", type: "sauna", region: "gyeongju", city: "경북 경주시", summary: "번화가 동네 사우나, 가성비", tags: ["가성비","동네","혼자"], priceLevel: "low", avgDurationMin: 120, openHours: "24시간", highlights: ["저렴","한증막","조용"] },
      { id: "gyeongju-sauna-03", name: "보문단지 온천 리조트", type: "jjimjilbang", region: "gyeongju", city: "경북 경주시", summary: "호수 리조트 찜질방, 가족 친화", tags: ["가족","호수","프리미엄"], priceLevel: "high", avgDurationMin: 220, openHours: "24시간", highlights: ["호수뷰","키즈존","수영장"] },
      { id: "gyeongju-food-01", name: "황남빵 본점", type: "restaurant", region: "gyeongju", city: "경북 경주시", summary: "사우나 전 가벼운 간식 코스", tags: ["간식","유명맛집"], priceLevel: "low", avgDurationMin: 30, highlights: ["황남빵","전통","선물"] },
      { id: "gyeongju-food-02", name: "경주 한정식(교촌 마을)", type: "restaurant", region: "gyeongju", city: "경북 경주시", summary: "한옥 마을 한정식, 점심 추천", tags: ["점심","프리미엄","가족"], priceLevel: "mid", avgDurationMin: 90, highlights: ["한정식","한옥","전통"] },
      { id: "gyeongju-food-03", name: "대릉원 근처 막국수·술집", type: "restaurant", region: "gyeongju", city: "경북 경주시", summary: "야간 가볍게, 사우나 후", tags: ["야간","저녁"], priceLevel: "low", avgDurationMin: 70, highlights: ["막국수","막걸리","분위기"] },
      { id: "gyeongju-att-01", name: "첨성대·대릉원", type: "attraction", region: "gyeongju", city: "경북 경주시", summary: "고분 공원 산책, 오후 완충", tags: ["산책","사진","문화"], priceLevel: "low", avgDurationMin: 70, highlights: ["첨성대","대릉원","야경"] },
      { id: "gyeongju-att-02", name: "불국사", type: "attraction", region: "gyeongju", city: "경북 경주시", summary: "온천 전후 사찰 탐방", tags: ["사찰","자연","조용한"], priceLevel: "low", avgDurationMin: 120, highlights: ["석탑","산사","세계유산"] },
    ],
  },
  {
    id: "jeju", name: "제주", blurb: "바다 뷰 온천과 흑돼지·해산물로 완성하는 힐링",
    places: [
      { id: "jeju-sauna-01", name: "제주 시티 사우나", type: "sauna", region: "jeju", city: "제주 제주시", summary: "공항 근처 동네 사우나, 가성비", tags: ["가성비","동네","혼자"], priceLevel: "low", avgDurationMin: 120, openHours: "24시간", highlights: ["저렴","한증막","교통 편리"] },
      { id: "jeju-sauna-02", name: "서귀포 리조트 온천", type: "spa", region: "jeju", city: "제주 서귀포시", summary: "바다 뷰 노천온천, 프리미엄", tags: ["야외온천","바다","프리미엄"], priceLevel: "high", avgDurationMin: 180, openHours: "08:00-22:00", highlights: ["노천탕","바다뷰","마사지"] },
      { id: "jeju-sauna-03", name: "제주 찜질방(올레)", type: "jjimjilbang", region: "jeju", city: "제주 제주시", summary: "가족 친화 찜질방", tags: ["가족","야간"], priceLevel: "mid", avgDurationMin: 200, openHours: "24시간", highlights: ["수면실","키즈존","식사"] },
      { id: "jeju-food-01", name: "제주 흑돼지 거리", type: "restaurant", region: "jeju", city: "제주 제주시", summary: "사우나 후 든든한 흑돼지", tags: ["저녁","프리미엄","가족"], priceLevel: "mid", avgDurationMin: 100, highlights: ["흑돼지","구이","보양"] },
      { id: "jeju-food-02", name: "동문시장 칼국수·성게미역", type: "restaurant", region: "jeju", city: "제주 제주시", summary: "시장 골목 점심 코스", tags: ["점심","가성비"], priceLevel: "low", avgDurationMin: 60, highlights: ["칼국수","성게미역","시장"] },
      { id: "jeju-food-03", name: "서귀포 해산물·갈치", type: "restaurant", region: "jeju", city: "제주 서귀포시", summary: "바다 근처 신선 해산물", tags: ["회","야간","프리미엄"], priceLevel: "high", avgDurationMin: 90, highlights: ["갈치","활어회","바다뷰"] },
      { id: "jeju-att-01", name: "성산일출봉", type: "attraction", region: "jeju", city: "제주 서귀포시", summary: "오전 산책 코스, 사우나 완충", tags: ["등산","자연","사진"], priceLevel: "low", avgDurationMin: 120, highlights: ["분화구","해돋이","올레"] },
      { id: "jeju-att-02", name: "협재·한림 해변", type: "attraction", region: "jeju", city: "제주 제주시", summary: "바다 산책, 오후 완충", tags: ["산책","바다","가족"], priceLevel: "low", avgDurationMin: 90, highlights: ["에메랄드 바다","카페","해변"] },
    ],
  },
  {
    id: "incheon", name: "인천", blurb: "바다 도시의 온천과 차이나타운 먹거리",
    places: [
      { id: "incheon-sauna-01", name: "계양산 산림욕장 인근 사우나", type: "sauna", region: "incheon", city: "인천 계양구", summary: "산림욕장 근처 동네 사우나", tags: ["조용한","가성비","동네"], priceLevel: "low", avgDurationMin: 120, openHours: "24시간", highlights: ["산책 연계","저렴","조용"] },
      { id: "incheon-sauna-02", name: "송도 온천 사우나", type: "spa", region: "incheon", city: "인천 연수구", summary: "송도 신도시 온천, 프리미엄", tags: ["야외온천","프리미엄","조용한"], priceLevel: "mid", avgDurationMin: 160, openHours: "07:00-21:00", highlights: ["노천탕","신도시","마사지"] },
      { id: "incheon-sauna-03", name: "인천 공항 근처 사우나", type: "sauna", region: "incheon", city: "인천 중구", summary: "이동 동선 사우나, 혼자 쉬기 좋음", tags: ["혼자","가성비"], priceLevel: "low", avgDurationMin: 140, openHours: "24시간", highlights: ["캡슐","교통 편리"] },
      { id: "incheon-food-01", name: "차이나타운 짜장면 거리", type: "restaurant", region: "incheon", city: "인천 중구", summary: "사우나 후 대표 먹거리", tags: ["점심","저녁","유명맛집"], priceLevel: "low", avgDurationMin: 70, highlights: ["짜장면","차이나타운","역사"] },
      { id: "incheon-food-02", name: "신포동 닭강정 거리", type: "restaurant", region: "incheon", city: "인천 중구", summary: "야간 간식 코스", tags: ["야간","가성비"], priceLevel: "low", avgDurationMin: 50, highlights: ["닭강정","골목","분위기"] },
      { id: "incheon-food-03", name: "월미도 회·해산물", type: "restaurant", region: "incheon", city: "인천 중구", summary: "바다 근처 신선 해산물", tags: ["회","야간","프리미엄"], priceLevel: "mid", avgDurationMin: 90, highlights: ["활어회","바다뷰","산책"] },
      { id: "incheon-att-01", name: "월미도", type: "attraction", region: "incheon", city: "인천 중구", summary: "바다 산책과 관광차, 오후 완충", tags: ["산책","바다","가족"], priceLevel: "low", avgDurationMin: 90, highlights: ["관광차","해변","야경"] },
      { id: "incheon-att-02", name: "송도 센트럴파크", type: "attraction", region: "incheon", city: "인천 연수구", summary: "도심 공원 산책, 사우나 완충", tags: ["산책","자연","조용한"], priceLevel: "low", avgDurationMin: 70, highlights: ["호수","자전거","잔디"] },
    ],
  },
  {
    id: "daejeon", name: "대전", blurb: "유성 온천의 본고장, 과학도시 힐링",
    places: [
      { id: "daejeon-sauna-01", name: "유성온천지구 사우나", type: "spa", region: "daejeon", city: "대전 유성구", summary: "유성온천 본고장 노천온천", tags: ["야외온천","프리미엄","조용한"], priceLevel: "mid", avgDurationMin: 180, openHours: "07:00-21:00", highlights: ["노천탕","온천거리","역사"] },
      { id: "daejeon-sauna-02", name: "대전 시내 사우나", type: "sauna", region: "daejeon", city: "대전 서구", summary: "번화가 동네 사우나, 가성비", tags: ["가성비","동네","혼자"], priceLevel: "low", avgDurationMin: 120, openHours: "24시간", highlights: ["저렴","한증막","조용"] },
      { id: "daejeon-sauna-03", name: "둔산 찜질방", type: "jjimjilbang", region: "daejeon", city: "대전 서구", summary: "둔산 상권 찜질방, 가족 친화", tags: ["가족","야간"], priceLevel: "mid", avgDurationMin: 200, openHours: "24시간", highlights: ["수면실","키즈존","식사"] },
      { id: "daejeon-food-01", name: "성심당(둔산점)", type: "restaurant", region: "daejeon", city: "대전 서구", summary: "사우나 전 가벼운 베이커리", tags: ["간식","유명맛집"], priceLevel: "low", avgDurationMin: 40, highlights: ["튀김빵","베이커리","선물"] },
      { id: "daejeon-food-02", name: "둔산 먹자골목", type: "restaurant", region: "daejeon", city: "대전 서구", summary: "사우나 후 든든한 한 끼", tags: ["저녁","가족"], priceLevel: "mid", avgDurationMin: 80, highlights: ["골목","다양","분위기"] },
      { id: "daejeon-food-03", name: "유성 온천거리 막창·곱창", type: "restaurant", region: "daejeon", city: "대전 유성구", summary: "온천 마무리 보양 안주", tags: ["야간","저녁"], priceLevel: "mid", avgDurationMin: 90, highlights: ["막창","곱창","술집"] },
      { id: "daejeon-att-01", name: "엑스포과학공원", type: "attraction", region: "daejeon", city: "대전 유성구", summary: "온천 전후 산책 코스", tags: ["산책","문화","가족"], priceLevel: "low", avgDurationMin: 90, highlights: ["전시","잔디","야경"] },
      { id: "daejeon-att-02", name: "보문산 전망대", type: "attraction", region: "daejeon", city: "대전 중구", summary: "도시 전망 산책, 오후 완충", tags: ["산책","사진","자연"], priceLevel: "low", avgDurationMin: 80, highlights: ["전망대","케이블카","야경"] },
    ],
  },
  {
    id: "gwangju", name: "광주", blurb: "남도 음식의 중심, 예술의 거리 힐링",
    places: [
      { id: "gwangju-sauna-01", name: "광주 시내 사우나", type: "sauna", region: "gwangju", city: "광주 동구", summary: "번화가 동네 사우나, 가성비", tags: ["가성비","동네","혼자"], priceLevel: "low", avgDurationMin: 120, openHours: "24시간", highlights: ["저렴","한증막","조용"] },
      { id: "gwangju-sauna-02", name: "무등산 온천 사우나", type: "spa", region: "gwangju", city: "광주 동구", summary: "무등산 기슭 온천, 프리미엄", tags: ["야외온천","프리미엄","조용한"], priceLevel: "mid", avgDurationMin: 160, openHours: "07:00-21:00", highlights: ["노천탕","산자락","마사지"] },
      { id: "gwangju-sauna-03", name: "광주 찜질방", type: "jjimjilbang", region: "gwangju", city: "광주 서구", summary: "상권 찜질방, 가족 친화", tags: ["가족","야간"], priceLevel: "mid", avgDurationMin: 200, openHours: "24시간", highlights: ["수면실","키즈존","식사"] },
      { id: "gwangju-food-01", name: "충장로 돼지국밥 거리", type: "restaurant", region: "gwangju", city: "광주 동구", summary: "사우나 나와서 뜨끈한 국밥", tags: ["아침","저녁","가성비"], priceLevel: "low", avgDurationMin: 60, highlights: ["국밥","보양","아침"] },
      { id: "gwangju-food-02", name: "남도 맛집(한정식)", type: "restaurant", region: "gwangju", city: "광주 북구", summary: "남도 정성 한정식, 점심 추천", tags: ["점심","프리미엄","가족"], priceLevel: "mid", avgDurationMin: 90, highlights: ["한정식","남도","전통"] },
      { id: "gwangju-food-03", name: "양동시장 떡갈비·맛집", type: "restaurant", region: "gwangju", city: "광주 북구", summary: "시장 골목 야식 코스", tags: ["야간","가성비"], priceLevel: "low", avgDurationMin: 70, highlights: ["떡갈비","시장","분위기"] },
      { id: "gwangju-att-01", name: "무등산 국립공원", type: "attraction", region: "gwangju", city: "광주 동구", summary: "온천 전후 산책 코스", tags: ["등산","자연","사진"], priceLevel: "low", avgDurationMin: 120, highlights: ["규봉","바위","단풍"] },
      { id: "gwangju-att-02", name: "우치공원·패밀리랜드", type: "attraction", region: "gwangju", city: "광주 북구", summary: "가족 공원 산책, 오후 완충", tags: ["산책","가족","자연"], priceLevel: "low", avgDurationMin: 90, highlights: ["호수","동물원","잔디"] },
    ],
  },
  {
    id: "daegu", name: "대구", blurb: "약령시와 스파밸리, 온천과 먹거리 도시",
    places: [
      { id: "daegu-sauna-01", name: "리조트 스파밸리", type: "spa", region: "daegu", city: "대구 달서구", summary: "대규모 스파 리조트, 프리미엄", tags: ["야외온천","프리미엄","가족"], priceLevel: "high", avgDurationMin: 200, openHours: "08:00-22:00", highlights: ["노천탕","워터파크","마사지"] },
      { id: "daegu-sauna-02", name: "동성로 사우나", type: "sauna", region: "daegu", city: "대구 중구", summary: "번화가 동네 사우나, 가성비", tags: ["가성비","동네","혼자"], priceLevel: "low", avgDurationMin: 120, openHours: "24시간", highlights: ["저렴","한증막","조용"] },
      { id: "daegu-sauna-03", name: "수성구 온천 사우나", type: "spa", region: "daegu", city: "대구 수성구", summary: "수성못 근처 온천, 프리미엄", tags: ["야외온천","조용한","프리미엄"], priceLevel: "mid", avgDurationMin: 160, openHours: "07:00-21:00", highlights: ["노천탕","못뷰","마사지"] },
      { id: "daegu-food-01", name: "동성로 먹자골목", type: "restaurant", region: "daegu", city: "대구 중구", summary: "사우나 후 든든한 한 끼", tags: ["저녁","가족","가성비"], priceLevel: "low", avgDurationMin: 80, highlights: ["골목","다양","분위기"] },
      { id: "daegu-food-02", name: "안지랑 곱창골목", type: "restaurant", region: "daegu", city: "대구 남구", summary: "대구 명물 곱창, 저녁 추천", tags: ["저녁","유명맛집","야간"], priceLevel: "mid", avgDurationMin: 90, highlights: ["곱창","골목","술집"] },
      { id: "daegu-food-03", name: "약령시 한방차·보양식", type: "restaurant", region: "daegu", city: "대구 중구", summary: "사우나 전 보양 차 한 잔", tags: ["점심","보양"], priceLevel: "low", avgDurationMin: 50, highlights: ["한방","약초","전통"] },
      { id: "daegu-att-01", name: "수성못", type: "attraction", region: "daegu", city: "대구 수성구", summary: "호수 산책, 오후 완충", tags: ["산책","바다","가족"], priceLevel: "low", avgDurationMin: 80, highlights: ["호수","분수","야경"] },
      { id: "daegu-att-02", name: "대구향교·공산성", type: "attraction", region: "daegu", city: "대구 중구", summary: "문화 산책, 사우나 완충", tags: ["산책","문화","사진"], priceLevel: "low", avgDurationMin: 70, highlights: ["향교","전통","골목"] },
    ],
  },
];

export function getRegion(id: string): RegionData | undefined {
  return regions.find((r) => r.id === id);
}
