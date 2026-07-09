import { RegionSchema } from "./schema";
import { regions } from "./seed";

describe("seed 데이터 검증", () => {
  test("모든 region이 스키마를 따른다", () => {
    regions.forEach((r) => {
      expect(() => RegionSchema.parse(r)).not.toThrow();
    });
  });

  test("각 region은 사우나계≥3, 맛집≥3, 볼거리≥2", () => {
    regions.forEach((r) => {
      const by = (t: string) => r.places.filter((p) => p.type === t).length;
      const saunaLike = by("sauna") + by("jjimjilbang") + by("spa");
      expect(saunaLike).toBeGreaterThanOrEqual(3);
      expect(by("restaurant")).toBeGreaterThanOrEqual(3);
      expect(by("attraction")).toBeGreaterThanOrEqual(2);
    });
  });

  test("장소 id는 region 내 유일하다", () => {
    regions.forEach((r) => {
      const ids = r.places.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  test("모든 장소는 name/summary/highlights(≥1)를 가진다", () => {
    regions.forEach((r) => {
      r.places.forEach((p) => {
        expect(p.name.length).toBeGreaterThan(0);
        expect(p.summary.length).toBeGreaterThan(0);
        expect(p.highlights.length).toBeGreaterThanOrEqual(1);
      });
    });
  });
});
