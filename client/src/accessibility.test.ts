import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "../..");
const read = (relativePath: string) => readFileSync(resolve(projectRoot, relativePath), "utf8");

describe("accessibility guardrails", () => {
  it("keeps visible keyboard focus and labelled interactive controls in key screens", () => {
    expect(read("client/src/index.css")).toContain(":focus-visible");
    expect(read("client/src/components/PlaceCard.tsx")).toContain("aria-label");
    expect(read("client/src/components/MobileBottomNav.tsx")).toContain("aria-label=\"모바일 주요 메뉴\"");
  });

  it("exposes user-facing error announcements for data and recommendation failures", () => {
    expect(read("client/src/pages/Home.tsx")).toContain('role="alert"');
    expect(read("client/src/components/RecommendationStudio.tsx")).toContain('aria-live="polite"');
    expect(read("client/src/pages/PlaceDetail.tsx")).toContain('role={isError ? "alert" : undefined}');
  });
});
