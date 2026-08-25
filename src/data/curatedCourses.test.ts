import { describe, expect, it } from "vitest";
import { CourseSchema } from "../ai/course.schema";
import { generateCourse } from "../ai/engine";
import { curatedCourses, findCuratedCourse } from "./curatedCourses";
import { regions } from "./seed";
import { ALL_REGIONS, type PlannerInput } from "./schema";

const allPlaceIds = new Set(regions.flatMap((r) => r.places).map((p) => p.id));

const input = (region: PlannerInput["region"], days: number): PlannerInput => ({
  region,
  days,
  preferences: [],
  onsenFocus: false,
  includeLodging: false,
});

describe("손수 짠 코스", () => {
  it("모두 코스 스키마를 만족한다", () => {
    for (const [key, course] of Object.entries(curatedCourses)) {
      expect(() => CourseSchema.parse(course), key).not.toThrow();
    }
  });

  it("지역 키가 실제 지역이고, 코스의 region 과 일치한다", () => {
    for (const [key, course] of Object.entries(curatedCourses)) {
      const region = key.slice(0, key.lastIndexOf("-"));
      expect(ALL_REGIONS, key).toContain(region);
      expect(course!.region, key).toBe(region);
    }
  });

  it("키의 일수와 실제 day 수가 맞는다", () => {
    for (const [key, course] of Object.entries(curatedCourses)) {
      const days = Number(key.slice(key.lastIndexOf("-") + 1));
      expect(course!.days, key).toHaveLength(days);
      course!.days.forEach((day, index) =>
        expect(day.day, key).toBe(index + 1),
      );
    }
  });

  it("placeId 를 적었다면 실재하는 장소를 가리킨다", () => {
    // 오타 하나로 지도 링크와 상세 정보가 조용히 사라지는 것을 막는다.
    for (const [key, course] of Object.entries(curatedCourses)) {
      for (const day of course!.days) {
        for (const stop of day.stops) {
          if (stop.placeId)
            expect(allPlaceIds, `${key} → ${stop.placeId}`).toContain(
              stop.placeId,
            );
        }
      }
    }
  });

  it("모든 스톱에 시간과 추천 이유가 있다", () => {
    for (const [key, course] of Object.entries(curatedCourses)) {
      for (const day of course!.days) {
        expect(day.stops.length, key).toBeGreaterThan(2);
        for (const stop of day.stops) {
          expect(stop.time, key).toMatch(/^\d{2}:\d{2}$/);
          expect(stop.reason.length, `${key} ${stop.title}`).toBeGreaterThan(
            10,
          );
        }
      }
    }
  });

  it("하루 안에서 시간이 앞으로만 간다", () => {
    for (const [key, course] of Object.entries(curatedCourses)) {
      for (const day of course!.days) {
        const minutes = day.stops.map(
          (s) => Number(s.time.slice(0, 2)) * 60 + Number(s.time.slice(3)),
        );
        for (let i = 1; i < minutes.length; i++) {
          expect(minutes[i], `${key} day${day.day}`).toBeGreaterThan(
            minutes[i - 1]!,
          );
        }
      }
    }
  });
});

describe("엔진의 코스 선택", () => {
  it("손수 짠 코스가 있으면 그것을 쓰고 curated 로 표시한다", async () => {
    const result = await generateCourse(input("busan", 1));
    expect(result.curated).toBe(true);
    expect(result.summary).toBe(findCuratedCourse(input("busan", 1))!.summary);
  });

  it("없는 조합은 규칙 기반으로 만들고 curated 는 false 다", async () => {
    const result = await generateCourse(input("busan", 4));
    expect(result.curated).toBe(false);
    expect(result.days).toHaveLength(4);
  });

  it("어느 쪽이든 장소 목록을 함께 싣는다", async () => {
    for (const days of [1, 4]) {
      const result = await generateCourse(input("busan", days));
      expect(result.places?.length, `days=${days}`).toBeGreaterThan(0);
    }
  });
});
