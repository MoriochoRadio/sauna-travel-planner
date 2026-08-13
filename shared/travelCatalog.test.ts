import { describe, expect, it } from "vitest";
import { getPlace, travelPlaces } from "./travelCatalog";

describe("travel catalog", () => {
  it("keeps every curated place uniquely addressable and map-ready", () => {
    expect(new Set(travelPlaces.map(place => place.id)).size).toBe(travelPlaces.length);
    expect(travelPlaces.every(place => Number.isFinite(place.coordinates.lat) && Number.isFinite(place.coordinates.lng))).toBe(true);
  });

  it("links each place to a source-backed, non-diagnostic science note", () => {
    expect(travelPlaces.every(place => place.science.sourceUrl.startsWith("https://"))).toBe(true);
    expect(getPlace("spaland-centum-city")?.science.summary).toContain("보장");
  });

  it("keeps a visible verification source for every place", () => {
    expect(travelPlaces.every(place => place.verification.sourceUrl.startsWith("https://"))).toBe(true);
    expect(travelPlaces.filter(place => place.verification.status === "official").length).toBeGreaterThan(0);
  });
});
