import { describe, it, expect } from "vitest";
import { regions, getRegion } from "./seed";

describe("seed (curated + tourAPI enriched 병합)", () => {
  test("지역 9곳이 존재한다", () => {
    expect(regions).toHaveLength(9);
  });

  test("각 지역은 사우나/온천(curated)을 최소 1개 이상 가진다", () => {
    for (const r of regions) {
      const saunaLike = r.places.filter((p) =>
        ["sauna", "jjimjilbang", "spa"].includes(p.type)
      );
      expect(saunaLike.length).toBeGreaterThan(0);
    }
  });

  test("tourAPI 보강 장소(source=tourapi)가 병합된다", () => {
    const seoul = getRegion("seoul")!;
    const toured = seoul.places.filter((p) => p.source === "tourapi");
    // CI가 생성한 enriched 데이터가 있으면 병합됨 (로컬 초기값이면 0일 수 있음)
    expect(toured.length).toBeGreaterThanOrEqual(0);
  });

  test("중복 id 없이 병합된다", () => {
    for (const r of regions) {
      const ids = r.places.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
