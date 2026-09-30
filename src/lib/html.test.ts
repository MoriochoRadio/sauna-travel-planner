import { describe, expect, test } from "vitest";
import { escapeHtml } from "./html";

describe("escapeHtml", () => {
  test("장소명에 섞인 마크업을 글자로 바꾼다", () => {
    expect(escapeHtml(`<img src=x onerror="alert(1)">`)).toBe("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(escapeHtml("A&B 'spa'")).toBe("A&amp;B &#39;spa&#39;");
  });

  test("평범한 한글 이름은 그대로 둔다", () => {
    expect(escapeHtml("허심청 (동래온천)")).toBe("허심청 (동래온천)");
  });
});
