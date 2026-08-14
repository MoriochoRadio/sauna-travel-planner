import { describe, expect, it } from "vitest";
import { regions } from "./seed";
import { PlaceSchema, type Place } from "./schema";
import { verifiedPlaces } from "./verified";
import { travelGuides } from "./guides";

const allPlaces: Place[] = regions.flatMap((r) => r.places);

describe("검증 큐레이션 장소", () => {
  it("스키마를 만족한다", () => {
    for (const place of verifiedPlaces) {
      expect(() => PlaceSchema.parse(place), place.id).not.toThrow();
    }
  });

  it("id가 고유하고 시드 전체와 충돌하지 않는다", () => {
    const ids = allPlaces.map((p) => p.id);
    expect(new Set(ids).size, "시드 전체 id 중복").toBe(ids.length);
  });

  it("모두 시드에 병합돼 코스 후보로 잡힌다", () => {
    for (const place of verifiedPlaces) {
      expect(allPlaces.some((p) => p.id === place.id), place.id).toBe(true);
    }
  });

  it("검증 정보와 출처 링크를 갖는다", () => {
    for (const place of verifiedPlaces) {
      expect(place.verification, place.id).toBeDefined();
      expect(place.verification!.sourceUrl, place.id).toMatch(/^https:\/\//);
      expect(place.verification!.verifiedAt, place.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("공식 확인 전(curation-draft) 장소는 운영 정보를 단정하지 않는다", () => {
    // 요금·운영 시간을 확정해 보여주면 사용자가 헛걸음할 수 있다.
    for (const place of verifiedPlaces.filter((p) => p.verification?.status === "curation-draft")) {
      expect(place.openHours, place.id).toBeUndefined();
      expect(place.verification!.operatingNote, place.id).toBeTruthy();
    }
  });

  it("과학 근거는 효과를 단정하지 않고 출처를 남긴다", () => {
    for (const place of verifiedPlaces) {
      expect(place.science, place.id).toBeDefined();
      expect(place.science!.sourceUrl, place.id).toMatch(/^https:\/\//);
    }
  });
});

describe("여행 가이드", () => {
  it("slug가 고유하다", () => {
    const slugs = travelGuides.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("참조하는 장소가 모두 실재한다", () => {
    // placeId 매핑이 어긋나면 가이드 하단이 조용히 빈 목록이 된다.
    for (const guide of travelGuides) {
      expect(guide.placeIds.length, guide.slug).toBeGreaterThan(0);
      for (const id of guide.placeIds) {
        expect(verifiedPlaces.some((p) => p.id === id), `${guide.slug} → ${id}`).toBe(true);
      }
    }
  });

  it("본문과 준비물이 비어 있지 않다", () => {
    for (const guide of travelGuides) {
      expect(guide.sections.length, guide.slug).toBeGreaterThan(0);
      expect(guide.essentials.length, guide.slug).toBeGreaterThan(0);
      for (const section of guide.sections) expect(section.body.length, guide.slug).toBeGreaterThan(20);
    }
  });
});
