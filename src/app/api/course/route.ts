import { NextRequest, NextResponse } from "next/server";
import { PlannerInputSchema } from "@/data/schema";
import { generateCourse } from "@/ai/engine";

export async function POST(req: NextRequest) {
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

  try {
    const course = await generateCourse(parsed.data);
    return NextResponse.json(course);
  } catch (e) {
    return NextResponse.json({ error: "generation_failed" }, { status: 500 });
  }
}
