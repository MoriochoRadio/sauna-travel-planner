import { describe, expect, it } from "vitest";
import { getDefaultReviewBy, getReviewPriority } from "./db.admin";

describe("admin review priority", () => {
  const now = new Date("2026-08-14T00:00:00.000Z").getTime();

  it("prioritizes overdue, due-soon, explicit review, and unplanned records before scheduled work", () => {
    expect(getReviewPriority("verified", new Date("2026-08-12T00:00:00.000Z"), now)).toEqual({ reviewPriority: "overdue", reviewDueInDays: -2 });
    expect(getReviewPriority("verified", new Date("2026-08-21T00:00:00.000Z"), now)).toEqual({ reviewPriority: "due-soon", reviewDueInDays: 7 });
    expect(getReviewPriority("needs-review", null, now)).toEqual({ reviewPriority: "needs-review", reviewDueInDays: null });
    expect(getReviewPriority("draft", null, now)).toEqual({ reviewPriority: "unplanned", reviewDueInDays: null });
    expect(getReviewPriority("verified", new Date("2026-09-20T00:00:00.000Z"), now)).toEqual({ reviewPriority: "scheduled", reviewDueInDays: 37 });
  });

  it("derives an initial 90-day or 30-day review date from the curated verification state", () => {
    expect(getDefaultReviewBy("2026-08-13", "official").toISOString()).toBe("2026-11-11T00:00:00.000Z");
    expect(getDefaultReviewBy("2026-08-13", "curation-draft").toISOString()).toBe("2026-09-12T00:00:00.000Z");
  });
});
