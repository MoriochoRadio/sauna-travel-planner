// sync-tourapi.mjs의 순수 함수 (네트워크·파일 쓰기 없음 → 단위 테스트 대상: src/data/sync-tourapi-lib.test.ts)

// ── 지역 정의 ──
// areaBasedList2의 areaCode/sigunguCode는 공식 문서에서 "미사용항목(삭제예정)"이고 법정동 코드
// (lDongRegnCd/lDongSignguCd)로 대체됐다. areaCode 조회 결과가 매주 줄어 2026-11에는 지역에 따라
// 절반 이하가 됐고, 처음부터 법정동 코드로 받던 경주만 그대로였다 → 전 지역을 법정동 코드로 받는다.
//
// 시도 코드는 숫자를 박아 두지 않고 실행할 때마다 ldongCode2(법정동 시도 목록)에서 이름으로 찾는다.
// 2026-07-01 광주광역시·전라남도가 전남광주통합특별시로 합쳐지며 법정동 시도 코드도 바뀌었는데,
// 관광공사가 새 코드를 언제 반영하는지 알 수 없어서다. sido는 우선순위 순 후보 이름이다.
//   - 통합 코드가 목록에 있으면 광주·전남 둘 다 그 코드로 받고, 주소의 시군구로 나눈다(GWANGJU_GU).
//   - 아직 옛 코드(광주 29, 전남 46)만 있으면 각자 받는다. 나누는 필터는 그때도 그대로 맞다.
// 인천은 2026-07-01 제물포구·영종구·검단구·서해구 개편이 있었지만 시도 코드(28)는 그대로이고,
// 시도 단위로만 조회하므로 영향이 없다(시군구 id 매핑 문제는 docs/review.md 보류 항목).
export const GWANGJU_GU = ["동구", "서구", "남구", "북구", "광산구"];

export const REGIONS = [
  { id: "seoul", sido: ["서울특별시"] },
  { id: "incheon", sido: ["인천광역시"] },
  { id: "daejeon", sido: ["대전광역시"] },
  { id: "daegu", sido: ["대구광역시"] },
  { id: "gwangju", sido: ["전남광주통합특별시", "광주광역시"], cities: GWANGJU_GU },
  { id: "busan", sido: ["부산광역시"] },
  { id: "ulsan", sido: ["울산광역시"] },
  { id: "sejong", sido: ["세종특별자치시"] },
  { id: "gyeonggi", sido: ["경기도"] },
  { id: "gangwon", sido: ["강원특별자치도", "강원도"] },
  { id: "chungbuk", sido: ["충청북도"] },
  { id: "chungnam", sido: ["충청남도"] },
  { id: "gyeongbuk", sido: ["경상북도"] },
  { id: "gyeongnam", sido: ["경상남도"] },
  { id: "jeonbuk", sido: ["전북특별자치도", "전라북도"] },
  { id: "jeonnam", sido: ["전남광주통합특별시", "전라남도"], excludeCities: GWANGJU_GU },
  { id: "jeju", sido: ["제주특별자치도"] },
  // 경주는 경북 전체가 아니라 경주시만 (법정동 시군구 47130). 조건이 무시되더라도 주소로 한 번 더 거른다.
  { id: "gyeongju", sido: ["경상북도"], signgu: "130", cities: ["경주시"] },
];

// ldongCode2를 못 읽었을 때만 쓰는 내장 표 (관광공사 매뉴얼 v4.4의 법정동 시도 코드, 2026-07 통합 이전 값).
// 통합 코드는 확인된 값이 없어 넣지 않는다 → 광주·전남은 옛 코드로 시도하고, 0건이면 기존 데이터 유지.
export const FALLBACK_SIDO_CODES = {
  서울특별시: "11", 부산광역시: "26", 대구광역시: "27", 인천광역시: "28", 광주광역시: "29",
  대전광역시: "30", 울산광역시: "31", 세종특별자치시: "36", 경기도: "41", 충청북도: "43",
  충청남도: "44", 전라남도: "46", 경상북도: "47", 경상남도: "48", 제주특별자치도: "50",
  강원특별자치도: "51", 전북특별자치도: "52",
};

// 주소 "경상북도 경주시 …" → 두 번째 토큰(시군구)
export const cityOf = (addr) => (addr || "").trim().split(/\s+/)[1];

// 지역에 속하는 주소인지 (시도 코드를 같이 쓰는 광주·전남, 시군구를 한정한 경주)
export function acceptsCity(region, addr) {
  const city = cityOf(addr);
  if (region.cities) return region.cities.includes(city);
  if (region.excludeCities) return city !== undefined && !region.excludeCities.includes(city);
  return true;
}

