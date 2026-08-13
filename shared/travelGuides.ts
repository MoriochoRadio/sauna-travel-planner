export type TravelGuide = {
  slug: string;
  title: string;
  eyebrow: string;
  region: string;
  readMinutes: number;
  intro: string;
  placeIds: string[];
  essentials: string[];
  sections: { title: string; body: string }[];
};

export const travelGuides: TravelGuide[] = [
  {
    slug: "busan-slow-spa-day",
    title: "부산에서 보내는 느린 온천 하루",
    eyebrow: "CITY RESET · BUSAN",
    region: "부산",
    readMinutes: 4,
    intro: "비가 오거나 해변 산책 뒤 몸을 쉬게 하고 싶은 날, 이동을 줄이고 온천·식사·짧은 산책을 하나의 리듬으로 이어 보는 가이드입니다.",
    placeIds: ["spaland-centum-city", "hurshimchung"],
    essentials: ["입장 전 공식 운영 정보 확인", "수분 보충용 물", "저녁 이동을 줄일 수 있는 숙소 또는 귀가 동선"],
    sections: [
      { title: "첫 장면은 가볍게 시작하세요", body: "온천·찜질은 오래 버티는 일정이 아니라 몸 상태를 살피는 휴식입니다. 가벼운 산책이나 식사 후, 충분한 시간을 남기고 입장하세요." },
      { title: "한 곳에 오래 머무는 선택", body: "도심형 웰니스 공간은 날씨 영향을 줄이고 식사·휴식까지 한 흐름으로 이어가기 좋습니다. 시설의 기본 이용 시간과 입장 마감은 공식 안내에서 반드시 확인하세요." },
      { title: "마무리는 이동보다 회복", body: "고온 환경 뒤에는 수분을 보충하고, 장거리 이동이나 과도한 음주는 피하는 편이 좋습니다. 다음 일정은 짧고 조용하게 두세요." },
    ],
  },
  {
    slug: "first-onsen-checklist",
    title: "처음 온천 여행을 위한 준비 체크리스트",
    eyebrow: "FIRST TIMER · WELLNESS",
    region: "전국",
    readMinutes: 3,
    intro: "처음 가는 온천·찜질 여행에서 가장 중요한 것은 무리하지 않는 것입니다. 출발 전에 확인할 것과 현장에서 지킬 리듬을 정리했습니다.",
    placeIds: ["hurshimchung", "asan-spavis"],
    essentials: ["공식 운영 시간·휴무·입장 조건", "개인 건강 상태와 복용 약물 확인", "갈아입을 옷과 보습용품", "귀가 동선"],
    sections: [
      { title: "정보는 출발 직전에 다시 확인", body: "요금, 운영 시간, 특정 시설의 계절 운영 여부는 바뀔 수 있습니다. 온기행의 출처 링크에서 공식 안내를 다시 열어 보세요." },
      { title: "몸이 보내는 신호를 우선", body: "어지럼증, 불편감, 과한 피로가 느껴지면 즉시 쉬는 것이 좋습니다. 개인 질환이나 임신, 약물 복용이 있는 경우에는 의료진의 조언을 우선하세요." },
      { title: "휴식 후의 시간도 여행입니다", body: "사우나 뒤에는 물을 마시고 식사와 귀가 일정을 느슨하게 둡니다. 좋은 온천 여행은 빈틈없이 채운 일정이 아니라 회복할 여백이 있는 일정입니다." },
    ],
  },
  {
    slug: "one-night-hot-spring-reset",
    title: "1박으로 완성하는 자연 속 온천 리셋",
    eyebrow: "OVERNIGHT · SLOW TRAVEL",
    region: "강원·경북",
    readMinutes: 4,
    intro: "산과 숲 가까이에서 머무르는 온천 여행은 숙박과 온천의 순서를 천천히 이어갈 때 더 편안합니다.",
    placeIds: ["deokgu-onsen-resort", "osack-greenyard"],
    essentials: ["계절·날씨에 따른 이동 여유", "숙박·온천 예약의 공식 확인", "다음 날 아침에 둘 짧은 산책 시간"],
    sections: [
      { title: "도착하는 날에는 욕심을 줄이세요", body: "산간 지역은 날씨와 도로 여건에 따라 이동 시간이 달라집니다. 체크인 뒤 바로 쉬어도 일정이 완성되도록 계획하는 편이 좋습니다." },
      { title: "온천과 숙박 사이에 휴식 넣기", body: "입욕 뒤에는 바로 다음 활동을 더하기보다 객실이나 라운지에서 쉬는 시간을 둡니다. 저녁에는 가벼운 식사와 수분 보충을 우선하세요." },
      { title: "다음 날의 풍경까지 남기기", body: "아침에 짧은 산책을 넣으면 여행이 급하게 끝나지 않습니다. 귀가 출발 시각을 넉넉히 잡아 안전하게 돌아오세요." },
    ],
  },
];

export function getTravelGuide(slug: string) { return travelGuides.find(guide => guide.slug === slug); }
