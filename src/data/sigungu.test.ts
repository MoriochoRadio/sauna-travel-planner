import { describe, expect, test } from "vitest";
import { findSigungu, findSigunguById, getSigungus } from "./sigungu";
import { regions, getRegion } from "./seed";
import { fallbackCourse } from "../ai/fallback";

describe("findSigungu — 시도명까지 맞춰 시군구 id를 찾는다", () => {
  test("같은 이름의 구가 여러 광역시에 있어도 시도를 따른다", () => {
    expect(findSigungu("대구광역시 중구")).toBe("daegu-중구");
    expect(findSigungu("대구 중구")).toBe("daegu-중구");
    expect(findSigungu("서울 중구")).toBe("seoul-중구");
    expect(findSigungu("대전광역시 서구")).toBe("daejeon-서구");
    expect(findSigungu("울산 남구")).toBe("ulsan-남구");
  });

  test("이름 일부가 겹치는 구와 헷갈리지 않는다 (강서구 ≠ 서구)", () => {
    expect(findSigungu("부산광역시 강서구")).toBe("busan-강서구");
    expect(findSigungu("부산광역시 동구")).toBe("busan-동구");
  });

  test("정식 시도명(특별시·광역시·특별자치시·특별자치도·도)과 약칭을 같게 본다", () => {
    expect(findSigungu("서울특별시 강남구")).toBe("seoul-강남구");
    expect(findSigungu("강원특별자치도 고성군")).toBe("gangwon-고성군");
    expect(findSigungu("경남 고성군")).toBe("gyeongnam-고성군");
    expect(findSigungu("경상북도 경주시")).toBe("gyeongbuk-경주시");
    expect(findSigungu("경기도 광주시")).toBe("gyeonggi-광주시");
    expect(findSigungu("광주광역시 동구")).toBe("gwangju-동구");
    expect(findSigungu("제주특별자치도 서귀포시")).toBe("jeju-서귀포시");
  });

  test("시군구가 하나뿐인 세종은 읍·면 주소도 세종시로 본다", () => {
    expect(findSigungu("세종특별자치시 조치원읍")).toBe("sejong-세종시");
    expect(findSigungu("세종 세종시")).toBe("sejong-세종시");
  });

  test("목록에 없는 시군구는 다른 곳에 억지로 붙이지 않는다", () => {
    expect(findSigungu("인천광역시 제물포구")).toBeUndefined();
    expect(findSigungu("서울")).toBeUndefined();
    expect(findSigungu("")).toBeUndefined();
  });

  test("시도명을 모르면 장소의 지역 안에서만 찾는다", () => {
    expect(findSigungu("전남광주통합특별시 서구", "gwangju")).toBe("gwangju-서구");
    expect(findSigungu("전남광주통합특별시 서구")).toBeUndefined();
  });
});

describe("seed — 장소의 시군구는 그 장소의 지역 안에 있다", () => {
  test("모든 장소의 sigungu가 같은 시도를 가리킨다 (경주는 경북)", () => {
    const wrong: string[] = [];
    for (const r of regions) {
      const expected = r.id === "gyeongju" ? "gyeongbuk" : r.id;
      for (const p of r.places) {
        if (!p.sigungu) continue;
        const s = findSigunguById(p.sigungu);
        if (s?.region !== expected) wrong.push(`${p.id} ${p.city} → ${p.sigungu}`);
      }
    }
    expect(wrong).toEqual([]);
  });
});

describe("fallbackCourse — 시군구 가중이 다른 광역시 같은 이름 구에 새지 않는다", () => {
  test("대구에서 구를 고르면 그 구에 있는 맛집이 점심으로 먼저 온다", () => {
    const region = getRegion("daegu")!;
    // 매핑 함수와 독립적으로, 주소 텍스트로 "그 구에 있는 맛집"을 판정한다
    const inGu = (city: string, name: string) => city.startsWith("대구") && city.split(" ").includes(name);
    const checked: string[] = [];
    for (const s of getSigungus("daegu")) {
      if (!region.places.some((p) => p.type === "restaurant" && inGu(p.city, s.name))) continue;
      const course = fallbackCourse(
        { region: "daegu", sigungu: s.id, days: 1, preferences: [], onsenFocus: false, includeLodging: false },
        region
      );
      const lunch = region.places.find((p) => p.id === course.days[0].stops.find((x) => x.time === "13:00")?.placeId);
      expect(lunch && inGu(lunch.city, s.name), `${s.id} 선택 시 점심 ${lunch?.city}`).toBe(true);
      checked.push(s.id);
    }
    expect(checked.length).toBeGreaterThan(1);
  });
});
