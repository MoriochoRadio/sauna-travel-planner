// tourAPI 동기화 스크립트 (하이브리드 + 실데이터 상세)
// 사우나/온천 = curated seed 유지, 맛집/볼거리/숙소 = tourAPI 실데이터 보강
// 실행: TOURAPI_KEY=xxx node scripts/sync-tourapi.mjs
// 결과: src/data/seed.enriched.ts 생성 (실사용 Place[] + 요약)
//       src/data/sync-status.json (마지막 시도 시각·결과 — 워크플로가 필요할 때만 커밋)
//
// fail-safe: 호출이 실패했거나 0건인 지역·분류는 기존 파일의 데이터를 그대로 둔다.
//   전부 실패하면 데이터 파일을 쓰지 않는다 → 키가 만료돼도 사이트는 마지막 정상본으로 동작.
//   사람이 조치해야 할 때(키 오류, 3주 연속 전체 실패)만 GITHUB_OUTPUT `alert`에 사유를 남기고,
//   워크플로 마지막 단계가 이를 실패로 올린다. 일시 네트워크 오류는 경고만 남긴다.
//   처리된 실패는 exit 0 (커밋·알림 단계가 이어서 돌도록). 예상 못 한 예외만 exit 1.
import { readFileSync, writeFileSync, existsSync, appendFileSync } from "node:fs";
import http from "node:http";
import https from "node:https";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../src/data/seed.enriched.ts");
const STATUS_OUT = resolve(__dirname, "../src/data/sync-status.json");
const KEY = process.env.TOURAPI_KEY;
// 로컬 검증용 재정의 (예: 존재하지 않는 호스트로 네트워크 실패 재현)
const BASE = process.env.TOURAPI_BASE || "https://apis.data.go.kr/B551011/KorService2";

// 앱의 18개 region 전부 (src/data/schema.ts Region). query = areaBasedList2 지역 조건.
// 경주는 경북(areaCode 35) 전체를 받으면 상주·경산 등이 섞이므로 경주시로 한정한다.
//   법정동 코드(경북 47, 경주시 47130)로 조회하고, 조건이 무시되더라도 주소로 한 번 더 거른다(onlyCity).
const REGIONS = [
  { id: "seoul", query: { areaCode: "1" } }, { id: "incheon", query: { areaCode: "2" } },
  { id: "daejeon", query: { areaCode: "3" } }, { id: "daegu", query: { areaCode: "4" } },
  { id: "gwangju", query: { areaCode: "5" } }, { id: "busan", query: { areaCode: "6" } },
  { id: "ulsan", query: { areaCode: "7" } }, { id: "sejong", query: { areaCode: "8" } },
  { id: "gyeonggi", query: { areaCode: "31" } }, { id: "gangwon", query: { areaCode: "32" } },
  { id: "chungbuk", query: { areaCode: "33" } }, { id: "chungnam", query: { areaCode: "34" } },
  { id: "gyeongbuk", query: { areaCode: "35" } }, { id: "gyeongnam", query: { areaCode: "36" } },
  { id: "jeonbuk", query: { areaCode: "37" } }, { id: "jeonnam", query: { areaCode: "38" } },
  { id: "jeju", query: { areaCode: "39" } },
  { id: "gyeongju", query: { lDongRegnCd: "47", lDongSignguCd: "130" }, onlyCity: "경주시" },
];

// 주소 "경상북도 경주시 …" → 두 번째 토큰(시군구)
const cityOf = (addr) => (addr || "").trim().split(/\s+/)[1];

// ── 호출 정책 ──
// GitHub 러너 → apis.data.go.kr 연결이 간헐적으로 10초(fetch 기본 연결 타임아웃)를 넘겨
// 전 지역이 한꺼번에 실패한 적이 있다. 연결 대기를 늘리고, 일시 오류만 백오프 재시도한다.
const TIMEOUT_MS = 30_000;          // 연결·응답 대기 (소켓 무응답 기준)
const MAX_ATTEMPTS = 4;             // 최초 1회 + 재시도 3회
const BACKOFF_MS = 2_000;           // 2초 → 4초 → 8초
const MAX_CONSECUTIVE_NETWORK_FAILS = 3; // 연결 자체가 연속 실패하면 나머지 호출은 생략
const STALE_ALERT_DAYS = 20;        // 주 1회 기준 3회 연속 전체 실패(21일)에서 알림, 크론 지연 여유 1일

