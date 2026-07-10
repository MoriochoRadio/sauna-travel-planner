import type { Place } from "@/data/schema";
import { computeRating } from "@/lib/rating";

// 카카오 로컬 검색 API (무료, REST API 키 필요)
const KAKAO_LOCAL = "https://dapi.kakao.com/v2/local/search";

export interface KakaoPlace {
  id: string;
  place_name: string;
  category_name?: string;
  address_name?: string;
  road_address_name?: string;
  x: string; // 경도 lng
  y: string; // 위도 lat
  phone?: string;
  place_url?: string;
  category_group_code?: string;
  distance?: string;
}

// 사우나/찜질방/온천 관련 키워드
const SAUNA_KW = ["온천", "사우나", "찜질", "스파", "목욕", "욕장", "찜질방", "대온천"];
// 숙소(호텔/리조트/펜션/모텔) 관련
const LODGING_KW = ["호텔", "리조트", "펜션", "모텔", "게스트하우스", "민박", "콘도"];

// 시군구 중심좌표 기반 반경 검색 (사우나/찜질방/온천/스파)
export async function searchKakaoSauna(
  lat: number,
  lng: number,
  regionId: string,
  sigunguId: string
): Promise<KakaoPlace[]> {
  return searchByKeyword(["사우나", "찜질방", "온천", "스파"], lat, lng, regionId, sigunguId, false);
}

// 시군구 내 숙소 검색 (호텔/리조트/펜션 등)
export async function searchKakaoLodging(
  lat: number,
  lng: number,
  regionId: string,
  sigunguId: string
): Promise<KakaoPlace[]> {
  return searchByKeyword(LODGING_KW, lat, lng, regionId, sigunguId, true);
}

async function searchByKeyword(
  queries: string[],
  lat: number,
  lng: number,
  regionId: string,
  sigunguId: string,
  isLodging: boolean
): Promise<KakaoPlace[]> {
  const KEY = process.env.KAKAO_REST_KEY;
  if (!KEY) return [];

  const out: KakaoPlace[] = [];
  for (const q of queries) {
    for (let page = 1; page <= 3; page++) {
      const qs = new URLSearchParams({
        query: q,
        x: String(lng),
        y: String(lat),
        radius: "10000",
        page: String(page),
        size: "15",
      });
      try {
        const res = await fetch(`${KAKAO_LOCAL}/keyword.json?${qs}`, {
          headers: { Authorization: `KakaoAK ${KEY}` },
          cache: "no-store",
        });
        if (!res.ok) break;
        const json = (await res.json()) as any;
        const arr: KakaoPlace[] = json?.documents ?? [];
        for (const d of arr) {
          // 카페(CE7)는 사우나/숙소 아님 → 제외
          if (d.category_group_code === "CE7") continue;
          // 숙소 모드: 사우나 관련 카테고리는 제외 (중복 방지)
          if (isLodging) {
            const blob = `${d.place_name} ${d.category_name ?? ""}`.toLowerCase();
            if (SAUNA_KW.some((k) => blob.includes(k.toLowerCase()))) continue;
          }
          if (out.some((o) => o.id === d.id || o.place_name === d.place_name)) continue;
          out.push(d);
        }
        if (arr.length < 15) break;
      } catch {
        break;
      }
    }
    if (out.length >= 25) break;
  }
  return out.slice(0, isLodging ? 15 : 25);
}

// 카카오 응답 → 우리 Place
export function kakaoToPlace(
  d: KakaoPlace,
  regionId: string,
  sigunguId: string,
  idx: number
): Place {
  const blob = `${d.place_name} ${d.category_name ?? ""}`.toLowerCase();
  const isOnsen = ["온천", "스파", "욕장", "대온천", "찜질방"].some((k) => blob.includes(k.toLowerCase())) ||
    d.category_group_code === "HP8" || d.category_group_code === "CT1";
  const isLodging = LODGING_KW.some((k) => blob.includes(k.toLowerCase())) ||
    d.category_group_code === "AD5" || d.category_group_code === "BD1";
  const lat = d.y ? Number(d.y) : undefined;
  const lng = d.x ? Number(d.x) : undefined;
  const addr = d.road_address_name || d.address_name || undefined;
  const city = addr?.split(/\s+/).slice(0, 2).join(" ") ?? regionId;
  const type: Place["type"] = isLodging ? "lodging" : isOnsen ? "spa" : "sauna";
  const place: Place = {
    id: `kk-${regionId}-${sigunguId}-${isLodging ? "l" : "s"}-${idx}`,
    name: d.place_name,
    type,
    region: regionId as Place["region"],
    city,
    sigungu: sigunguId,
    summary: isLodging ? "카카오 검색 숙소" : isOnsen ? "카카오 검색 온천/스파" : "카카오 검색 사우나/찜질방",
    tags: isLodging ? ["카카오", "숙소", "실시간"] : isOnsen ? ["카카오", "온천", "실시간"] : ["카카오", "사우나", "실시간"],
    priceLevel: "mid",
    avgDurationMin: isLodging ? 480 : 120,
    address: addr,
    url: d.place_url,
    openHours: undefined,
    highlights: [addr ? `📍 ${addr}` : "주소 정보 카카오 제공", d.phone ? `☎ ${d.phone}` : "현장 확인 권장"].filter(Boolean),
    source: "kakao",
    lat,
    lng,
    homepage: d.place_url,
    tel: d.phone,
    hasOnsen: isOnsen || undefined,
    hasSauna: !isOnsen || undefined,
  };
  return { ...place, rating: computeRating(place) };
}

// 좌표 → 주소 (역지오코딩, UI 표시용)
export async function coordToAddress(lat: number, lng: number): Promise<string | null> {
  const KEY = process.env.KAKAO_REST_KEY;
  if (!KEY) return null;
  try {
    const res = await fetch(`${KAKAO_LOCAL}/geo/coord2address.json?x=${lng}&y=${lat}`, {
      headers: { Authorization: `KakaoAK ${KEY}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const j = (await res.json()) as any;
    const d = (j?.documents ?? [])[0];
    return d?.road_address?.address_name || d?.address?.address_name || null;
  } catch {
    return null;
  }
}
