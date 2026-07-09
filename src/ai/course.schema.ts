import { z } from "zod";

// ── 코스 출력 스키마 (LLM 응답 검증용) ───────────────────────
export const CourseStopSchema = z.object({
  time: z.string(),                  // "10:00"
  placeId: z.string().optional(),    // seed id 참조(환각 억제)
  title: z.string(),                 // 장소명 또는 노드 명칭
  reason: z.string(),                // 추천 이유
  tip: z.string().optional(),        // 이동/준비/수분 팁
});
export type CourseStop = z.infer<typeof CourseStopSchema>;

export const DaySchema = z.object({
  day: z.number(),
  theme: z.string(),
  stops: z.array(CourseStopSchema),
});
export type Day = z.infer<typeof DaySchema>;

export const CourseSchema = z.object({
  region: z.string(),
  days: z.array(DaySchema),
  estCostKrw: z.number(),
  summary: z.string(),
});
export type Course = z.infer<typeof CourseSchema>;

// usedFallback은 엔진이 주입 (응답 외 메타)
export type CourseResult = Course & { usedFallback: boolean };