// 사람이 조치해야 하는 응답 (공공데이터포털 게이트웨이 errMsg / 인증 실패 HTTP 상태)
// 예) 키 없음 → 401 SERVICE_KEY_IS_NULL, 미등록 키 → 403 SERVICE_KEY_IS_NOT_REGISTERED_ERROR
const KEY_ERRORS = [
  "SERVICE_KEY_IS_NULL",
  "SERVICE_KEY_IS_NOT_REGISTERED_ERROR",
  "DEADLINE_HAS_EXPIRED_ERROR",     // 활용기간 만료
  "SERVICE_ACCESS_DENIED_ERROR",
  "UNREGISTERED_IP_ERROR",
  "LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR",
];

class HumanActionError extends Error {}
class NetworkError extends Error {}   // 연결 실패·타임아웃 (재시도 대상)
class RetryableError extends Error {} // 429·5xx (재시도 대상)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function get(url) {
  const lib = url.startsWith("http:") ? http : https;
  return new Promise((resolveGet, reject) => {
    const req = lib.get(url, { timeout: TIMEOUT_MS }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (c) => (body += c));
      res.on("end", () => resolveGet({ status: res.statusCode, body }));
      res.on("error", reject);
    });
    req.on("timeout", () => req.destroy(Object.assign(new Error(`${TIMEOUT_MS / 1000}초 내 응답 없음`), { code: "ETIMEDOUT" })));
    req.on("error", reject);
  });
}

async function requestOnce(url) {
  let res;
  try { res = await get(url); }
  catch (e) { throw new NetworkError(`연결 실패: ${e.message || e.code || e}`); }
  const { status, body } = res;
  const keyError = KEY_ERRORS.find((c) => body.includes(c));
  if (keyError || status === 401 || status === 403) {
    throw new HumanActionError(`키/권한 오류 ${keyError || `HTTP ${status}`}`);
  }
  if (status === 429 || status >= 500) throw new RetryableError(`HTTP ${status}`);
  if (status !== 200) throw new Error(`HTTP ${status}`);
  let json;
  try { json = JSON.parse(body); } catch { throw new Error(`JSON 아닌 응답: ${body.slice(0, 80)}`); }
  const header = json?.response?.header ?? json; // 파라미터 오류 등은 최상위에 resultCode가 온다
  if (header?.resultCode && !/^0+$/.test(header.resultCode)) {
    throw new Error(`resultCode ${header.resultCode} ${header.resultMsg ?? ""}`.trim());
  }
  return json;
}

async function request(op, params) {
  const qs = new URLSearchParams({
    serviceKey: KEY, MobileOS: "ETC", MobileApp: "saunaplanner", _type: "json", ...params,
  });
  for (let attempt = 1; ; attempt++) {
    try {
      return await requestOnce(`${BASE}/${op}?${qs}`);
    } catch (e) {
      const retryable = e instanceof NetworkError || e instanceof RetryableError;
      if (!retryable || attempt === MAX_ATTEMPTS) throw e;
      const wait = BACKOFF_MS * 2 ** (attempt - 1);
      console.warn(`   ↻ ${e.message} — ${wait / 1000}초 후 재시도 (${attempt}/${MAX_ATTEMPTS - 1})`);
      await sleep(wait);
    }
  }
}

