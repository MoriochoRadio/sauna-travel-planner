import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "../_core/context";

const adminMocks = vi.hoisted(() => ({
  getAdminOverview: vi.fn(),
  listPlaceVerifications: vi.fn(),
  listManagedTripPlans: vi.fn(),
  updateManagedTripPlan: vi.fn(),
  updatePlaceVerification: vi.fn(),
}));

vi.mock("../db.admin", () => adminMocks);

import { appRouter } from "../routers";

function createContext(role: "admin" | "user"): TrpcContext {
  return {
    user: { id: 91, openId: "operator-91", name: "Operator", email: "operator@example.com", loginMethod: "manus", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as TrpcContext["res"],
  };
}

describe("admin router", () => {
  it("writes a verification record with the authenticated admin identity", async () => {
    adminMocks.updatePlaceVerification.mockResolvedValue(undefined);
    const caller = appRouter.createCaller(createContext("admin"));
    await expect(caller.admin.updateVerification({ placeId: "spaland-centum-city", status: "verified", sourceUrl: "https://example.com/source", verifiedAt: new Date("2026-08-13T00:00:00.000Z"), reviewBy: new Date("2026-11-13T00:00:00.000Z"), internalNote: "공식 출처 재확인" })).resolves.toEqual({ success: true });
    expect(adminMocks.updatePlaceVerification).toHaveBeenCalledWith(expect.objectContaining({ placeId: "spaland-centum-city", status: "verified", reviewBy: new Date("2026-11-13T00:00:00.000Z"), updatedBy: 91 }));
  });

  it("rejects non-admin access to operational data", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    await expect(caller.admin.overview()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.plans()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.updatePlan({ planId: 73, adminStatus: "review", adminNote: null, isShared: false })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows an admin to archive a plan while revoking public sharing", async () => {
    adminMocks.updateManagedTripPlan.mockResolvedValue(undefined);
    const caller = appRouter.createCaller(createContext("admin"));
    await expect(caller.admin.updatePlan({ planId: 73, adminStatus: "archived", adminNote: "운영 아카이브", isShared: false })).resolves.toEqual({ success: true });
    expect(adminMocks.updateManagedTripPlan).toHaveBeenCalledWith({ planId: 73, adminStatus: "archived", adminNote: "운영 아카이브", isShared: false, updatedBy: 91 });
  });

  it("allows an admin to explicitly update a plan sharing setting", async () => {
    adminMocks.updateManagedTripPlan.mockResolvedValue(undefined);
    const caller = appRouter.createCaller(createContext("admin"));
    await expect(caller.admin.updatePlan({ planId: 73, adminStatus: "review", adminNote: "공유 재개", isShared: true })).resolves.toEqual({ success: true });
    expect(adminMocks.updateManagedTripPlan).toHaveBeenCalledWith({ planId: 73, adminStatus: "review", adminNote: "공유 재개", isShared: true, updatedBy: 91 });
  });
});
