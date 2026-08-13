export type PlaceCategory = "sauna" | "jjimjilbang" | "hot-spring";
export type PriceBand = "light" | "balanced" | "signature";

export type PlaceVerification = {
  status: "official" | "curation-draft";
  verifiedAt: string;
  sourceLabel: string;
  sourceUrl: string;
  officialUrl?: string;
  operatingNote?: string;
};

export type TravelPlace = {
  id: string;
  name: string;
  category: PlaceCategory;
  region: string;
  city: string;
  coordinates: { lat: number; lng: number };
  priceBand: PriceBand;
  mood: string[];
  facilities: string[];
  companions: string[];
  durationMinutes: number;
  summary: string;
  highlight: string;
  usageTip: string;
  verification: PlaceVerification;
  neighborhood: { title: string; type: "food" | "sight"; description: string }[];
  science: { studyType: string; title: string; summary: string; sourceLabel: string; sourceUrl: string };
};

export const travelPlaces: TravelPlace[] = [
  {
    id: "spaland-centum-city",
    name: "스파랜드 센텀시티",
    category: "jjimjilbang",
    region: "부산",
    city: "해운대구",
    coordinates: { lat: 35.1692, lng: 129.1299 },
    priceBand: "signature",
    mood: ["도시형", "세련된", "느긋한"],
    facilities: ["테마 찜질", "휴식 라운지", "식음", "야간"],
    companions: ["혼자", "연인", "친구"],
    durationMinutes: 240,
    summary: "도시 한복판에서 여러 온열 휴식 공간을 차분하게 즐기기 좋은 대형 웰니스 스폿입니다.",
    highlight: "여행 중 비나 더위를 피해 오래 머물기 좋은 실내형 휴식",
    usageTip: "주말에는 입장 전 운영 시간과 혼잡도를 확인하고, 센텀시티 산책을 앞뒤 일정으로 연결해 보세요.",
    verification: {
      status: "official",
      verifiedAt: "2026-08-13",
      sourceLabel: "신세계백화점 스파랜드 공식 안내",
      sourceUrl: "https://www.shinsegae.com/store/entertainment/centum-spaland.do?storeCd=SC00008",
      officialUrl: "https://www.shinsegae.com/store/entertainment/centum-spaland.do?storeCd=SC00008",
      operatingNote: "운영 시간·요금·기본 이용 시간은 공식 안내를 확인하세요.",
    },
    neighborhood: [
      { title: "영화의전당 주변 산책", type: "sight", description: "해 질 무렵 건축과 야외 공간을 둘러보기 좋은 동선입니다." },
      { title: "센텀시티 로컬 다이닝", type: "food", description: "가벼운 식사부터 저녁까지 선택 폭이 넓어 휴식 후 이동 부담이 적습니다." },
    ],
    science: {
      studyType: "관찰연구·체계적 문헌 탐색",
      title: "온열 환경과 심혈관 건강의 연관성",
      summary: "반복적인 사우나 이용과 건강 지표의 연관성을 탐색한 연구들이 있으며, 개인 상태와 무관하게 효과를 보장하는 정보는 아닙니다.",
      sourceLabel: "PubMed 연구 탐색",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=sauna+cardiovascular+health",
    },
  },
  {
    id: "hurshimchung",
    name: "허심청",
    category: "hot-spring",
    region: "부산",
    city: "동래구",
    coordinates: { lat: 35.2206, lng: 129.0854 },
    priceBand: "balanced",
    mood: ["전통", "온천", "고요한"],
    facilities: ["온천수", "대욕장", "휴식", "식음"],
    companions: ["혼자", "부모님", "가족"],
    durationMinutes: 180,
    summary: "동래 온천권의 역사와 함께 온천욕 중심의 느린 휴식을 계획하기 좋은 장소입니다.",
    highlight: "도시 여행 안에 온천 휴식을 자연스럽게 넣는 전통 온천 동선",
    usageTip: "입욕 전후에는 수분을 충분히 보충하고, 장시간 고온 환경 이용은 본인 컨디션에 맞춰 조절하세요.",
    verification: {
      status: "official",
      verifiedAt: "2026-08-13",
      sourceLabel: "비짓부산 시설 안내",
      sourceUrl: "https://www.visitbusan.net/index.do?menuCd=DOM_000000202008001000&uc_seq=1754&lang_cd=ko",
      operatingNote: "주소·대중교통·운영 정보는 방문 전 출처 페이지에서 다시 확인하세요.",
    },
    neighborhood: [
      { title: "동래 온천장 골목", type: "food", description: "온천 후 따뜻한 한 끼를 찾기 좋은 오래된 상권입니다." },
      { title: "금강공원", type: "sight", description: "온천 전후 짧게 몸을 풀며 걷기 좋은 녹지 공간입니다." },
    ],
    science: {
      studyType: "관찰연구",
      title: "열 노출과 이완 반응에 관한 연구",
      summary: "온열 환경이 주관적 이완감과 관련될 수 있다는 연구가 있으나, 치료를 대신하거나 개인별 결과를 예측하지는 않습니다.",
      sourceLabel: "PubMed 연구 탐색",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=heat+therapy+relaxation",
    },
  },
  {
    id: "aquafield-goyang",
    name: "아쿠아필드 고양",
    category: "jjimjilbang",
    region: "경기",
    city: "고양시",
    coordinates: { lat: 37.6467, lng: 126.8956 },
    priceBand: "signature",
    mood: ["모던", "활기찬", "가족친화"],
    facilities: ["찜질", "루프톱", "식음", "휴식 라운지"],
    companions: ["가족", "연인", "친구"],
    durationMinutes: 210,
    summary: "쇼핑과 식사, 찜질 휴식을 한 번에 계획하려는 수도권 당일 여행에 어울리는 복합형 공간입니다.",
    highlight: "일정 조율이 쉬운 도심형 올인원 휴식 코스",
    usageTip: "체류 시간을 넉넉히 잡고, 이동이 많은 날이라면 한낮보다 늦은 오후 이용을 고려해 보세요.",
    verification: {
      status: "curation-draft",
      verifiedAt: "2026-08-13",
      sourceLabel: "운영 정보 보강 중",
      sourceUrl: "https://www.starfield.co.kr/",
      officialUrl: "https://www.starfield.co.kr/",
      operatingNote: "운영 시간·요금 등 행동 정보는 공식 확인 전까지 제공하지 않습니다.",
    },
    neighborhood: [
      { title: "호수공원 산책", type: "sight", description: "휴식 전후로 빛과 바람을 느끼며 걷기 좋은 대표적인 도심 산책 동선입니다." },
      { title: "킨텍스 인근 식사", type: "food", description: "다양한 메뉴를 빠르게 선택할 수 있어 동행 취향이 다를 때 편합니다." },
    ],
    science: {
      studyType: "일반 정보",
      title: "온열 환경 이용 시 기본 수분 관리",
      summary: "고온 환경에서는 탈수 예방을 위해 휴식과 수분 섭취가 중요합니다. 불편감이 있으면 즉시 이용을 중단하세요.",
      sourceLabel: "사우나 과학 허브 주제 탐색",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=sauna+hydration",
    },
  },
  {
    id: "asan-spavis",
    name: "파라다이스 스파 도고",
    category: "hot-spring",
    region: "충남",
    city: "아산시",
    coordinates: { lat: 36.8714, lng: 126.9919 },
    priceBand: "balanced",
    mood: ["휴양", "야외", "가족친화"],
    facilities: ["노천", "온천수", "스파", "식음"],
    companions: ["가족", "친구", "연인"],
    durationMinutes: 300,
    summary: "온천 체험과 넉넉한 체류 시간을 중심에 두고 싶은 근교 휴양 여행에 맞는 선택지입니다.",
    highlight: "하루의 속도를 낮추고 휴식을 중심으로 짜는 근교 온천 여행",
    usageTip: "야외 시설 이용 여부와 계절 운영 정보를 방문 전 공식 채널에서 확인하세요.",
    verification: {
      status: "official",
      verifiedAt: "2026-08-13",
      sourceLabel: "파라다이스 스파 도고 공식 안내",
      sourceUrl: "https://www.paradisespa.co.kr/",
      officialUrl: "https://www.paradisespa.co.kr/",
      operatingNote: "시즌별 이용권과 야외 시설 운영 여부는 공식 예약 페이지에서 확인하세요.",
    },
    neighborhood: [
      { title: "도고 온천권", type: "sight", description: "온천 마을의 느린 분위기를 즐기며 이동 거리를 줄일 수 있습니다." },
      { title: "아산 로컬 식사", type: "food", description: "온천 일정에 맞춰 식사 시간을 유연하게 조정하기 좋습니다." },
    ],
    science: {
      studyType: "체계적 문헌 탐색",
      title: "온열요법 연구를 읽는 법",
      summary: "온열요법 연구는 대상자, 온도, 시간, 비교군에 따라 결과가 달라집니다. 한 편의 연구로 건강 효과를 일반화하지 않는 것이 중요합니다.",
      sourceLabel: "PubMed 연구 탐색",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=thermal+therapy+systematic+review",
    },
  },
  {
    id: "deokgu-onsen-resort",
    name: "덕구온천 리조트",
    category: "hot-spring",
    region: "경북",
    city: "울진군",
    coordinates: { lat: 37.0248, lng: 129.2722 },
    priceBand: "signature",
    mood: ["자연", "고요한", "휴양"],
    facilities: ["노천", "온천수", "숙박", "산책"],
    companions: ["부모님", "연인", "혼자"],
    durationMinutes: 300,
    summary: "산과 계곡의 풍경 속에서 숙박과 온천을 느리게 이어가기 좋은 자연형 휴양지입니다.",
    highlight: "이동 자체를 줄이고 하룻밤 머무르며 회복에 집중하는 여행",
    usageTip: "산간 지역은 계절·날씨에 따라 이동 시간이 달라질 수 있으므로, 도착과 귀가 동선을 여유 있게 잡으세요.",
    verification: {
      status: "official",
      verifiedAt: "2026-08-13",
      sourceLabel: "덕구온천 공식 안내",
      sourceUrl: "https://www.dukgu.com/",
      officialUrl: "https://www.dukgu.com/",
      operatingNote: "온천·숙박 운영과 계절 패키지는 공식 공지에서 확인하세요.",
    },
    neighborhood: [
      { title: "응봉산 자락", type: "sight", description: "무리하지 않는 범위의 가벼운 자연 산책을 더하기 좋습니다." },
      { title: "울진 로컬 식사", type: "food", description: "온천 후 부담이 적은 식사로 하루를 마무리해 보세요." },
    ],
    science: {
      studyType: "일반 정보",
      title: "휴식과 수면을 위한 저자극 루틴",
      summary: "강한 열 노출 뒤에는 충분히 쉬고 수면 환경을 편안하게 만드는 것이 좋습니다. 개인의 질환·복용 약물 여부는 별도로 고려해야 합니다.",
      sourceLabel: "사우나 과학 허브 주제 탐색",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=sauna+sleep",
    },
  },
  {
    id: "osack-greenyard",
    name: "오색그린야드호텔 온천",
    category: "hot-spring",
    region: "강원",
    city: "양양군",
    coordinates: { lat: 38.0741, lng: 128.4867 },
    priceBand: "balanced",
    mood: ["산속", "고요한", "전통"],
    facilities: ["온천수", "숙박", "산책", "휴식"],
    companions: ["혼자", "연인", "부모님"],
    durationMinutes: 240,
    summary: "설악산 자락의 공기와 함께 온천을 여행의 중심 장면으로 두기 좋은 산속 휴양지입니다.",
    highlight: "산책과 온천 사이의 긴 여백을 즐기는 고요한 주말",
    usageTip: "계절별 도로 상황과 숙박·온천 운영 시간을 사전에 확인하고, 산행과 고온욕을 같은 날 무리하게 겹치지 마세요.",
    verification: {
      status: "curation-draft",
      verifiedAt: "2026-08-13",
      sourceLabel: "공식 정보 보강 중",
      sourceUrl: "https://www.greenyardhotel.com/",
      officialUrl: "https://www.greenyardhotel.com/",
      operatingNote: "운영 정보와 이용 조건은 공식 채널 확인 후 확정합니다.",
    },
    neighborhood: [
      { title: "오색 약수권 산책", type: "sight", description: "짧은 거리에서 자연을 느끼고 다시 휴식으로 돌아오기 좋습니다." },
      { title: "양양 로컬 식사", type: "food", description: "여행 전후 가벼운 식사를 연결해 무리 없는 일정을 만들 수 있습니다." },
    ],
    science: {
      studyType: "일반 정보",
      title: "고온 환경 이용 전 유의사항",
      summary: "음주 직후, 심한 피로감, 어지럼증이 있을 때는 고온 환경 이용을 피하는 것이 일반적으로 권장됩니다. 개인 건강 상태는 의료진과 상의하세요.",
      sourceLabel: "사우나 과학 허브 주제 탐색",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=sauna+safety",
    },
  },
];

export const regions = Array.from(new Set(travelPlaces.map(place => place.region)));
export const moods = Array.from(new Set(travelPlaces.flatMap(place => place.mood)));
export const facilities = Array.from(new Set(travelPlaces.flatMap(place => place.facilities)));
export const companions = Array.from(new Set(travelPlaces.flatMap(place => place.companions)));

export function getPlace(id: string) {
  return travelPlaces.find(place => place.id === id);
}
