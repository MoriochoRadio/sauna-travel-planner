import type { PlannerInput, RegionData } from "../data/schema";
import { CourseSchema, type Course } from "./course.schema";
import { systemPrompt, userPrompt, courseJsonSchema } from "./prompt";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "nousresearch/hermes-3-llama-3.1-405b:free";
const TIMEOUT_MS = 12000;

export async function generateWithLLM(input: PlannerInput, region: RegionData): Promise<Course | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const body = {
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt() },
      { role: "user", content: userPrompt(input, region) },
    ],
    response_format: courseJsonSchema,
    temperature: 0.7,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) return null;

    const json = (await res.json()) as any;
    const content: string = json?.choices?.[0]?.message?.content ?? "";
    // content가 순수 JSON이 아닐 수 있으므로 파싱 시도
    const parsed = safeParseContent(content);
    if (!parsed) return null;
    const result = CourseSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function safeParseContent(content: string): unknown | null {
  try {
    return JSON.parse(content);
  } catch {
    // 코드펜스 ```json ... ``` 제거 후 재시도
    const m = content.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]);
    } catch {
      return null;
    }
  }
}
