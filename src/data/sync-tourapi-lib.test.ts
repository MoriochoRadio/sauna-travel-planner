import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import {
  REGIONS, FALLBACK_SIDO_CODES, acceptsCity, coordProblem, parseAnchors, resolveRegionQueries,
} from "../../scripts/sync-tourapi-lib.mjs";
import { ALL_REGIONS } from "./schema";
import { enrichedPlaces } from "./seed.enriched";

const anchors = parseAnchors(readFileSync(new URL("./sigungu.generated.ts", import.meta.url), "utf8"));
const sido = (o: Record<string, string>) => Object.entries(o).map(([name, code]) => ({ code, name }));
const region = (id: string) => REGIONS.find((r) => r.id === id)!;

describe("법정동 시도 코드 매핑", () => {
  test("앱의 18개 지역이 모두 정의돼 있다", () => {
    expect(REGIONS.map((r) => r.id).sort()).toEqual([...ALL_REGIONS].sort());
  });

  test("통합 이전 목록(매뉴얼 v4.4)이면 시도마다 고유 코드, 경주는 47/130", () => {
    const { queries, missing } = resolveRegionQueries(sido(FALLBACK_SIDO_CODES));
    expect(missing).toEqual([]);
    expect(queries.seoul.lDongRegnCd).toBe("11");
    expect(queries.gangwon.lDongRegnCd).toBe("51");
    expect(queries.jeonbuk.lDongRegnCd).toBe("52");
    expect(queries.gwangju.lDongRegnCd).toBe("29");
    expect(queries.jeonnam.lDongRegnCd).toBe("46");
    expect(queries.gyeongju).toMatchObject({ lDongRegnCd: "47", lDongSignguCd: "130" });
    expect(queries.gyeongbuk.lDongSignguCd).toBeUndefined();
  });

  test("전남광주통합특별시가 있으면 광주·전남 모두 그 코드 (옛 이름이 같이 남아 있어도 통합 코드 우선)", () => {
    const { queries } = resolveRegionQueries(sido({ ...FALLBACK_SIDO_CODES, 전남광주통합특별시: "99" }));
    expect(queries.gwangju.lDongRegnCd).toBe("99");
    expect(queries.jeonnam.lDongRegnCd).toBe("99");
  });

  test("옛 강원도·전라북도 이름만 있어도 찾는다, 후보가 하나도 없으면 missing", () => {
    const { queries, missing } = resolveRegionQueries(sido({ 강원도: "42", 전라북도: "45" }));
    expect(queries.gangwon.lDongRegnCd).toBe("42");
    expect(queries.jeonbuk.lDongRegnCd).toBe("45");
    expect(missing).toContain("seoul");
  });

  test("통합 시도 주소를 광주 5개 구와 전남 시군으로 나눈다", () => {
    expect(acceptsCity(region("gwangju"), "전남광주통합특별시 광산구 어등대로 1")).toBe(true);
    expect(acceptsCity(region("gwangju"), "전남광주통합특별시 목포시 해안로 1")).toBe(false);
    expect(acceptsCity(region("jeonnam"), "전남광주통합특별시 목포시 해안로 1")).toBe(true);
    expect(acceptsCity(region("jeonnam"), "전남광주통합특별시 서구 상무대로 1")).toBe(false);
    expect(acceptsCity(region("jeonnam"), "")).toBe(false); // 주소가 없으면 어느 쪽인지 모른다
    expect(acceptsCity(region("gwangju"), "광주광역시 북구 1")).toBe(true); // 통합 전 주소
    expect(acceptsCity(region("gyeongju"), "경상북도 경산시 중앙로 1")).toBe(false);
    expect(acceptsCity(region("seoul"), "")).toBe(true);
  });
});

describe("좌표 검사", () => {
  test("남중국해 기본값처럼 대한민국 밖이면 거부", () => {
    expect(coordProblem(19.69442748, 117.9925662504, "seoul", anchors)).toBe("대한민국 범위 밖");
    expect(coordProblem(0, 0, "jeju", anchors)).toBe("대한민국 범위 밖");
    expect(coordProblem(Number.NaN, 127, "seoul", anchors)).toBe("좌표가 숫자가 아님");
  });

  test("한국 안이지만 지역에서 멀면 거부 (서울 장소에 부산 좌표, 경주 장소에 상주 좌표)", () => {
    expect(coordProblem(35.16, 129.16, "seoul", anchors)).toMatch(/지역 시군구에서 \d+km \(허용 40km\)/);
    expect(coordProblem(36.40, 128.15, "gyeongju", anchors)).toMatch(/허용 40km/);
  });

  test("먼 섬도 같은 지역이면 통과 (독도, 가거도, 백령도, 연평도, 추자도, 마라도)", () => {
    expect(coordProblem(37.2426, 131.8669, "gyeongbuk", anchors)).toBeNull();
    expect(coordProblem(34.073, 125.118, "jeonnam", anchors)).toBeNull();
    expect(coordProblem(37.9597, 124.6655, "incheon", anchors)).toBeNull();
    expect(coordProblem(37.6656, 125.6997, "incheon", anchors)).toBeNull();
    expect(coordProblem(33.95, 126.3, "jeju", anchors)).toBeNull();
    expect(coordProblem(33.118, 126.267, "jeju", anchors)).toBeNull();
  });

  test("좌표가 없으면 검사하지 않는다", () => {
    expect(coordProblem(undefined, undefined, "seoul", anchors)).toBeNull();
  });

  test("지금 저장된 tourAPI 보강 장소는 모두 좌표 검사를 통과한다", () => {
    const bad: string[] = [];
    for (const [id, list] of Object.entries(enrichedPlaces)) {
      for (const p of list) {
        const problem = coordProblem(p.lat, p.lng, id, anchors);
        if (problem) bad.push(`${id} ${p.name} ${problem}`);
      }
    }
    expect(bad).toEqual([]);
  });
});
