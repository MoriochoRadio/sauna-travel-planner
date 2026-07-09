import type { PlannerInput, RegionData } from "../data/schema";
import { CourseSchema, type Course } from "./course.schema";
import { systemPrompt, userPrompt } from "./prompt";
import { safeParseContent } from "./parse";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// 무료 모델 폴백 체인 (비용 0, OpenRouter :free)
const MODELS = [
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "qwen/qwen2.5-72b-instruct:free",
];

const TIMEOUT_MS = 15000;
const MAX_PARSE_RETRY = 2;

export async function generateWithLLM(input: PlannerInput, region: RegionData): Promise<Course | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const sys = systemPrompt();
  const usr = userPrompt(input, region);

  for (const model of MODELS) {
    const course = await tryModel(apiKey, model, sys, usr);
    if (course) return course;
  }
  return null;
}

async function tryModel(apiKey: string, model: string, sys: string, usr: string): Promise<Course | null> {
  for (let attempt = 0; attempt < MAX_PARSE_RETRY; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: sys },
            { role: "user", content: usr },
          ],
          temperature: 0.7,
        }),
        signal: controller.signal,
      });
      if (!res.ok) continue; // 다음 모델로
      const json = (await res.json()) as any;
      const content: string = json?.choices?.[0]?.message?.content ?? "";
      const parsed = safeParseContent(content);
      if (!parsed) continue;
      const result = CourseSchema.safeParse(parsed);
      if (result.success) return result.data;
    } catch {
      // 타임아웃/네트워크 → 다음 모델
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}
