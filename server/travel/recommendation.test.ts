import { describe, expect, it } from "vitest";
import { createFallbackCourse, extractLLMText } from "./recommendation";
import { nextStopPosition } from "../db.travel";

describe("createFallbackCourse", () => {
  it("returns a usable three-part course even without an AI response", () => {
    const course = createFallbackCourse({ region: "부산", purpose: "date", mood: "세련된", budget: "signature", companion: "연인" });
    expect(course.generatedWith).toBe("curated");
    expect(course.stops).toHaveLength(3);
    expect(course.stops.map(stop => stop.period)).toEqual(["오전", "오후", "저녁"]);
    expect(course.stops.every(stop => stop.placeId.length > 0)).toBe(true);
  });

  it("prefers a matching regional place when the requested region is available", () => {
    const course = createFallbackCourse({ region: "강원", purpose: "slow-travel", mood: "산속", budget: "balanced", companion: "혼자" });
    expect(course.stops.some(stop => stop.placeId === "osack-greenyard")).toBe(true);
  });

  it("assigns the next plan position from the current maximum rather than row count", () => {
    expect(nextStopPosition([])).toBe(0);
    expect(nextStopPosition([0, 1, 4])).toBe(5);
  });

  it("reads structured text whether the model returns a string or content parts", () => {
    expect(extractLLMText('{"title":"문자열"}')).toBe('{"title":"문자열"}');
    expect(extractLLMText([{ type: "text", text: '{"title":"배열"}' }])).toBe('{"title":"배열"}');
  });
});
