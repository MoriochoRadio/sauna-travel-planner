import type { PlannerInput, RegionData } from "../data/schema";
import { CourseSchema, type Course } from "./course.schema";
import { systemPrompt, userPrompt } from "./prompt";
import { safeParseContent } from "./parse";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// 무료 모델 폴백 체인 (비용 0, OpenRouter :free)
// 우선순위: 실제 동작 확인된 모델 → 품질 좋은 모델 → 경량 모델
const MODELS = [
  "openai/gpt-oss-20b:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "meta-llama/llama-3.2-3b-instruct:free",
];

const TIMEOUT_MS = 20000;
const MAX_BACKOFF_RETRY = 2; // 429 시 모델당 1회 backoff 재시도

export async function generateWithLLM(input: PlannerInput, region: RegionData): Promise<Course | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const sys = systemPrompt();
  const usr = userPrompt(input, region);

  for (const model of MODELS) {
    let course = await tryModel(apiKey, model, sys, usr);
    if (course) return course;

    // 429 rate-limit일 수 있으니 잠깐 대기 후 1회 재시도
    for (let i = 0; i < MAX_BACKOFF_RETRY; i++) {
      await sleep(3000 * (i + 1));
      course = await tryModel(apiKey, model, sys, usr);
      if (course) return course;
    }
  }
  return null;
}

async function tryModel(apiKey: string, model: string, sys: string, usr: string): Promise<Course | null> {
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
        max_tokens: 1500,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.error(`[LLM] ${model} HTTP ${res.status}`);
      return null; // 호출자가 다음 모델로
    }
    const json = (await res.json()) as any;
    const content: string = json?.choices?.[0]?.message?.content ?? "";
    const parsed = safeParseContent(content);
    if (!parsed) return null;
    const result = CourseSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch (e) {
    console.error(`[LLM] ${model} error`, e);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
