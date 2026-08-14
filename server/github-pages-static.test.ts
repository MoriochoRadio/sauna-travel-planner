import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("GitHub Pages static edition", () => {
  const html = readFileSync(resolve(process.cwd(), "client/public/github-pages/index.html"), "utf8");

  it("includes the curated place catalogue and official information links", () => {
    expect(html).toContain("스파랜드 센텀시티");
    expect(html).toContain("덕구온천 리조트");
    expect(html).toContain("공식 정보");
  });

  it("keeps the existing hot-spring hero visual in the static edition", () => {
    expect(html).toContain("ongihaeng-hero.webp");
    expect(html).toContain("background-image");
  });

  it("keeps the itinerary in browser storage without requiring a backend", () => {
    expect(html).toContain("localStorage");
    expect(html).toContain("ongihaeng-static-plan");
    expect(html).toContain("일정에 담기");
  });

  it("clearly discloses full-stack capabilities excluded from the static edition", () => {
    expect(html).toContain("정적판 운영 범위");
    expect(html).toContain("로그인, 서버 저장, AI 맞춤 코스, 공유 링크, 관리자 기능은");
  });
});
