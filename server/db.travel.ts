import { and, asc, desc, eq } from "drizzle-orm";
import { favoritePlaces, recommendationHistory, tripPlanStops, tripPlans, visitRecords } from "../drizzle/schema";
import { getDb } from "./db";

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

export async function createTripPlan(input: { userId: number; title: string; region: string; coverPlaceId?: string | null }) {
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
  return plans.map(plan => ({ ...plan, stops: stops.filter(stop => stop.planId === plan.id) }));
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

export async function updateTripPlanStop(userId: number, input: { planId: number; stopId: number; note?: string | null }) {
  const db = await ownsPlan(userId, input.planId);
  await db.update(tripPlanStops).set({ note: input.note ?? null }).where(and(eq(tripPlanStops.id, input.stopId), eq(tripPlanStops.planId, input.planId)));
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
