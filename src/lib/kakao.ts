import type { Place } from "@/data/schema";

// 카카오 로컬 검색 API (무료, REST API 키 필요)
const KAKAO_LOCAL = "https://dapi.kakao.com/v2/local/search/keyword.json";

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
}

const SAUNA_KW = ["온천", "사우나", "찜질", "스파", "목욕", "욕장", "찜질방", "스파", "대온천"];

// 시군구 중심좌표 기반 반경 검색 → 사우나/온천 위주 필터
export async function searchKakaoSauna(
  lat: number,
  lng: number,
  regionId: string,
  sigunguId: string
): Promise<KakaoPlace[]> {
  const KEY = process.env.KAKAO_REST_KEY;
  if (!KEY) return [];

  const out: KakaoPlace[] = [];
  // 실증: "시군구명 사우나" 복합 쿼리는 0건 → 순수 키워드 + 좌표/반경
  // (카카오는 공백을 AND 검색하여 너무 좁아짐)
  const queries = ["사우나", "찜질방", "온천", "스파"];
  for (const q of queries) {
    for (let page = 1; page <= 3; page++) {
      const qs = new URLSearchParams({
        query: q,
        x: String(lng),
        y: String(lat),
        radius: "10000", // 10km (5km는 결과 부족)
        page: String(page),
        size: "15",
      });
      try {
        const res = await fetch(`${KAKAO_LOCAL}?${qs}`, {
          headers: { Authorization: `KakaoAK ${KEY}` },
          cache: "no-store",
        });
        if (!res.ok) break;
        const json = (await res.json()) as any;
        const arr: KakaoPlace[] = json?.documents ?? [];
        for (const d of arr) {
          // 카카오 검색 자체가 사우나/찜질방/온천/스파 쿼리로 돌렸으므로
          // 카페(CE7)만 제외하고 대부분 수용 (결과 손실 방지)
          if (d.category_group_code === "CE7") continue;
          // 중복 제거
          if (out.some((o) => o.id === d.id || o.place_name === d.place_name)) continue;
          out.push(d);
        }
        if (arr.length < 15) break;
      } catch {
        break;
      }
    }
    if (out.length >= 20) break;
  }
  return out.slice(0, 25);
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
  const lat = d.y ? Number(d.y) : undefined;
  const lng = d.x ? Number(d.x) : undefined;
  const addr = d.road_address_name || d.address_name || undefined;
  const city = addr?.split(/\s+/).slice(0, 2).join(" ") ?? regionId;
  return {
    id: `kk-${regionId}-${sigunguId}-s-${idx}`,
    name: d.place_name,
    type: isOnsen ? "spa" : "sauna",
    region: regionId as Place["region"],
    city,
    sigungu: sigunguId,
    summary: isOnsen ? "카카오 검색 온천/스파" : "카카오 검색 사우나/찜질방",
    tags: isOnsen ? ["카카오", "온천", "실시간"] : ["카카오", "사우나", "실시간"],
    priceLevel: "mid",
    avgDurationMin: 120,
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
}
