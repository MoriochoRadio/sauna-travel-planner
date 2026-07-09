// tourAPI (한국관광공사_국문 관광정보 서비스_GW) 클라이언트
// Base: https://apis.data.go.kr/B551011/KorService2
// 무료 개발계정(일 1,000건). 키는 TOURAPI_KEY env로만 사용 (하드코딩 금지).
// 하이브리드 전략: 사우나/온천은 curated seed 사용, 맛집·볼거리만 tourAPI 보강.
import { z } from "zod";

const BASE = "https://apis.data.go.kr/B551011/KorService2";

// region(우리 스키마) → tourAPI areaCode
export const AREA_CODE: Record<string, string> = {
  seoul: "1", incheon: "2", daejeon: "3", daegu: "4", gwangju: "5",
  busan: "6", gangwon: "32", gyeongju: "35", jeju: "39",
  ulsan: "7", sejong: "8", gyeonggi: "31", chungbuk: "33", chungnam: "34",
  gyeongnam: "39", jeonbuk: "37", jeonnam: "38",
};

const ItemSchema = z.object({
  title: z.string(),
  addr1: z.string().optional(),
  addr2: z.string().optional(),
  mapx: z.string().optional(),
  mapy: z.string().optional(),
  tel: z.string().optional(),
  firstimage: z.string().optional(),
  contentid: z.string(),
  contenttypeid: z.string().optional(),
});
export type TourItem = z.infer<typeof ItemSchema>;

export function buildUrl(op: string, params: Record<string, string>): string {
  const key = process.env.TOURAPI_KEY;
  if (!key) throw new Error("TOURAPI_KEY missing");
  const qs = new URLSearchParams({
    serviceKey: key,
    MobileOS: "ETC",
    MobileApp: "saunaplanner",
    _type: "json",
    numOfRows: "100",
    pageNo: "1",
    ...params,
  });
  return `${BASE}/${op}?${qs.toString()}`;
}

// 지역별 관광지(12) / 음식점(39) 전체를 페이지 순회하며 수집
export async function fetchAll(areaCode: string, contentTypeId: string): Promise<TourItem[]> {
  const out: TourItem[] = [];
  for (let page = 1; page <= 5; page++) {
    const url = buildUrl("areaBasedList2", { areaCode, contentTypeId, pageNo: String(page) });
    const res = await fetch(url);
    if (!res.ok) throw new Error(`tourAPI ${res.status}`);
    const json = (await res.json()) as any;
    const raw = json?.response?.body?.items?.item;
    if (!raw) break;
    const arr = Array.isArray(raw) ? raw : [raw];
    for (const it of arr) {
      try { out.push(ItemSchema.parse(it)); } catch { /* skip */ }
    }
    if (arr.length < 100) break;
  }
  return out;
}

export async function fetchFood(areaCode: string): Promise<TourItem[]> {
  return fetchAll(areaCode, "39");
}
export async function fetchAttractions(areaCode: string): Promise<TourItem[]> {
  return fetchAll(areaCode, "12");
}
