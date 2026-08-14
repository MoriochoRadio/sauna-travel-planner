import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

describe("GitHub Pages static edition", () => {
  const html = readFileSync(resolve(process.cwd(), "client/public/github-pages/index.html"), "utf8");

  it("includes the curated place catalogue and official information links", () => {
    expect(html).toContain("스파랜드 센텀시티");
    expect(html).toContain("덕구온천 리조트");
    expect(html).toContain("공식 정보");
  });

  it("keeps six HTTPS official links without runtime backend dependencies", () => {
    const sourceUrls = [...html.matchAll(/source:'(https:[^']+)'/g)].map((match) => match[1]);
    expect(sourceUrls).toHaveLength(6);
    expect(sourceUrls.every((url) => url.startsWith("https://"))).toBe(true);
    expect(html).not.toMatch(/\/(api|manus-storage)\//);
    expect(html).not.toContain("localhost");
    expect(html).not.toContain("trpc");
  });

  it("keeps the existing hot-spring hero visual in the static edition", () => {
    expect(html).toContain("ongihaeng-hero.webp");
    expect(html).toContain("background-image");
    expect(html).toContain("radial-gradient");
  });

  it("keeps the itinerary in browser storage without requiring a backend", () => {
    expect(html).toContain("localStorage");
    expect(html).toContain("ongihaeng-static-plan");
    expect(html).toContain("일정에 담기");
  });

  it("filters places and persists an itinerary using only browser APIs", () => {
    const script = html.match(/<script>([\s\S]+)<\/script>/)?.[1];
    expect(script).toBeDefined();

    const elements = new Map<string, { innerHTML: string; textContent: string; scrollIntoView: () => void }>();
    for (const selector of ["#filters", "#placesGrid", "#planList", "#planTotal", "#planner"]) {
      elements.set(selector, { innerHTML: "", textContent: "", scrollIntoView: () => undefined });
    }
    const storage = new Map<string, string>([["ongihaeng-static-plan", "{malformed"]]);
    const sandbox: Record<string, unknown> = {
      document: { querySelector: (selector: string) => elements.get(selector) },
      localStorage: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) },
    };
    sandbox.window = sandbox;

    vm.runInNewContext(script!, sandbox);
    expect(elements.get("#placesGrid")?.innerHTML).toContain("스파랜드 센텀시티");
    expect(elements.get("#placesGrid")?.innerHTML).toContain("아쿠아필드 고양");
    expect(elements.get("#planList")?.innerHTML).toContain("아직 담은 장소가 없어요");

    (sandbox.setRegion as (region: string) => void)("부산");
    expect(elements.get("#placesGrid")?.innerHTML).toContain("스파랜드 센텀시티");
    expect(elements.get("#placesGrid")?.innerHTML).not.toContain("아쿠아필드 고양");

    (sandbox.addPlan as (placeId: string) => void)("spaland");
    expect(elements.get("#planList")?.innerHTML).toContain("스파랜드 센텀시티");
    expect(storage.get("ongihaeng-static-plan")).toBe('["spaland"]');
  });

  it("clearly discloses full-stack capabilities excluded from the static edition", () => {
    expect(html).toContain("정적판 운영 범위");
    expect(html).toContain("로그인, 서버 저장, AI 맞춤 코스, 공유 링크, 관리자 기능은");
  });
});
