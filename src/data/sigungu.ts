import type { Region } from "./schema";
import { GENERATED_SIGUNGUS, type SigunguGenerated } from "./sigungu.generated";

export interface Sigungu {
  id: string;
  region: Region;
  name: string;
  fullName: string;
  lat: number;
  lng: number;
  areaCode: string;
}

// 전국 시군구 (scripts/build-sigungu.mjs 자동생성 → sigungu.generated.ts)
export const SIGUNGUS: Sigungu[] = GENERATED_SIGUNGUS as Sigungu[];

export function getSigungus(region: Region): Sigungu[] {
  return SIGUNGUS.filter((s) => s.region === region);
}

export function findSigunguById(id: string): Sigungu | undefined {
  return SIGUNGUS.find((s) => s.id === id);
}

export function getAllSigungus(): Sigungu[] {
  return SIGUNGUS;
}

// haversine 최근접 시군구 (전국 지도 클릭 시)
export function nearestSigungu(lat: number, lng: number): Sigungu | null {
  let best: Sigungu | null = null;
  let bestD = Infinity;
  for (const s of SIGUNGUS) {
    const dLat = s.lat - lat;
    const dLng = s.lng - lng;
    const d = dLat * dLat + dLng * dLng;
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best;
}

// 특정 region 내 최근접 시군구 (지역 지도 클릭 시)
export function nearestSigunguInRegion(region: Region, lat: number, lng: number): Sigungu | null {
  let best: Sigungu | null = null;
  let bestD = Infinity;
  for (const s of SIGUNGUS) {
    if (s.region !== region) continue;
    const dLat = s.lat - lat;
    const dLng = s.lng - lng;
    const d = dLat * dLat + dLng * dLng;
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best;
}

// curated place의 city 텍스트에서 시군구 id 찾기 (동기화 로직용)
export function findSigungu(cityText: string): string | undefined {
  if (!cityText) return undefined;
  const normalized = cityText.replace(/\s+/g, " ").trim();
  // "서울 중구" → seoul-jung
  for (const s of SIGUNGUS) {
    if (normalized.includes(s.name)) return s.id;
  }
  // 시도명만 있는 경우 첫 시군구
  const regionMatch = SIGUNGUS.find((s) => normalized.startsWith(s.region));
  return regionMatch?.id;
}

// 타입 재수출 (generated와 호환)
export type { SigunguGenerated };