// ldongCode2 시도 목록 [{code, name}] → 지역별 조회 조건
// 반환: { queries: { [regionId]: { lDongRegnCd, lDongSignguCd?, sidoName } }, missing: [regionId] }
export function resolveRegionQueries(sidoList, regions = REGIONS) {
  const byName = new Map(sidoList.map((s) => [String(s.name).trim(), String(s.code).trim()]));
  const queries = {};
  const missing = [];
  for (const r of regions) {
    const name = r.sido.find((n) => byName.has(n));
    if (!name) { missing.push(r.id); continue; }
    queries[r.id] = { lDongRegnCd: byName.get(name), ...(r.signgu ? { lDongSignguCd: r.signgu } : {}), sidoName: name };
  }
  return { queries, missing };
}

// ── 좌표 검사 ──
// 2026-09 데이터에 김포공항 호텔·고성 콘도가 (19.69, 117.99, 남중국해)로 들어온 적이 있다.
// 1) 대한민국 범위(백령도 124.6°E, 독도 131.9°E, 마라도 33.1°N, 강원 고성 38.6°N에 여유)
// 2) 지역 시군구 중심점(시군구청 좌표) 중 가장 가까운 곳까지의 거리. 섬 지역은 군청과 멀어서
//    (신안 가거도 ↔ 진도군 114km, 울릉군 ↔ 독도 89km) 도 단위는 120km, 섬이 먼 곳에 없는
//    광역·특별자치시와 경주시는 40km로 둔다. 이 값으로 지금까지 받은 데이터 1,057곳을 돌려
//    걸리는 것은 실제 이상 좌표(남중국해 2곳)와 경주 한정 이전에 섞였던 경주 밖 장소뿐이었다.
export const KOREA_BOUNDS = { minLat: 32.9, maxLat: 38.9, minLng: 124.4, maxLng: 132.0 };
export const DEFAULT_RADIUS_KM = 120;
export const REGION_RADIUS_KM = {
  seoul: 40, busan: 40, daegu: 40, gwangju: 40, daejeon: 40, ulsan: 40, sejong: 40, gyeongju: 40,
};
// 시군구 중심점 목록에 없는 기준점 (독도는 울릉군 독도리)
export const EXTRA_ANCHORS = { gyeongbuk: [{ name: "독도", lat: 37.2426, lng: 131.8669 }] };

// src/data/sigungu.generated.ts 텍스트 → 지역별 기준점. 경주는 경북 경주시 중심점 하나.
export function parseAnchors(src) {
  const anchors = {};
  const re = /region: "(\w+)", name: "([^"]+)".*?lat: (-?[\d.]+), lng: (-?[\d.]+)/g;
  for (const m of src.matchAll(re)) {
    const a = { name: m[2], lat: Number(m[3]), lng: Number(m[4]) };
    (anchors[m[1]] ??= []).push(a);
    if (m[1] === "gyeongbuk" && a.name === "경주시") (anchors.gyeongju ??= []).push(a);
  }
  for (const [region, extra] of Object.entries(EXTRA_ANCHORS)) {
    if (anchors[region]) anchors[region].push(...extra);
  }
  return anchors;
}

export function haversineKm(lat1, lng1, lat2, lng2) {
  const t = Math.PI / 180;
  const x = Math.sin(((lat2 - lat1) * t) / 2) ** 2
    + Math.cos(lat1 * t) * Math.cos(lat2 * t) * Math.sin(((lng2 - lng1) * t) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(x));
}

// 좌표가 없으면 통과(지도에 안 찍힐 뿐), 이상하면 사유 문자열을 돌려준다.
export function coordProblem(lat, lng, regionId, anchors) {
  if (lat == null && lng == null) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "좌표가 숫자가 아님";
  const b = KOREA_BOUNDS;
  if (lat < b.minLat || lat > b.maxLat || lng < b.minLng || lng > b.maxLng) return "대한민국 범위 밖";
  const own = anchors?.[regionId];
  if (!own?.length) return null; // 기준점을 못 읽었으면 범위 검사만
  let best = Infinity;
  for (const a of own) best = Math.min(best, haversineKm(lat, lng, a.lat, a.lng));
  const limit = REGION_RADIUS_KM[regionId] ?? DEFAULT_RADIUS_KM;
  return best > limit ? `지역 시군구에서 ${Math.round(best)}km (허용 ${limit}km)` : null;
}
