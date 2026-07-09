import { vi, describe, expect, test, beforeEach, afterEach } from "vitest";
import { generateCourse } from "./engine";
import { generateWithLLM } from "./generate";
import { getRegion } from "../data/seed";
import type { PlannerInput } from "../data/schema";

function mockFetch(status: number, body: unknown) {
  vi.stubGlobal("fetch", vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })));
}

describe("엔진 오케스트레이션", () => {
  const input: PlannerInput = { region: "gangwon", days: 2, preferences: [], note: undefined, onsenFocus: false, includeLodging: false };

  test("존재하지 않는 region은 예외를 던진다", async () => {
    await expect(generateCourse({ ...input, region: "mars" as any })).rejects.toThrow();
  });

  test("LLM이 null 반환(키 없음) 시 폴백 코스를 돌려준다", async () => {
    const course = await generateCourse(input);
    expect(course.usedFallback).toBe(true);
    expect(course.days.length).toBe(2);
  });
});

describe("generateWithLLM 모델 체인", () => {
  const region = getRegion("gangwon")!;
  const input: PlannerInput = { region: "gangwon", days: 1, preferences: [], note: undefined, onsenFocus: false, includeLodging: false };

  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = "test-key";
  });
  afterEach(() => {
    delete process.env.OPENROUTER_API_KEY;
    vi.unstubAllGlobals();
  });

  test("모든 모델이 429면 null을 반환한다 (폴백 유도)", async () => {
    mockFetch(429, {});
    const r = await generateWithLLM(input, region);
    expect(r).toBeNull();
  });

  test("첫 모델이 401이면 다음 모델로 체인된다", async () => {
    let call = 0;
    vi.stubGlobal("fetch", vi.fn(async () => {
      call++;
      if (call === 1) return { ok: false, status: 401, json: async () => ({}) };
      return {
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify({
            region: "강원", days: [{ day: 1, theme: "t", stops: [{ time: "10:00", title: "평창 용평 온천", reason: "r", tip: "t" }] }],
            estCostKrw: 100000, summary: "s",
          }) } }],
        }),
      };
    }));
    const r = await generateWithLLM(input, region);
    expect(r).not.toBeNull();
    expect(r!.region).toBe("강원");
    expect(call).toBe(2);
  });

  test("응답이 코드펜스로 감싸져 있어도 파싱된다", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content:
          "```json\n" + JSON.stringify({
            region: "강원", days: [{ day: 1, theme: "t", stops: [{ time: "10:00", title: "춘천 온천 리조트", reason: "r", tip: "t" }] }],
            estCostKrw: 90000, summary: "s",
          }) + "\n```" } }],
      }),
    })));
    const r = await generateWithLLM(input, region);
    expect(r).not.toBeNull();
    expect(r!.days[0].stops[0].title).toBe("춘천 온천 리조트");
  });
});
