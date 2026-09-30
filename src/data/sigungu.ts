import { Region } from "./schema";
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

// 시도 약칭 → region. 정식 명칭은 접미사를 떼서 맞춘다 ("대구광역시"→"대구", "경상북도"→"경상북").
const SIDO_REGION: Record<string, Region> = {
  서울: "seoul", 부산: "busan", 대구: "daegu", 인천: "incheon", 광주: "gwangju", 대전: "daejeon",
  울산: "ulsan", 세종: "sejong", 경기: "gyeonggi", 강원: "gangwon", 제주: "jeju",
  충북: "chungbuk", 충남: "chungnam", 전북: "jeonbuk", 전남: "jeonnam", 경북: "gyeongbuk", 경남: "gyeongnam",
  충청북: "chungbuk", 충청남: "chungnam", 전라북: "jeonbuk", 전라남: "jeonnam", 경상북: "gyeongbuk", 경상남: "gyeongnam",
};

function sidoToRegion(token: string): Region | undefined {
  if ((Region.options as string[]).includes(token)) return token as Region; // 주소가 없을 때 동기화가 넣는 region id
  return SIDO_REGION[token.replace(/(특별자치시|특별자치도|특별시|광역시|도)$/, "")];
}

// 장소의 city/주소 텍스트에서 시군구 id 찾기 ("대구광역시 중구" → daegu-중구)
// 이름만으로 찾으면 "중구"·"서구"처럼 여러 광역시에 있는 구가 엉뚱한 시도에 붙는다.
// 시도명으로 범위를 좁히고, 시도명을 모르면(행정구역 개편 등) 장소의 region 안에서만 찾는다.
// 확신할 수 없으면 undefined — 틀린 시군구보다 비어 있는 편이 낫다.
export function findSigungu(cityText: string, region?: Region): string | undefined {
  const [sido, ...rest] = (cityText ?? "").replace(/\s+/g, " ").trim().split(" ");
  if (!sido) return undefined;
  const scope = sidoToRegion(sido) ?? region;
  if (!scope) return undefined;
  const candidates = getSigungus(scope);
  // 부분 일치("강서구"에 "서구")를 피하려고 토큰 단위로 정확히 비교한다
  const found = candidates.find((s) => rest.includes(s.name));
  if (found) return found.id;
  // 시군구가 하나뿐인 시도(세종)는 읍·면 주소도 그 시군구다
  return candidates.length === 1 && rest.length > 0 ? candidates[0].id : undefined;
}

// 타입 재수출 (generated와 호환)
export type { SigunguGenerated };
