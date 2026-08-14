import { describe, expect, it } from "vitest";
import { decodeInputFromQuery, encodeInputToQuery, shareUrl } from "./share";
import type { PlannerInput } from "./schema";

const input: PlannerInput = {
  region: "busan",
  sigungu: "busan-중구",       // 시군구 id에 한글이 들어간다
  days: 2,
  preferences: ["quiet", "foodie"],
  note: "부모님과 함께 & 조용한 곳",
  onsenFocus: true,
  includeLodging: false,
};

describe("공유 URL", () => {
  it("한글 시군구 id를 인코딩한다", () => {
    // 손으로 조립하면 인코딩이 빠져 공유 링크가 깨진다.
    const qs = encodeInputToQuery(input);
    expect(qs).not.toContain("중구");
    expect(qs).toContain("busan-%EC%A4%91%EA%B5%AC");
  });

  it("인코딩 → 디코딩 왕복이 원본과 같다", () => {
    expect(decodeInputFromQuery(encodeInputToQuery(input))).toEqual(input);
  });

  it("&·# 같은 구분자가 든 메모도 깨지지 않는다", () => {
    const tricky = { ...input, note: "a&b#c=d" };
    expect(decodeInputFromQuery(encodeInputToQuery(tricky))?.note).toBe("a&b#c=d");
  });

  it("shareUrl은 절대 주소를 만든다", () => {
    const url = shareUrl("https://example.com", input);
    expect(url.startsWith("https://example.com/?")).toBe(true);
    expect(decodeInputFromQuery(new URL(url).search.slice(1))).toEqual(input);
  });
});
