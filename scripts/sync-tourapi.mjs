// tourAPI 동기화 스크립트 (하이브리드 + 실데이터 상세)
// 사우나/온천 = curated seed 유지, 맛집/볼거리/숙소 = tourAPI 실데이터 보강
// 실행: TOURAPI_KEY=xxx node scripts/sync-tourapi.mjs
// 결과: src/data/seed.enriched.ts 생성 (실사용 Place[] + 요약)
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../src/data/seed.enriched.ts");
const KEY = process.env.TOURAPI_KEY;
if (!KEY) { console.error("TOURAPI_KEY env 필요"); process.exit(1); }

const REGIONS = [
  { id: "seoul", areaCode: "1" }, { id: "incheon", areaCode: "2" },
  { id: "daejeon", areaCode: "3" }, { id: "daegu", areaCode: "4" },
  { id: "gwangju", areaCode: "5" }, { id: "busan", areaCode: "6" },
  { id: "gangwon", areaCode: "32" }, { id: "gyeongju", areaCode: "35" },
  { id: "jeju", areaCode: "39" },
];

async function fetchAll(areaCode, contentTypeId) {
  const out = [];
  for (let page = 1; page <= 5; page++) {
    const qs = new URLSearchParams({
      serviceKey: KEY, MobileOS: "ETC", MobileApp: "saunaplanner", _type: "json",
      numOfRows: "100", pageNo: String(page), areaCode, contentTypeId,
    });
    const res = await fetch(`https://apis.data.go.kr/B551011/KorService2/areaBasedList2?${qs}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const raw = json?.response?.body?.items?.item;
    if (!raw) break;
    const arr = Array.isArray(raw) ? raw : [raw];
    for (const it of arr) if (it.title) out.push(it);
    if (arr.length < 100) break;
  }
  return out;
}

// areaBasedList2 응답에 mapx/mapy/homepage가 이미 포함되므로 detailCommon2 호출 불필요
const SAUNA_KW = ["온천", "사우나", "찜질", "스파", "목욕", "욕장", "찜질방", "hotspring", "spa", "대온천"];

// 동기화 스크립트용 시군구 매핑 (sigungu.ts와 동일 로직, .mjs 호환)
const SIGUNGU = [
  { region: "seoul", name: "중구", full: "서울 중구" }, { region: "seoul", name: "영등포구", full: "서울 영등포구" },
  { region: "seoul", name: "용산구", full: "서울 용산구" }, { region: "seoul", name: "종로구", full: "서울 종로구" }, { region: "seoul", name: "강남구", full: "서울 강남구" },
  { region: "busan", name: "해운대구", full: "부산 해운대구" }, { region: "busan", name: "수영구", full: "부산 수영구" }, { region: "busan", name: "동래구", full: "부산 동래구" }, { region: "busan", name: "부산진구", full: "부산 부산진구" }, { region: "busan", name: "사하구", full: "부산 사하구" },
  { region: "gangwon", name: "평창군", full: "강원 평창군" }, { region: "gangwon", name: "강릉시", full: "강원 강릉시" }, { region: "gangwon", name: "춘천시", full: "강원 춘천시" }, { region: "gangwon", name: "속초시", full: "강원 속초시" },
  { region: "gyeongju", name: "경주시", full: "경북 경주시" },
  { region: "jeju", name: "제주시", full: "제주 제주시" }, { region: "jeju", name: "서귀포시", full: "제주 서귀포시" },
  { region: "incheon", name: "계양구", full: "인천 계양구" }, { region: "incheon", name: "연수구", full: "인천 연수구" }, { region: "incheon", name: "중구", full: "인천 중구" },
  { region: "daejeon", name: "유성구", full: "대전 유성구" }, { region: "daejeon", name: "서구", full: "대전 서구" }, { region: "daejeon", name: "중구", full: "대전 중구" },
  { region: "gwangju", name: "동구", full: "광주 동구" }, { region: "gwangju", name: "서구", full: "광주 서구" }, { region: "gwangju", name: "북구", full: "광주 북구" },
  { region: "daegu", name: "달서구", full: "대구 달서구" }, { region: "daegu", name: "중구", full: "대구 중구" }, { region: "daegu", name: "남구", full: "대구 남구" }, { region: "daegu", name: "수성구", full: "대구 수성구" },
];
function findSigunguLocal(regionId, cityText) {
  const t = (cityText || "").trim();
  const found = SIGUNGU.find((s) => s.region === regionId && (s.full === t || s.name === t));
  return found ? `${regionId}-${found.name}` : undefined;
}

// tourAPI raw item → 우리 도메인 Place 객체로 매핑
function toPlace(item, regionId, type, idx) {
  const addr = (item.addr1 || "").trim();
  const city = addr.split(/\s+/).slice(0, 2).join(" ") || regionId;
  const sigungu = findSigunguLocal(regionId, city);
  const tel = (item.tel || "").trim();
  return {
    id: `${regionId}-${type === "restaurant" ? "food" : type === "lodging" ? "stay" : "att"}-api-${idx}`,
    name: item.title.trim(),
    type,
    region: regionId,
    city,
    sigungu: sigungu || undefined,
    summary: type === "restaurant"
      ? "tourAPI 등록 맛집 — 사우나 전후 식사 코스"
      : type === "lodging"
      ? "tourAPI 등록 숙소 — 온천/사우나 보유 여부 확인 필요"
      : "tourAPI 등록 볼거리 — 사우나 사이 완충 코스",
    tags: type === "restaurant" ? ["tourAPI", "맛집"] : type === "lodging" ? ["tourAPI", "숙소"] : ["tourAPI", "볼거리"],
    priceLevel: "mid",
    avgDurationMin: type === "lodging" ? 480 : 60,
    address: addr || undefined,
    url: type === "lodging" ? (item.homepage ? stripTags(item.homepage) : undefined) : undefined,
    openHours: type === "lodging" ? "24시간" : undefined,
    highlights: [addr || "주소 정보 tourAPI 제공", tel ? `☎ ${tel}` : "현장 확인 권장"].filter(Boolean),
    source: "tourapi",
    lat: item.mapy ? Number(item.mapy) : undefined,
    lng: item.mapx ? Number(item.mapx) : undefined,
    homepage: item.homepage ? stripTags(item.homepage) : undefined,
    tel: tel || undefined,
  };
}

function stripTags(s) {
  if (!s) return undefined;
  // homepage는 종종 <a href="...">...</a> 형태 — href 추출
  const m = s.match(/href=["']([^"']+)["']/i);
  if (m) return m[1];
  return s.replace(/<[^>]+>/g, "").trim() || undefined;
}

async function collect() {
  const stats = [];
  const enrichedPlaces = {};
  for (const r of REGIONS) {
    let food = [], attr = [], stay = [];
    try { food = await fetchAll(r.areaCode, "39"); } catch (e) { console.warn(`${r.id} food 실패`, e.message); }
    try { attr = await fetchAll(r.areaCode, "12"); } catch (e) { console.warn(`${r.id} attr 실패`, e.message); }
    try { stay = await fetchAll(r.areaCode, "32"); } catch (e) { console.warn(`${r.id} stay 실패`, e.message); }

    const attrFiltered = attr.filter((i) => !SAUNA_KW.some((k) => (i.title || "").toLowerCase().includes(k.toLowerCase())));

    const seenFood = new Set();
    const foodPlaces = food
      .filter((i) => i.title && !seenFood.has(i.title) && seenFood.add(i.title))
      .slice(0, 8)
      .map((i, idx) => toPlace(i, r.id, "restaurant", idx + 1));

    const seenAttr = new Set();
    const attrPlaces = attrFiltered
      .filter((i) => i.title && !seenAttr.has(i.title) && seenAttr.add(i.title))
      .slice(0, 8)
      .map((i, idx) => toPlace(i, r.id, "attraction", idx + 1));

    // 숙소: 실데이터 + onsen/sauna 추정 (이름 기준 — tourAPI 목록은 overview 미제공)
    const seenStay = new Set();
    const stayPlaces = [];
    for (const i of stay.filter((x) => x.title && !seenStay.has(x.title) && seenStay.add(x.title)).slice(0, 10)) {
      const blob = `${i.title} ${(i.overview || "")}`.toLowerCase();
      const hasOnsen = SAUNA_KW.some((k) => blob.includes(k.toLowerCase()));
      const place = toPlace(i, r.id, "lodging", stayPlaces.length + 1);
      place.hasOnsen = hasOnsen || undefined;
      place.hasSauna = blob.includes("사우나") || blob.includes("찜질") || undefined;
      stayPlaces.push(place);
    }

    enrichedPlaces[r.id] = [...foodPlaces, ...attrPlaces, ...stayPlaces];

    stats.push({
      region: r.id,
      foodCount: food.length,
      attrCount: attrFiltered.length,
      stayCount: stay.length,
      stayWithOnsen: stayPlaces.filter((p) => p.hasOnsen).length,
      stayTitles: stayPlaces.slice(0, 5).map((p) => p.name),
    });
  }
  return { stats, enrichedPlaces };
}

const { stats, enrichedPlaces } = await collect();
const ts = `// auto-generated by scripts/sync-tourapi.mjs — ${new Date().toISOString()}
// 하이브리드: 사우나/온천=curated(seed.ts), 맛집/볼거리/숙소=tourAPI 실데이터 보강(이 파일).
// seed.ts가 이 파일을 optional import하여 지역별 places에 병합합니다.
import type { Place } from "./schema";

// 지역별 tourAPI 보강 장소 (맛집/볼거리/숙소 - 실좌표 포함)
export const enrichedPlaces: Record<string, Place[]> = ${JSON.stringify(enrichedPlaces, null, 2)};

// 수집 요약 (모니터링/디버그용)
export const enrichedSummary = ${JSON.stringify(stats, null, 2)};
`;
writeFileSync(OUT, ts);
console.log("생성 완료:", OUT);
console.log(JSON.stringify(stats, null, 2));
