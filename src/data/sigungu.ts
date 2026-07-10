import type { Region } from "./schema";

// ───────────────────────────────────────────────────────────
// 시군구 데이터셋 (광역별 실제 시군구 + 중심좌표)
// curated seed의 city 값("서울 중구" 등)과 fullName 매칭.
// 좌표는 각 시군구청/중심지 기준 검증된 값.
// ───────────────────────────────────────────────────────────

export interface Sigungu {
  id: string; // 예: "seoul-jung"
  region: Region;
  name: string; // 시군구명만 (예: "중구")
  fullName: string; // "서울 중구"
  lat: number;
  lng: number;
  areaCode: string; // tourAPI 시도코드 (예: 서울=1)
}

export const sigungus: Sigungu[] = [
  // ── 서울 (areaCode 1) ──
  { id: "seoul-jung", region: "seoul", name: "중구", fullName: "서울 중구", lat: 37.5602, lng: 126.9045, areaCode: "1" },
  { id: "seoul-yeongdeungpo", region: "seoul", name: "영등포구", fullName: "서울 영등포구", lat: 37.526, lng: 126.896, areaCode: "1" },
  { id: "seoul-yongsan", region: "seoul", name: "용산구", fullName: "서울 용산구", lat: 37.5326, lng: 126.99, areaCode: "1" },
  { id: "seoul-jongno", region: "seoul", name: "종로구", fullName: "서울 종로구", lat: 37.57, lng: 126.979, areaCode: "1" },
  { id: "seoul-gangnam", region: "seoul", name: "강남구", fullName: "서울 강남구", lat: 37.5172, lng: 127.0473, areaCode: "1" },

  // ── 부산 (areaCode 6) ──
  { id: "busan-haeundae", region: "busan", name: "해운대구", fullName: "부산 해운대구", lat: 35.1639, lng: 129.1635, areaCode: "6" },
  { id: "busan-suyeong", region: "busan", name: "수영구", fullName: "부산 수영구", lat: 35.1623, lng: 129.1117, areaCode: "6" },
  { id: "busan-dongnae", region: "busan", name: "동래구", fullName: "부산 동래구", lat: 35.205, lng: 129.082, areaCode: "6" },
  { id: "busan-busanjin", region: "busan", name: "부산진구", fullName: "부산 부산진구", lat: 35.1797, lng: 129.0745, areaCode: "6" },
  { id: "busan-saha", region: "busan", name: "사하구", fullName: "부산 사하구", lat: 35.105, lng: 129.012, areaCode: "6" },

  // ── 강원 (areaCode 32) ──
  { id: "gangwon-pyeongchang", region: "gangwon", name: "평창군", fullName: "강원 평창군", lat: 37.37, lng: 128.39, areaCode: "32" },
  { id: "gangwon-gangneung", region: "gangwon", name: "강릉시", fullName: "강원 강릉시", lat: 37.7519, lng: 128.8761, areaCode: "32" },
  { id: "gangwon-chuncheon", region: "gangwon", name: "춘천시", fullName: "강원 춘천시", lat: 37.8813, lng: 127.7298, areaCode: "32" },
  { id: "gangwon-sokcho", region: "gangwon", name: "속초시", fullName: "강원 속초시", lat: 38.207, lng: 128.5917, areaCode: "32" },

  // ── 경주 (경북, areaCode 35) ──
  { id: "gyeongju-gyeongju", region: "gyeongju", name: "경주시", fullName: "경북 경주시", lat: 35.8562, lng: 129.2247, areaCode: "35" },

  // ── 제주 (areaCode 39) ──
  { id: "jeju-jeju", region: "jeju", name: "제주시", fullName: "제주 제주시", lat: 33.4996, lng: 126.5312, areaCode: "39" },
  { id: "jeju-seogwipo", region: "jeju", name: "서귀포시", fullName: "제주 서귀포시", lat: 33.253, lng: 126.5617, areaCode: "39" },

  // ── 인천 (areaCode 2) ──
  { id: "incheon-gyeyang", region: "incheon", name: "계양구", fullName: "인천 계양구", lat: 37.683, lng: 126.733, areaCode: "2" },
  { id: "incheon-yeonsu", region: "incheon", name: "연수구", fullName: "인천 연수구", lat: 37.6896, lng: 126.538, areaCode: "2" },
  { id: "incheon-jung", region: "incheon", name: "중구", fullName: "인천 중구", lat: 37.4743, lng: 126.621, areaCode: "2" },

  // ── 대전 (areaCode 3) ──
  { id: "daejeon-yuseong", region: "daejeon", name: "유성구", fullName: "대전 유성구", lat: 36.355, lng: 127.35, areaCode: "3" },
  { id: "daejeon-seo", region: "daejeon", name: "서구", fullName: "대전 서구", lat: 36.351, lng: 127.27, areaCode: "3" },
  { id: "daejeon-jung", region: "daejeon", name: "중구", fullName: "대전 중구", lat: 36.321, lng: 127.378, areaCode: "3" },

  // ── 광주 (areaCode 5) ──
  { id: "gwangju-dong", region: "gwangju", name: "동구", fullName: "광주 동구", lat: 35.1479, lng: 126.918, areaCode: "5" },
  { id: "gwangju-seo", region: "gwangju", name: "서구", fullName: "광주 서구", lat: 35.159, lng: 126.851, areaCode: "5" },
  { id: "gwangju-buk", region: "gwangju", name: "북구", fullName: "광주 북구", lat: 35.178, lng: 126.893, areaCode: "5" },

  // ── 대구 (areaCode 4) ──
  { id: "daegu-dalseo", region: "daegu", name: "달서구", fullName: "대구 달서구", lat: 35.842, lng: 128.491, areaCode: "4" },
  { id: "daegu-jung", region: "daegu", name: "중구", fullName: "대구 중구", lat: 35.869, lng: 128.595, areaCode: "4" },
  { id: "daegu-nam", region: "daegu", name: "남구", fullName: "대구 남구", lat: 35.839, lng: 128.609, areaCode: "4" },
  { id: "daegu-suseong", region: "daegu", name: "수성구", fullName: "대구 수성구", lat: 35.855, lng: 128.62, areaCode: "4" },
];

// 전국 모든 시군구 (지도 전국 모드용)
export function getAllSigungus(): Sigungu[] {
  return sigungus;
}

// id로 시군구 조회 (지도 클릭 → region+시군구 동시 설정용)
export function findSigunguById(id: string): Sigungu | undefined {
  return sigungus.find((s) => s.id === id);
}

export function getSigungus(region: Region): Sigungu[] {
  return sigungus.filter((s) => s.region === region);
}

// fullName("서울 중구") 또는 name("중구")으로 시군구 조회
export function findSigungu(region: Region, cityText: string): Sigungu | undefined {
  const list = getSigungus(region);
  const t = cityText.trim();
  return list.find((s) => s.fullName === t || s.name === t);
}

// 지도 클릭 좌표 → 해당 region 내 최근접 시군구 (haversine)
export function nearestSigungu(region: Region, lat: number, lng: number): Sigungu | null {
  const list = getSigungus(region);
  if (list.length === 0) return null;
  let best: Sigungu | null = null;
  let bestD = Infinity;
  for (const s of list) {
    const dLat = s.lat - lat;
    const dLng = s.lng - lng;
    const d = dLat * dLat + dLng * dLng; // 근사 거리 (정도 단위)
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best;
}
