import { NextRequest, NextResponse } from "next/server";
import { PlannerInputSchema } from "@/data/schema";
import { generateCourse } from "@/ai/engine";
import { rateLimit, clientIp } from "../rate-limit";
import { readJsonWithLimit } from "../read-json";

export async function POST(req: NextRequest) {
  // CI/테스트 환경에서는 rate-limit 비활성화 (E2E 다중 요청 차단 방지)
  if (!process.env.CI && !rateLimit(clientIp(req))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  // 본문 크기를 먼저 막는다 — 큰 배열이 zod 검증까지 가지 않게 (read-json.ts 주석)
  const read = await readJsonWithLimit(req);
  if (!read.ok) return NextResponse.json({ error: read.error }, { status: read.status });

  const parsed = PlannerInputSchema.safeParse(read.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.path[0];
    const code =
      first === "region"
        ? "invalid_region"
        : first === "days"
          ? "invalid_days"
          : first === "preferences"
            ? "invalid_preference"
            : "invalid_input";
    return NextResponse.json({ error: code }, { status: 400 });
  }

  // LLM 호출을 없애면서 하드 타임아웃과 이중 폴백 분기도 함께 걷어냈다.
  // 코스는 손수 짠 것 아니면 규칙 기반이며, 둘 다 즉시 계산된다.
  try {
    const course = await generateCourse(parsed.data);
    return NextResponse.json(course);
  } catch {
    return NextResponse.json({ error: "generation_failed" }, { status: 500 });
  }
}
