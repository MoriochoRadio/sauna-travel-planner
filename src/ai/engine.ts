import type { PlannerInput } from "../data/schema";
import { getRegion } from "../data/seed";
import { CourseSchema, type CourseResult } from "./course.schema";
import { generateWithLLM } from "./generate";
import { fallbackCourse } from "./fallback";

// 엔진 오케스트레이션: LLM 우선, 실패 시 폴백
export async function generateCourse(input: PlannerInput): Promise<CourseResult> {
  const region = getRegion(input.region);
  if (!region) {
    throw new Error(`unknown region: ${input.region}`);
  }

  const llm = await generateWithLLM(input, region);
  if (llm) {
    const validated = CourseSchema.parse(llm);
    return { ...validated, usedFallback: false };
  }

  const fb = fallbackCourse(input, region);
  return { ...fb, usedFallback: true };
}
