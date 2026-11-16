import { describe, expect, test } from "vitest";
import { ID_MAX, NOTE_MAX, PlannerInputSchema, Preference } from "./schema";

const ok = { region: "busan", days: 1 };

describe("PlannerInputSchema — 사용자 입력 상한", () => {
  test("정상 입력은 통과한다", () => {
    const r = PlannerInputSchema.safeParse({
      ...ok, sigungu: "busan-중구", preferences: [...Preference.options],
      note: "가".repeat(NOTE_MAX), anchorSaunaId: "kk-gyeongnam-gyeongnam-창원시 마산합포구-s-12",
    });
    expect(r.success).toBe(true);
  });

  test.each([
    ["note", { note: "가".repeat(NOTE_MAX + 1) }],
    ["sigungu", { sigungu: "x".repeat(ID_MAX + 1) }],
    ["anchorSaunaId", { anchorSaunaId: "x".repeat(ID_MAX + 1) }],
    ["preferences", { preferences: [...Preference.options, "quiet"] }],
  ])("%s 상한을 넘으면 거부한다", (field, extra) => {
    const r = PlannerInputSchema.safeParse({ ...ok, ...extra });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.path[0]).toBe(field);
  });
});
