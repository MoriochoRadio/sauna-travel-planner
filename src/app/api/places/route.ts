import { NextRequest, NextResponse } from "next/server";
import { findSigunguById } from "@/data/sigungu";
import { searchSaunaPlaces, toSaunaPlace } from "@/lib/tourapi";
import { clientIp, rateLimit } from "../rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/places?region=seoul&sigungu=seoul-jung
// → tourAPI 실시간 사우나/온천 검색 (키 없으면 빈 배열)
export async function GET(req: NextRequest) {
  if (!process.env.CI && !rateLimit(clientIp(req))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region") ?? "";
  const sigunguId = searchParams.get("sigungu") ?? "";
  const s = sigunguId ? findSigunguById(sigunguId) : undefined;
  if (!s || s.region !== region) {
    return NextResponse.json({ error: "invalid region/sigungu" }, { status: 400 });
  }

  try {
    const raw = await searchSaunaPlaces(s.areaCode, "사우나", s.name);
    const places = raw.map((it, i) => toSaunaPlace(it, region, sigunguId, i + 1));
    return NextResponse.json({ region, sigungu: sigunguId, count: places.length, places });
  } catch (e: any) {
    console.error("[places] tourAPI 실패", e?.message);
    return NextResponse.json({ region, sigungu: sigunguId, count: 0, places: [], error: "tourapi_error" }, { status: 200 });
  }
}
