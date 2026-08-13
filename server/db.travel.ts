import { and, asc, desc, eq } from "drizzle-orm";
import { favoritePlaces, recommendationHistory, tripPlanChecklistItems, tripPlanStops, tripPlans, visitRecords } from "../drizzle/schema";
import { getDb } from "./db";
import { nanoid } from "nanoid";

export async function listFavoritePlaceIds(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ placeId: favoritePlaces.placeId }).from(favoritePlaces).where(eq(favoritePlaces.userId, userId));
  return rows.map(row => row.placeId);
}

export async function toggleFavoritePlace(userId: number, placeId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const existing = await db.select().from(favoritePlaces).where(and(eq(favoritePlaces.userId, userId), eq(favoritePlaces.placeId, placeId))).limit(1);
  if (existing.length) {
    await db.delete(favoritePlaces).where(and(eq(favoritePlaces.userId, userId), eq(favoritePlaces.placeId, placeId)));
    return false;
  }
  await db.insert(favoritePlaces).values({ userId, placeId });
  return true;
}

export async function createTripPlan(input: { userId: number; title: string; region: string; coverPlaceId?: string | null; scheduledFor?: Date | null; budgetLimit?: number | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const result = await db.insert(tripPlans).values(input);
  return Number(result[0].insertId);
}

export function nextStopPosition(positions: number[]) {
  return positions.length ? Math.max(...positions) + 1 : 0;
}

export async function addTripPlanStop(userId: number, input: { planId: number; placeId: string; note?: string | null }) {
  const db = await ownsPlan(userId, input.planId);
  const existingStops = await db.select({ position: tripPlanStops.position }).from(tripPlanStops).where(eq(tripPlanStops.planId, input.planId));
  await db.insert(tripPlanStops).values({ ...input, position: nextStopPosition(existingStops.map(stop => stop.position)) });
}

export async function listTripPlans(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const plans = await db.select().from(tripPlans).where(eq(tripPlans.userId, userId)).orderBy(desc(tripPlans.updatedAt));
  if (!plans.length) return [];
  const stops = await db.select().from(tripPlanStops).orderBy(asc(tripPlanStops.position));
  const checklist = await db.select().from(tripPlanChecklistItems).orderBy(asc(tripPlanChecklistItems.position));
  return plans.map(plan => ({ ...plan, stops: stops.filter(stop => stop.planId === plan.id), checklist: checklist.filter(item => item.planId === plan.id) }));
}

async function ownsPlan(userId: number, planId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const plans = await db.select().from(tripPlans).where(and(eq(tripPlans.id, planId), eq(tripPlans.userId, userId))).limit(1);
  if (!plans.length) throw new Error("Plan not found");
  return db;
}

export async function removeTripPlanStop(userId: number, planId: number, stopId: number) {
  const db = await ownsPlan(userId, planId);
  await db.delete(tripPlanStops).where(and(eq(tripPlanStops.id, stopId), eq(tripPlanStops.planId, planId)));
}

export async function updateTripPlanStop(userId: number, input: { planId: number; stopId: number; note?: string | null; startTime?: string | null; estimatedCost?: number | null; durationMinutes?: number | null }) {
  const db = await ownsPlan(userId, input.planId);
  const updateSet: { note?: string | null; startTime?: string | null; estimatedCost?: number | null; durationMinutes?: number | null } = {};
  if (input.note !== undefined) updateSet.note = input.note;
  if (input.startTime !== undefined) updateSet.startTime = input.startTime;
  if (input.estimatedCost !== undefined) updateSet.estimatedCost = input.estimatedCost;
  if (input.durationMinutes !== undefined) updateSet.durationMinutes = input.durationMinutes;
  if (Object.keys(updateSet).length) await db.update(tripPlanStops).set(updateSet).where(and(eq(tripPlanStops.id, input.stopId), eq(tripPlanStops.planId, input.planId)));
}

export async function moveTripPlanStop(userId: number, input: { planId: number; stopId: number; direction: "up" | "down" }) {
  const db = await ownsPlan(userId, input.planId);
  const stops = await db.select().from(tripPlanStops).where(eq(tripPlanStops.planId, input.planId)).orderBy(asc(tripPlanStops.position));
  const index = stops.findIndex(stop => stop.id === input.stopId);
  const targetIndex = input.direction === "up" ? index - 1 : index + 1;
  if (index < 0 || targetIndex < 0 || targetIndex >= stops.length) return;
  const current = stops[index];
  const target = stops[targetIndex];
  await db.update(tripPlanStops).set({ position: target.position }).where(eq(tripPlanStops.id, current.id));
  await db.update(tripPlanStops).set({ position: current.position }).where(eq(tripPlanStops.id, target.id));
}

export async function updateTripPlan(userId: number, input: { planId: number; title?: string; scheduledFor?: Date | null; budgetLimit?: number | null }) {
  const db = await ownsPlan(userId, input.planId);
  const updateSet: { title?: string; scheduledFor?: Date | null; budgetLimit?: number | null } = {};
  if (input.title !== undefined) updateSet.title = input.title;
  if (input.scheduledFor !== undefined) updateSet.scheduledFor = input.scheduledFor;
  if (input.budgetLimit !== undefined) updateSet.budgetLimit = input.budgetLimit;
  if (Object.keys(updateSet).length) await db.update(tripPlans).set(updateSet).where(eq(tripPlans.id, input.planId));
}

export async function addChecklistItem(userId: number, input: { planId: number; label: string }) {
  const db = await ownsPlan(userId, input.planId);
  const items = await db.select({ position: tripPlanChecklistItems.position }).from(tripPlanChecklistItems).where(eq(tripPlanChecklistItems.planId, input.planId));
  await db.insert(tripPlanChecklistItems).values({ ...input, position: nextStopPosition(items.map(item => item.position)) });
}

export async function toggleChecklistItem(userId: number, input: { planId: number; itemId: number; isCompleted: boolean }) {
  const db = await ownsPlan(userId, input.planId);
  await db.update(tripPlanChecklistItems).set({ isCompleted: input.isCompleted }).where(and(eq(tripPlanChecklistItems.id, input.itemId), eq(tripPlanChecklistItems.planId, input.planId)));
}

export async function removeChecklistItem(userId: number, input: { planId: number; itemId: number }) {
  const db = await ownsPlan(userId, input.planId);
  await db.delete(tripPlanChecklistItems).where(and(eq(tripPlanChecklistItems.id, input.itemId), eq(tripPlanChecklistItems.planId, input.planId)));
}

export async function setPlanSharing(userId: number, input: { planId: number; isShared: boolean }) {
  const db = await ownsPlan(userId, input.planId);
  const [plan] = await db.select({ shareToken: tripPlans.shareToken }).from(tripPlans).where(eq(tripPlans.id, input.planId)).limit(1);
  const shareToken = plan?.shareToken ?? nanoid(16);
  await db.update(tripPlans).set({ isShared: input.isShared, shareToken }).where(eq(tripPlans.id, input.planId));
  return { isShared: input.isShared, shareToken: input.isShared ? shareToken : null };
}

export async function getSharedTripPlan(shareToken: string) {
  const db = await getDb();
  if (!db) return null;
  const [plan] = await db.select({ id: tripPlans.id, title: tripPlans.title, region: tripPlans.region, coverPlaceId: tripPlans.coverPlaceId, scheduledFor: tripPlans.scheduledFor, budgetLimit: tripPlans.budgetLimit, updatedAt: tripPlans.updatedAt }).from(tripPlans).where(and(eq(tripPlans.shareToken, shareToken), eq(tripPlans.isShared, true))).limit(1);
  if (!plan) return null;
  const stops = await db.select().from(tripPlanStops).where(eq(tripPlanStops.planId, plan.id)).orderBy(asc(tripPlanStops.position));
  const checklist = await db.select().from(tripPlanChecklistItems).where(eq(tripPlanChecklistItems.planId, plan.id)).orderBy(asc(tripPlanChecklistItems.position));
  return { ...plan, stops, checklist };
}

export async function addVisitRecord(input: { userId: number; placeId: string; note?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.insert(visitRecords).values(input);
}

export async function listVisitRecords(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(visitRecords).where(eq(visitRecords.userId, userId)).orderBy(desc(visitRecords.visitedAt));
}

export async function saveRecommendation(input: { userId: number; region: string; preference: unknown; itinerary: unknown; source: "ai" | "curated" }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(recommendationHistory).values({ ...input, preference: input.preference, itinerary: input.itinerary });
}

export async function listRecommendations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(recommendationHistory).where(eq(recommendationHistory.userId, userId)).orderBy(desc(recommendationHistory.createdAt)).limit(10);
}
