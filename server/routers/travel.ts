import { z } from "zod";
import { companions, facilities, getPlace, moods, regions, travelPlaces } from "../../shared/travelCatalog";
import { addChecklistItem, createTripPlan, addTripPlanStop, addVisitRecord, getSharedTripPlan, listFavoritePlaceIds, listRecommendations, listTripPlans, listVisitRecords, moveTripPlanStop, removeChecklistItem, removeTripPlanStop, saveRecommendation, setPlanSharing, toggleChecklistItem, toggleFavoritePlace, updateTripPlan, updateTripPlanStop } from "../db.travel";
import { createFallbackCourse, generateTravelCourse, type TravelPreference } from "../travel/recommendation";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

const priceBands = ["light", "balanced", "signature"] as const;
const purposeValues = ["recovery", "slow-travel", "family-time", "date", "solo-reset"] as const;

const preferenceSchema = z.object({
  region: z.string().min(1),
  purpose: z.enum(purposeValues),
  mood: z.string().min(1),
  budget: z.enum(priceBands),
  companion: z.string().min(1),
});

const planMetadataSchema = z.object({ title: z.string().min(1).max(80).optional(), scheduledFor: z.coerce.date().nullable().optional(), budgetLimit: z.number().int().min(0).max(100000000).nullable().optional() });

export const travelRouter = router({
  catalog: router({
    facets: publicProcedure.query(() => ({ regions, moods, facilities, companions, priceBands })),
    list: publicProcedure.input(z.object({ region: z.string().optional(), moods: z.array(z.string()).optional(), facilities: z.array(z.string()).optional(), priceBands: z.array(z.enum(priceBands)).optional(), companions: z.array(z.string()).optional(), query: z.string().optional() }).optional()).query(({ input }) => {
      const normalizedQuery = input?.query?.trim().toLowerCase();
      return travelPlaces.filter(place => {
        if (input?.region && place.region !== input.region) return false;
        if (input?.moods?.length && !input.moods.some(mood => place.mood.includes(mood))) return false;
        if (input?.facilities?.length && !input.facilities.some(facility => place.facilities.includes(facility))) return false;
        if (input?.priceBands?.length && !input.priceBands.includes(place.priceBand)) return false;
        if (input?.companions?.length && !input.companions.some(companion => place.companions.includes(companion))) return false;
        if (normalizedQuery && !`${place.name} ${place.region} ${place.city} ${place.summary}`.toLowerCase().includes(normalizedQuery)) return false;
        return true;
      });
    }),
    byId: publicProcedure.input(z.object({ id: z.string() })).query(({ input }) => getPlace(input.id) ?? null),
  }),
  itinerary: router({
    generate: publicProcedure.input(preferenceSchema).mutation(async ({ input, ctx }) => {
      const course = await generateTravelCourse(input as TravelPreference);
      if (ctx.user) await saveRecommendation({ userId: ctx.user.id, region: input.region, preference: input, itinerary: course, source: course.generatedWith });
      return course;
    }),
    preview: publicProcedure.input(preferenceSchema).query(({ input }) => createFallbackCourse(input as TravelPreference)),
  }),
  favorites: router({
    list: protectedProcedure.query(async ({ ctx }) => listFavoritePlaceIds(ctx.user.id)),
    toggle: protectedProcedure.input(z.object({ placeId: z.string() })).mutation(async ({ ctx, input }) => {
      if (!getPlace(input.placeId)) throw new Error("Place not found");
      return { saved: await toggleFavoritePlace(ctx.user.id, input.placeId) };
    }),
  }),
  planner: router({
    list: protectedProcedure.query(async ({ ctx }) => listTripPlans(ctx.user.id)),
    create: protectedProcedure.input(z.object({ title: z.string().min(1).max(80), region: z.string().min(1), coverPlaceId: z.string().optional(), scheduledFor: z.coerce.date().nullable().optional(), budgetLimit: z.number().int().min(0).max(100000000).nullable().optional() })).mutation(async ({ ctx, input }) => ({ id: await createTripPlan({ userId: ctx.user.id, title: input.title, region: input.region, coverPlaceId: input.coverPlaceId ?? null, scheduledFor: input.scheduledFor, budgetLimit: input.budgetLimit }) })),
    update: protectedProcedure.input(planMetadataSchema.extend({ planId: z.number().int().positive() })).mutation(async ({ ctx, input }) => { await updateTripPlan(ctx.user.id, input); return { success: true }; }),
    addStop: protectedProcedure.input(z.object({ planId: z.number().int().positive(), placeId: z.string(), note: z.string().max(240).optional() })).mutation(async ({ ctx, input }) => {
      if (!getPlace(input.placeId)) throw new Error("Place not found");
      await addTripPlanStop(ctx.user.id, { ...input, note: input.note ?? null });
      return { success: true };
    }),
    removeStop: protectedProcedure.input(z.object({ planId: z.number().int().positive(), stopId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      await removeTripPlanStop(ctx.user.id, input.planId, input.stopId);
      return { success: true };
    }),
    updateStop: protectedProcedure.input(z.object({ planId: z.number().int().positive(), stopId: z.number().int().positive(), note: z.string().max(240).nullable().optional(), startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().optional(), estimatedCost: z.number().int().min(0).max(100000000).nullable().optional(), durationMinutes: z.number().int().min(0).max(1440).nullable().optional() })).mutation(async ({ ctx, input }) => {
      await updateTripPlanStop(ctx.user.id, input);
      return { success: true };
    }),
    moveStop: protectedProcedure.input(z.object({ planId: z.number().int().positive(), stopId: z.number().int().positive(), direction: z.enum(["up", "down"]) })).mutation(async ({ ctx, input }) => {
      await moveTripPlanStop(ctx.user.id, input);
      return { success: true };
    }),
    checklist: router({
      add: protectedProcedure.input(z.object({ planId: z.number().int().positive(), label: z.string().trim().min(1).max(180) })).mutation(async ({ ctx, input }) => { await addChecklistItem(ctx.user.id, input); return { success: true }; }),
      toggle: protectedProcedure.input(z.object({ planId: z.number().int().positive(), itemId: z.number().int().positive(), isCompleted: z.boolean() })).mutation(async ({ ctx, input }) => { await toggleChecklistItem(ctx.user.id, input); return { success: true }; }),
      remove: protectedProcedure.input(z.object({ planId: z.number().int().positive(), itemId: z.number().int().positive() })).mutation(async ({ ctx, input }) => { await removeChecklistItem(ctx.user.id, input); return { success: true }; }),
    }),
    share: protectedProcedure.input(z.object({ planId: z.number().int().positive(), isShared: z.boolean() })).mutation(async ({ ctx, input }) => setPlanSharing(ctx.user.id, input)),
    shared: publicProcedure.input(z.object({ token: z.string().min(10).max(32) })).query(async ({ input }) => getSharedTripPlan(input.token)),
  }),
  profile: router({
    visits: protectedProcedure.query(async ({ ctx }) => listVisitRecords(ctx.user.id)),
    addVisit: protectedProcedure.input(z.object({ placeId: z.string(), note: z.string().max(240).optional() })).mutation(async ({ ctx, input }) => {
      if (!getPlace(input.placeId)) throw new Error("Place not found");
      await addVisitRecord({ userId: ctx.user.id, placeId: input.placeId, note: input.note ?? null });
      return { success: true };
    }),
    recommendations: protectedProcedure.query(async ({ ctx }) => listRecommendations(ctx.user.id)),
  }),
});
