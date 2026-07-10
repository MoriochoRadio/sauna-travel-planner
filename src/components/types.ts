export type Stop = {
  time: string;
  placeId?: string;
  title: string;
  reason: string;
  tip?: string;
};
export type Day = { day: number; theme: string; stops: Stop[] };
export type Course = {
  region: string;
  days: Day[];
  estCostKrw: number;
  summary: string;
  usedFallback?: boolean;
  places?: any[]; // 코스에 사용된 장소 전체(live+curated), 평점/온천 배지 매핑용
};
