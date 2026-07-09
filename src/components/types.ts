export type Stop = {
  time: string;
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
};
