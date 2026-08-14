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

  it("shows explicit verification status and check dates for every curated place", () => {
    expect([...html.matchAll(/status:'(official|curation-draft)',verifiedAt:'\d{4}-\d{2}-\d{2}'/g)]).toHaveLength(6);
    expect([...html.matchAll(/reviewBy:'\d{4}-\d{2}-\d{2}'/g)]).toHaveLength(6);
    expect([...html.matchAll(/sourceLabel:'[^']+',operatingNote:'[^']+'/g)]).toHaveLength(6);
    expect(html).toContain("공식 정보 확인");
    expect(html).toContain("공식 정보 보강 중");
    expect(html).toContain("방문 전");
    expect(html).toContain("verification");
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

  it("provides an offline-printable itinerary summary with notes and visit checks", () => {
    expect(html).toContain("여행 요약 인쇄");
    expect(html).toContain("printPlanSummary");
    expect(html).toContain("방문 전 확인");
    expect(html).toContain("window.open");
    expect(html).toContain("escapeHtml");
  });

  it("filters places and persists an itinerary using only browser APIs", () => {
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
    expect(scripts).toHaveLength(2);

    type MockElement = { innerHTML: string; textContent: string; value: string; hidden: boolean; scrollIntoView: () => void; focus: () => void; select: () => void };
    const elements = new Map<string, MockElement>();
    for (const selector of ["#filters", "#placesGrid", "#planList", "#planTotal", "#planner", "#planImportText", "#planImportPanel", "#planBackupStatus"]) {
      elements.set(selector, { innerHTML: "", textContent: "", value: "", hidden: false, scrollIntoView: () => undefined, focus: () => undefined, select: () => undefined });
    }
    const storage = new Map<string, string>([["ongihaeng-static-plan", "{malformed"]]);
    let printedHtml = "";
    let printCalled = false;
    const sandbox: Record<string, unknown> = {
      document: { querySelector: (selector: string) => elements.get(selector) },
      localStorage: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) },
      open: () => ({ document: { write: (html: string) => { printedHtml += html; }, close: () => undefined }, focus: () => undefined, print: () => { printCalled = true; } }),
    };
    sandbox.window = sandbox;

    for (const script of scripts) vm.runInNewContext(script, sandbox);
    expect(elements.get("#placesGrid")?.innerHTML).toContain("스파랜드 센텀시티");
    expect(elements.get("#placesGrid")?.innerHTML).toContain("아쿠아필드 고양");
    expect(elements.get("#placesGrid")?.innerHTML).toContain("신세계백화점 스파랜드 공식 안내");
    expect(elements.get("#placesGrid")?.innerHTML).toContain("운영 시간·요금·기본 이용 시간을 공식 안내에서 확인하세요");
    expect(elements.get("#placesGrid")?.innerHTML).toContain("다음 검토</strong> 2026.11.13 이전");
    expect(elements.get("#planList")?.innerHTML).toContain("아직 담은 장소가 없어요");

    (sandbox.setRegion as (region: string) => void)("부산");
    expect(elements.get("#placesGrid")?.innerHTML).toContain("스파랜드 센텀시티");
    expect(elements.get("#placesGrid")?.innerHTML).not.toContain("아쿠아필드 고양");

    (sandbox.addPlan as (placeId: string) => void)("spaland");
    expect(elements.get("#planList")?.innerHTML).toContain("스파랜드 센텀시티");
    expect(storage.get("ongihaeng-static-plan")).toBe('[{"id":"spaland","note":""}]');

    expect((sandbox.exportPlan as () => string)()).toBe('{"version":2,"items":[{"id":"spaland","note":""}]}');
    elements.get("#planImportText")!.value = '{"version":1,"placeIds":["deokgu","missing-place","deokgu"]}';
    (sandbox.importPlan as () => void)();
    expect(elements.get("#planList")?.innerHTML).toContain("덕구온천 리조트");
    expect(elements.get("#planList")?.innerHTML).not.toContain("missing-place");
    expect(storage.get("ongihaeng-static-plan")).toBe('[{"id":"deokgu","note":""}]');

    elements.get("#planImportText")!.value = '{"version":2,"items":[{"id":"deokgu","note":"숙박 후 아침 입욕"},{"id":"spaland","note":"오후 이용"},{"id":"missing-place","note":"제외"}]}';
    (sandbox.importPlan as () => void)();
    (sandbox.movePlanItem as (index: number, direction: number) => void)(1, -1);
    (sandbox.updatePlanNote as (placeId: string, note: string) => void)("spaland", "저녁 식사 전 이용");
    expect((sandbox.exportPlan as () => string)()).toBe('{"version":2,"items":[{"id":"spaland","note":"저녁 식사 전 이용"},{"id":"deokgu","note":"숙박 후 아침 입욕"}]}');
    expect(storage.get("ongihaeng-static-plan")).toContain('"note":"저녁 식사 전 이용"');

    (sandbox.printPlanSummary as () => void)();
    expect(printedHtml).toContain("온기행 · 나의 여행 요약");
    expect(printedHtml).toContain("저녁 식사 전 이용");
    expect(printedHtml).toContain("방문 전 확인");
    expect(printedHtml).toContain("신세계백화점 스파랜드 공식 안내");
    expect(printCalled).toBe(true);
    expect(elements.get("#planBackupStatus")?.textContent).toContain("PDF로 저장");

    elements.get("#planImportText")!.value = JSON.stringify({ version: 2, items: [{ id: "spaland", note: "가".repeat(241) }] });
    (sandbox.importPlan as () => void)();
    expect(JSON.parse(storage.get("ongihaeng-static-plan") ?? "[]")[0].note).toHaveLength(240);

    elements.get("#planImportText")!.value = "{broken";
    (sandbox.importPlan as () => void)();
    expect(elements.get("#planBackupStatus")?.textContent).toContain("복원 코드를 확인");
  });

  it("clearly discloses full-stack capabilities excluded from the static edition", () => {
    expect(html).toContain("정적판 운영 범위");
    expect(html).toContain("로그인, 서버 저장, AI 맞춤 코스, 공유 링크, 관리자 기능은");
  });
});
