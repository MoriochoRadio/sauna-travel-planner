import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "../_core/context";

const dbMocks = vi.hoisted(() => ({
  addTripPlanStop: vi.fn(),
  addChecklistItem: vi.fn(),
  addVisitRecord: vi.fn(),
  createTripPlan: vi.fn(),
  listFavoritePlaceIds: vi.fn(),
  listRecommendations: vi.fn(),
  listTripPlans: vi.fn(),
  listVisitRecords: vi.fn(),
  moveTripPlanStop: vi.fn(),
  removeChecklistItem: vi.fn(),
  removeTripPlanStop: vi.fn(),
  saveRecommendation: vi.fn(),
  setPlanSharing: vi.fn(),
  toggleChecklistItem: vi.fn(),
  toggleFavoritePlace: vi.fn(),
  updateTripPlanStop: vi.fn(),
  updateTripPlan: vi.fn(),
}));

vi.mock("../db.travel", () => dbMocks);

import { appRouter } from "../routers";

function createContext(userId = 42): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `qa-user-${userId}`,
      name: "QA User",
      email: "qa@example.com",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as TrpcContext["res"],
  };
}

describe("travel router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.createTripPlan.mockResolvedValue(73);
    dbMocks.toggleFavoritePlace.mockResolvedValue(true);
    dbMocks.addTripPlanStop.mockResolvedValue(undefined);
    dbMocks.updateTripPlanStop.mockResolvedValue(undefined);
    dbMocks.updateTripPlan.mockResolvedValue(undefined);
    dbMocks.addChecklistItem.mockResolvedValue(undefined);
    dbMocks.toggleChecklistItem.mockResolvedValue(undefined);
    dbMocks.removeChecklistItem.mockResolvedValue(undefined);
    dbMocks.setPlanSharing.mockResolvedValue({ isShared: true, shareToken: "qa-share-token-123" });
  });

  it("routes favorite saves through the authenticated server user", async () => {
    const caller = appRouter.createCaller(createContext(42));
    await expect(caller.travel.favorites.toggle({ placeId: "spaland-centum-city" })).resolves.toEqual({ saved: true });
    expect(dbMocks.toggleFavoritePlace).toHaveBeenCalledWith(42, "spaland-centum-city");
  });

  it("does not accept a client-provided plan position and forwards the authenticated owner", async () => {
    const caller = appRouter.createCaller(createContext(42));
    await expect(caller.travel.planner.create({ title: "부산의 느린 하루", region: "부산", coverPlaceId: "spaland-centum-city" })).resolves.toEqual({ id: 73 });
    await expect(caller.travel.planner.addStop({ planId: 73, placeId: "spaland-centum-city", note: "오후의 휴식" })).resolves.toEqual({ success: true });
    expect(dbMocks.createTripPlan).toHaveBeenCalledWith({ userId: 42, title: "부산의 느린 하루", region: "부산", coverPlaceId: "spaland-centum-city" });
    expect(dbMocks.addTripPlanStop).toHaveBeenCalledWith(42, { planId: 73, placeId: "spaland-centum-city", note: "오후의 휴식" });
  });

  it("updates a plan memo through the authenticated user context", async () => {
    const caller = appRouter.createCaller(createContext(42));
    await expect(caller.travel.planner.updateStop({ planId: 73, stopId: 7, note: "오후 휴식으로 기록" })).resolves.toEqual({ success: true });
    expect(dbMocks.updateTripPlanStop).toHaveBeenCalledWith(42, { planId: 73, stopId: 7, note: "오후 휴식으로 기록" });
  });

  it("keeps date, budget, checklist and sharing actions scoped to the authenticated owner", async () => {
    const caller = appRouter.createCaller(createContext(42));
    const scheduledFor = new Date("2026-09-12T00:00:00.000Z");
    await expect(caller.travel.planner.update({ planId: 73, title: "부산 리셋", scheduledFor, budgetLimit: 120000 })).resolves.toEqual({ success: true });
    await expect(caller.travel.planner.checklist.add({ planId: 73, label: "수분 보충용 물" })).resolves.toEqual({ success: true });
    await expect(caller.travel.planner.checklist.toggle({ planId: 73, itemId: 4, isCompleted: true })).resolves.toEqual({ success: true });
    await expect(caller.travel.planner.share({ planId: 73, isShared: true })).resolves.toEqual({ isShared: true, shareToken: "qa-share-token-123" });
    expect(dbMocks.updateTripPlan).toHaveBeenCalledWith(42, { planId: 73, title: "부산 리셋", scheduledFor, budgetLimit: 120000 });
    expect(dbMocks.addChecklistItem).toHaveBeenCalledWith(42, { planId: 73, label: "수분 보충용 물" });
    expect(dbMocks.toggleChecklistItem).toHaveBeenCalledWith(42, { planId: 73, itemId: 4, isCompleted: true });
    expect(dbMocks.setPlanSharing).toHaveBeenCalledWith(42, { planId: 73, isShared: true });
  });

  it("filters the public catalog and preserves its curated fallback itinerary", async () => {
    const publicContext = { ...createContext(), user: null };
    const caller = appRouter.createCaller(publicContext);
    const places = await caller.travel.catalog.list({ region: "부산", moods: ["세련된"] });
    const preview = await caller.travel.itinerary.preview({ region: "부산", purpose: "date", mood: "세련된", budget: "signature", companion: "연인" });
    expect(places.map(place => place.id)).toEqual(["spaland-centum-city"]);
    expect(preview.generatedWith).toBe("curated");
    expect(preview.stops).toHaveLength(3);
  });
});
