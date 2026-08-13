import { z } from "zod";
import { getAdminOverview, listManagedTripPlans, listPlaceVerifications, updateManagedTripPlan, updatePlaceVerification } from "../db.admin";
import { getPlace } from "../../shared/travelCatalog";
import { adminProcedure, router } from "../_core/trpc";

export const adminRouter = router({
  overview: adminProcedure.query(() => getAdminOverview()),
  verifications: adminProcedure.query(() => listPlaceVerifications()),
  plans: adminProcedure.query(() => listManagedTripPlans()),
  updateVerification: adminProcedure.input(z.object({ placeId: z.string().min(1), status: z.enum(["draft", "verified", "needs-review"]), sourceUrl: z.string().url().nullable().optional(), verifiedAt: z.coerce.date().nullable().optional(), internalNote: z.string().max(500).nullable().optional() })).mutation(async ({ ctx, input }) => {
    if (!getPlace(input.placeId)) throw new Error("Place not found");
    await updatePlaceVerification({ ...input, updatedBy: ctx.user.id });
    return { success: true };
  }),
  updatePlan: adminProcedure.input(z.object({ planId: z.number().int().positive(), adminStatus: z.enum(["active", "review", "archived"]), adminNote: z.string().max(500).nullable().optional(), isShared: z.boolean() })).mutation(async ({ ctx, input }) => {
    await updateManagedTripPlan({ ...input, updatedBy: ctx.user.id });
    return { success: true };
  }),
});
