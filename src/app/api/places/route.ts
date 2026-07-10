import { NextRequest, NextResponse } from "next/server";
import { findSigunguById } from "@/data/sigungu";
import { searchKakaoSauna, searchKakaoLodging, kakaoToPlace } from "@/lib/kakao";
import { searchSaunaPlaces, toSaunaPlace } from "@/lib/tourapi";
import { computeRating } from "@/lib/rating";
import { clientIp, rateLimit } from "../rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/places?region=seoul&sigungu=seoul-jung&lodging=1
// → 카카오 로컬 검색(실시간, 우선) → tourAPI 폴백 → 빈 배열
export async function GET(req: NextRequest) {
  if (!process.env.CI && !rateLimit(clientIp(req))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region") ?? "";
  const sigunguId = searchParams.get("sigungu") ?? "";
  const wantLodging = searchParams.get("lodging") === "1";
  const s = sigunguId ? findSigunguById(sigunguId) : undefined;
  if (!s || s.region !== region) {
    return NextResponse.json({ error: "invalid region/sigungu" }, { status: 400 });
  }

  const out: any[] = [];
  let source = "none";

  // 1) 카카오 실시간 (키 있으면)
  if (process.env.KAKAO_REST_KEY) {
    try {
      const raw = await searchKakaoSauna(s.lat, s.lng, region, sigunguId);
      for (const d of raw) out.push(kakaoToPlace(d, region, sigunguId, out.length + 1));
      if (wantLodging) {
        const rawL = await searchKakaoLodging(s.lat, s.lng, region, sigunguId);
        for (const d of rawL) out.push(kakaoToPlace(d, region, sigunguId, out.length + 1));
      }
      if (out.length > 0) source = "kakao";
    } catch (e: any) {
      console.warn("[places] kakao 실패, tourAPI 폴백", e?.message);
    }
  }

  // 2) tourAPI 폴백 (카카오 0건 & 키 있으면)
  if (out.length === 0 && process.env.TOURAPI_KEY) {
    try {
      const raw = await searchSaunaPlaces(s.areaCode, "사우나", s.name);
      if (raw.length > 0) {
        for (const it of raw) out.push(toSaunaPlace(it, region, sigunguId, out.length + 1));
        source = "tourapi";
      }
    } catch (e: any) {
      console.warn("[places] tourapi 실패", e?.message);
    }
  }

  // 추천지수 계산
  const places = out.map((p) => ({ ...p, rating: computeRating(p) }));

  // 3) 둘 다 없거나 0건 → 빈 배열 (프론트는 curated 사용)
  return NextResponse.json({ region, sigungu: sigunguId, source, count: places.length, places });
}
