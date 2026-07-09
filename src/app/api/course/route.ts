import { NextRequest, NextResponse } from "next/server";
import { PlannerInputSchema } from "@/data/schema";
import { generateCourse } from "@/ai/engine";
import { rateLimit, clientIp } from "../rate-limit";

// 전체 응답 하드 타임아웃 (무료 모델 레이트리밋 시 폴백으로 신속 전환)
const HARD_TIMEOUT_MS = 10000;

export async function POST(req: NextRequest) {
  if (!rateLimit(clientIp(req))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = PlannerInputSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.path[0];
    const code =
      first === "region" ? "invalid_region"
      : first === "days" ? "invalid_days"
      : first === "preferences" ? "invalid_preference"
      : "invalid_input";
    return NextResponse.json({ error: code }, { status: 400 });
  }

  // 키가 없거나 CI 환경(rate-limit 불확실)에서는 LLM 호출을 건너뛰고
  // 즉시 폴백 코스로 응답 — 10초 타임아웃 낭비 방지 + E2E 결정론적 수행
  const useLLM = !!process.env.OPENROUTER_API_KEY && !process.env.CI;
  if (!useLLM) {
    try {
      const { fallbackCourse } = await import("@/ai/fallback");
      const { getRegion } = await import("@/data/seed");
      const region = getRegion(parsed.data.region);
      if (!region) return NextResponse.json({ error: "unknown_region" }, { status: 400 });
      const fb = fallbackCourse(parsed.data, region);
      return NextResponse.json({ ...fb, usedFallback: true });
    } catch {
      return NextResponse.json({ error: "generation_failed" }, { status: 500 });
    }
  }

  // 타임아웃 시 폴백 코스로 즉시 응답
  const timeout = new Promise<null>((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), HARD_TIMEOUT_MS)
  );

  try {
    const course = await Promise.race([generateCourse(parsed.data), timeout]);
    if (!course) throw new Error("empty");
    return NextResponse.json(course);
  } catch {
    try {
      const { fallbackCourse } = await import("@/ai/fallback");
      const { getRegion } = await import("@/data/seed");
      const region = getRegion(parsed.data.region);
      if (!region) return NextResponse.json({ error: "unknown_region" }, { status: 400 });
      const fb = fallbackCourse(parsed.data, region);
      return NextResponse.json({ ...fb, usedFallback: true });
    } catch {
      return NextResponse.json({ error: "generation_failed" }, { status: 500 });
    }
  }
}
