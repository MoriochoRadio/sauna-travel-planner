import { describe, expect, it } from "vitest";
import { getPlace } from "./travelCatalog";
import { getTravelGuide, travelGuides } from "./travelGuides";

describe("travel guides", () => {
  it("links each guide to an existing curated place", () => {
    expect(travelGuides.every(guide => guide.placeIds.every(placeId => getPlace(placeId)))).toBe(true);
  });

  it("keeps guide slugs uniquely addressable and includes pre-travel essentials", () => {
    expect(new Set(travelGuides.map(guide => guide.slug)).size).toBe(travelGuides.length);
    expect(getTravelGuide("first-onsen-checklist")?.essentials.length).toBeGreaterThan(2);
  });
});