// arrange C = 최근 수정순. 제목 가나다순이면 "가"로 시작하는 곳만 뽑혀 지역 대표성이 없다.
async function fetchAll(query, contentTypeId) {
  const out = [];
  for (let page = 1; page <= 5; page++) {
    const json = await request("areaBasedList2", {
      numOfRows: "100", pageNo: String(page), arrange: "C", ...query, contentTypeId,
    });
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

// tourAPI raw item → 우리 도메인 Place 객체로 매핑
// 시군구 id는 여기서 정하지 않는다. seed.ts가 city("서울특별시 강남구")를 findSigungu로 매핑한다 —
// 전국 230개 목록과 시도명 정규화를 한 곳(src/data/sigungu.ts)에서만 관리하기 위해서다.
function toPlace(item, regionId, type, idx) {
  const addr = (item.addr1 || "").trim();
  const city = addr.split(/\s+/).slice(0, 2).join(" ") || regionId;
  const tel = (item.tel || "").trim();
  return {
    id: `${regionId}-${type === "restaurant" ? "food" : type === "lodging" ? "stay" : "att"}-api-${idx}`,
    name: item.title.trim(),
    type,
    region: regionId,
    city,
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

// 제목 중복을 빼고, 시군구를 번갈아 가며 n곳을 고른다 (한 구에 몰리면 시군구 가중이 소용없다).
// 같은 시군구 안에서는 응답 순서(최근 수정순)를 따른다.
function spread(items, n) {
  const seen = new Set();
  const groups = new Map();
  for (const i of items) {
    if (!i.title || seen.has(i.title)) continue;
    seen.add(i.title);
    const key = cityOf(i.addr1) ?? "";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(i);
  }
  const out = [];
  const queues = [...groups.values()];
  while (out.length < n && queues.some((q) => q.length > 0)) {
    for (const q of queues) if (q.length > 0 && out.length < n) out.push(q.shift());
  }
  return out;
}

// 분류별 가공: 원시 목록 → { places, stats(enrichedSummary 필드) }
function buildFood(items, regionId) {
  const places = spread(items, 8).map((i, idx) => toPlace(i, regionId, "restaurant", idx + 1));
  return { places, stats: { foodCount: items.length } };
}

function buildAttr(items, regionId) {
  const filtered = items.filter((i) => !SAUNA_KW.some((k) => (i.title || "").toLowerCase().includes(k.toLowerCase())));
  const places = spread(filtered, 8).map((i, idx) => toPlace(i, regionId, "attraction", idx + 1));
  return { places, stats: { attrCount: filtered.length } };
}

// 숙소: 실데이터 + onsen/sauna 추정 (이름 기준 — tourAPI 목록은 overview 미제공)
function buildStay(items, regionId) {
  const places = [];
  for (const i of spread(items, 10)) {
    const blob = `${i.title} ${(i.overview || "")}`.toLowerCase();
    const hasOnsen = SAUNA_KW.some((k) => blob.includes(k.toLowerCase()));
    const place = toPlace(i, regionId, "lodging", places.length + 1);
    place.hasOnsen = hasOnsen || undefined;
    place.hasSauna = blob.includes("사우나") || blob.includes("찜질") || undefined;
    places.push(place);
  }
  return {
    places,
    stats: {
      stayCount: items.length,
      stayWithOnsen: places.filter((p) => p.hasOnsen).length,
      stayTitles: places.slice(0, 5).map((p) => p.name),
    },
  };
}

const CATEGORIES = [
  { key: "food", contentTypeId: "39", type: "restaurant", build: buildFood },
  { key: "attr", contentTypeId: "12", type: "attraction", build: buildAttr },
  { key: "stay", contentTypeId: "32", type: "lodging", build: buildStay },
];

// 기존 seed.enriched.ts의 지역별 데이터·요약·생성 시각 (JSON.stringify 결과라 그대로 파싱된다)
function loadPrevious() {
  if (!existsSync(OUT)) return { enrichedPlaces: {}, enrichedSummary: [], generatedAt: null, ok: true };
  const src = readFileSync(OUT, "utf8");
  const generatedAt = src.match(/^\/\/ auto-generated by .* — (\S+)$/m)?.[1] ?? null;
  try {
    return {
      enrichedPlaces: JSON.parse(src.match(/export const enrichedPlaces[^=]*=\s*([\s\S]*?);\s*\/\/ 수집 요약/)[1]),
      enrichedSummary: JSON.parse(src.match(/export const enrichedSummary\s*=\s*([\s\S]*?);\s*$/)[1]),
      generatedAt,
      ok: true,
    };
  } catch (e) {
    console.warn("기존 seed.enriched.ts 해석 실패 — 전 지역을 새로 받은 경우에만 덮어씀:", e.message);
    return { enrichedPlaces: {}, enrichedSummary: [], generatedAt, ok: false };
  }
}

// 실패했거나 0건인 지역·분류는 기존 장소와 요약 값을 그대로 옮긴다
// (경주처럼 시군구를 한정한 지역은 예전에 섞여 들어온 다른 시군구 장소를 여기서 걸러낸다)
function keepPrevious(prev, c, r) {
  const regionId = r.id;
  const places = (prev.enrichedPlaces[regionId] ?? [])
    .filter((p) => p.type === c.type)
    .filter((p) => !r.onlyCity || cityOf(p.address ?? p.city) === r.onlyCity);
  const prevStat = prev.enrichedSummary.find((s) => s.region === regionId) ?? {};
  const stats = c.build([], regionId).stats; // 기존 요약이 없으면 0건
  for (const k of Object.keys(stats)) if (k in prevStat) stats[k] = prevStat[k];
  return { places, stats };
}

async function collect(prev) {
  const stats = [];
  const enrichedPlaces = {};
  const kept = [];
  const errors = [];
  let fresh = 0;
  // 사람이 조치해야 할 오류(키 만료 등) — 나머지 호출도 같은 결과이므로 발견 즉시 중단
  let humanAction = KEY ? null : "TOURAPI_KEY 시크릿이 비어 있음";
  let networkFails = 0; // 연속 연결 실패 수
  for (const r of REGIONS) {
    const parts = [];
    const keptHere = [];
    for (const c of CATEGORIES) {
      let built = null;
      if (!humanAction && networkFails < MAX_CONSECUTIVE_NETWORK_FAILS) {
        try {
          const items = (await fetchAll(r.query, c.contentTypeId))
            .filter((i) => !r.onlyCity || cityOf(i.addr1) === r.onlyCity);
          built = c.build(items, r.id);
          networkFails = 0;
        } catch (e) {
          console.warn(`${r.id} ${c.key} 실패`, e.message);
          errors.push(`${r.id} ${c.key}: ${e.message}`);
          if (e instanceof HumanActionError) humanAction = e.message;
          networkFails = e instanceof NetworkError ? networkFails + 1 : 0;
          if (networkFails === MAX_CONSECUTIVE_NETWORK_FAILS) console.warn(`연결 ${networkFails}회 연속 실패 — 남은 호출 생략`);
        }
      }
      if (built && built.places.length > 0) { fresh++; parts.push(built); }
      else { keptHere.push(c.key); parts.push(keepPrevious(prev, c, r)); }
    }
    // 지역 전체를 유지했으면 지역 id만, 일부면 "지역:분류"로 기록
    if (keptHere.length === CATEGORIES.length) kept.push(r.id);
    else kept.push(...keptHere.map((k) => `${r.id}:${k}`));
    enrichedPlaces[r.id] = parts.flatMap((p) => p.places);
    stats.push(Object.assign({ region: r.id }, ...parts.map((p) => p.stats)));
  }
  return { stats, enrichedPlaces, fresh, kept, errors, humanAction };
}

const prev = loadPrevious();
const now = new Date();
const total = REGIONS.length * CATEGORIES.length;
const { stats, enrichedPlaces, fresh, kept, errors, humanAction } = await collect(prev);

// 새로 받은 것이 하나라도 있으면 기록 (기존 파일을 해석하지 못했다면 전부 새로 받은 경우에만)
const write = fresh > 0 && (prev.ok || fresh === total);
if (write) {
  const ts = `// auto-generated by scripts/sync-tourapi.mjs — ${now.toISOString()}
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
} else {
  console.log(`새로 받은 데이터 없음 — ${OUT} 유지 (마지막 성공 ${prev.generatedAt ?? "알 수 없음"})`);
}

// ── 결과 판정·기록 ──
const lastSuccessAt = write ? now.toISOString() : prev.generatedAt;
const daysSinceSuccess = lastSuccessAt ? (now - new Date(lastSuccessAt)) / 86_400_000 : 0;
const result = humanAction ? "key_error" : fresh === total ? "ok" : write ? "partial" : "failed";
let alert = null;
if (humanAction) alert = `TourAPI ${humanAction}`;
else if (!write && daysSinceSuccess >= STALE_ALERT_DAYS) {
  alert = `TourAPI 동기화가 ${Math.floor(daysSinceSuccess)}일째 전 지역 실패 (마지막 성공 ${lastSuccessAt})`;
}

// 상태 파일은 공개 레포에 커밋될 수 있으므로 키가 섞이지 않게 가린다
const redact = (s) => (KEY ? s.split(KEY).join("***").split(encodeURIComponent(KEY)).join("***") : s);
const status = {
  lastAttemptAt: now.toISOString(),
  result,
  lastSuccessAt,
  fresh: `${fresh}/${total}`,
  kept,
  errors,
  alert,
};
writeFileSync(STATUS_OUT, redact(JSON.stringify(status, null, 2)) + "\n");

console.log(`결과: ${result} — 새로 받음 ${fresh}/${total}, 기존 유지 ${kept.join(", ") || "없음"}`);
if (alert) console.log(`사람 조치 필요: ${redact(alert)}`);
else if (result !== "ok") console.log(`::warning::tourAPI 동기화 ${result} (${fresh}/${total}) — 기존 데이터 유지, 다음 주 재시도`);
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `result=${result}\nalert=${redact(alert ?? "").replace(/\s+/g, " ")}\n`);
}
