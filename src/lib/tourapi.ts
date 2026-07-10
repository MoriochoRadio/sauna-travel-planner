import type { Place } from "@/data/schema";

const TOURAPI_BASE = "https://apis.data.go.kr/B551011/KorService2";
const SAUNA_KW = ["온천", "사우나", "찜질", "스파", "목욕", "욕장", "찜질방", "hotspring", "spa", "대온천"];

export interface TourApiPlace {
  name: string;
  addr1?: string;
  addr2?: string;
  mapx?: string;
  mapy?: string;
  tel?: string;
  homepage?: string;
  contentid: string;
  contenttypeid?: string;
}

// searchKeyword2: areaCode + keyword=사우나 (시군구 정확 필터는 addr1 파싱으로 보강)
export async function searchSaunaPlaces(
  areaCode: string,
  keyword = "사우나",
  sigunguName?: string
): Promise<TourApiPlace[]> {
  const KEY = process.env.TOURAPI_KEY;
  if (!KEY) return [];

  const out: TourApiPlace[] = [];
  for (let page = 1; page <= 3; page++) {
    const qs = new URLSearchParams({
      serviceKey: KEY,
      MobileOS: "ETC",
      MobileApp: "saunaplanner",
      _type: "json",
      numOfRows: "20",
      pageNo: String(page),
      areaCode,
      keyword,
      listYN: "Y",
      arrange: "O",
    });
    const res = await fetch(`${TOURAPI_BASE}/searchKeyword2?${qs}`);
    if (!res.ok) break;
    const json = (await res.json()) as any;
    const raw = json?.response?.body?.items?.item;
    if (!raw) break;
    const arr = Array.isArray(raw) ? raw : [raw];
    for (const it of arr) {
      const addr: string = it.addr1 || "";
      // 시군구명으로 필터 (선택적 — 정확도 향상)
      if (sigunguName && addr && !addr.includes(sigunguName)) continue;
      if (it.title) out.push({
        name: String(it.title).replace(/<[^>]+>/g, ""),
        addr1: it.addr1,
        addr2: it.addr2,
        mapx: it.mapx,
        mapy: it.mapy,
        tel: it.tel,
        homepage: it.homepage,
        contentid: String(it.contentid),
        contenttypeid: it.contenttypeid,
      });
    }
    if (arr.length < 20) break;
  }
  return out;
}

// tourAPI 응답 → 우리 Place (사우나/온천 유형)
export function toSaunaPlace(
  item: TourApiPlace,
  regionId: string,
  sigunguId: string,
  idx: number
): Place {
  const blob = `${item.name} ${item.addr1 ?? ""}`.toLowerCase();
  const isOnsen = SAUNA_KW.some((k) => blob.includes(k.toLowerCase()));
  const lat = item.mapy ? Number(item.mapy) : undefined;
  const lng = item.mapx ? Number(item.mapx) : undefined;
  return {
    id: `rt-${regionId}-${sigunguId}-sauna-${idx}`,
    name: item.name,
    type: isOnsen ? "spa" : "sauna",
    region: regionId as Place["region"],
    city: item.addr1?.split(/\s+/).slice(0, 2).join(" ") ?? regionId,
    sigungu: sigunguId,
    summary: isOnsen ? "tourAPI 실시간 검색 온천/스파" : "tourAPI 실시간 검색 사우나/찜질방",
    tags: isOnsen ? ["tourAPI", "온천", "실시간"] : ["tourAPI", "사우나", "실시간"],
    priceLevel: "mid",
    avgDurationMin: 120,
    address: item.addr1,
    url: item.homepage ? stripTags(item.homepage) : undefined,
    openHours: undefined,
    highlights: [item.addr1 ?? "주소 정보 tourAPI 제공", item.tel ? `☎ ${item.tel}` : "현장 확인 권장"].filter(Boolean),
    source: "tourapi",
    lat,
    lng,
    homepage: item.homepage ? stripTags(item.homepage) : undefined,
    tel: item.tel,
    hasOnsen: isOnsen || undefined,
    hasSauna: !isOnsen || undefined,
  };
}

function stripTags(s?: string): string | undefined {
  if (!s) return undefined;
  const m = s.match(/href=["']([^"']+)["']/i);
  if (m) return m[1];
  return s.replace(/<[^>]+>/g, "").trim() || undefined;
}
