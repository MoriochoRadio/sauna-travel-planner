import { fallbackCourse } from "./fallback";
import { getRegion } from "../data/seed";
import type { PlannerInput } from "../data/schema";
import { CourseSchema } from "./course.schema";

const baseInput: PlannerInput = { region: "gangwon", days: 2, preferences: [], note: undefined };

describe("fallback 코스 생성", () => {
  test("기간=2일 입력에 2일 코스를 만든다", () => {
    const region = getRegion("gangwon")!;
    const course = fallbackCourse(baseInput, region);
    expect(course.days.length).toBe(2);
    expect(course.days[0].day).toBe(1);
    expect(course.days[1].day).toBe(2);
  });

  test("각 Day는 4개 Stop(사우나/점심/볼거리/저녁)을 가진다", () => {
    const region = getRegion("gangwon")!;
    const course = fallbackCourse(baseInput, region);
    course.days.forEach((d) => {
      expect(d.stops.length).toBe(4);
      expect(d.stops[0].time).toBe("10:00"); // 사우나
      expect(d.stops[2].time).toBe("15:00"); // 볼거리 완충
    });
  });

  test("예상 비용은 양수이다", () => {
    const region = getRegion("gangwon")!;
    const course = fallbackCourse(baseInput, region);
    expect(course.estCostKrw).toBeGreaterThan(0);
  });

  test("생성 결과가 CourseSchema를 통과한다", () => {
    const region = getRegion("gangwon")!;
    const course = fallbackCourse(baseInput, region);
    expect(() => CourseSchema.parse(course)).not.toThrow();
  });

  test("premium 취향 시 high 가격 장소가 우선 선택된다", () => {
    const region = getRegion("gangwon")!;
    const course = fallbackCourse({ ...baseInput, preferences: ["premium"] }, region);
    const saunaStop = course.days[0].stops[0];
    const place = region.places.find((p) => p.id === saunaStop.placeId);
    expect(place?.priceLevel).toBe("high");
  });
});
