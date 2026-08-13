import { count, desc, eq } from "drizzle-orm";
import { placeVerificationRecords, tripPlans, users } from "../drizzle/schema";
import { travelPlaces } from "../shared/travelCatalog";
import { getDb } from "./db";

type VerificationStatus = "draft" | "verified" | "needs-review";

export async function listPlaceVerifications() {
  const db = await getDb();
  if (!db) return [];
  const records = await db.select().from(placeVerificationRecords).orderBy(desc(placeVerificationRecords.updatedAt));
  const byPlaceId = new Map(records.map(record => [record.placeId, record]));
  return travelPlaces.map(place => {
    const record = byPlaceId.get(place.id);
    return {
      placeId: place.id,
      name: place.name,
      region: place.region,
      existingStatus: place.verification.status === "official" ? "verified" : "draft" as VerificationStatus,
      status: record?.status ?? (place.verification.status === "official" ? "verified" : "draft" as VerificationStatus),
      sourceUrl: record?.sourceUrl ?? place.verification.sourceUrl,
      verifiedAt: record?.verifiedAt ?? new Date(`${place.verification.verifiedAt}T00:00:00.000Z`),
      internalNote: record?.internalNote ?? null,
      updatedAt: record?.updatedAt ?? null,
    };
  });
}

export async function updatePlaceVerification(input: { placeId: string; status: VerificationStatus; sourceUrl?: string | null; verifiedAt?: Date | null; internalNote?: string | null; updatedBy: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.insert(placeVerificationRecords).values(input).onDuplicateKeyUpdate({
    set: { status: input.status, sourceUrl: input.sourceUrl ?? null, verifiedAt: input.verifiedAt ?? null, internalNote: input.internalNote ?? null, updatedBy: input.updatedBy },
  });
}

export async function getAdminOverview() {
  const db = await getDb();
  if (!db) return { users: 0, plans: 0, verificationRecords: 0 };
  const [[userCount], [planCount], [verificationCount]] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(tripPlans),
    db.select({ value: count() }).from(placeVerificationRecords),
  ]);
  return { users: Number(userCount?.value ?? 0), plans: Number(planCount?.value ?? 0), verificationRecords: Number(verificationCount?.value ?? 0) };
}

export async function listManagedTripPlans() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: tripPlans.id, title: tripPlans.title, region: tripPlans.region, scheduledFor: tripPlans.scheduledFor, budgetLimit: tripPlans.budgetLimit, isShared: tripPlans.isShared, isArchived: tripPlans.isArchived, adminStatus: tripPlans.adminStatus, adminNote: tripPlans.adminNote, updatedAt: tripPlans.updatedAt, ownerName: users.name, ownerEmail: users.email }).from(tripPlans).innerJoin(users, eq(tripPlans.userId, users.id)).orderBy(desc(tripPlans.updatedAt)).limit(50);
}

export async function updateManagedTripPlan(input: { planId: number; adminStatus: "active" | "review" | "archived"; adminNote?: string | null; isShared: boolean; updatedBy: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.update(tripPlans).set({ adminStatus: input.adminStatus, adminNote: input.adminNote ?? null, isArchived: input.adminStatus === "archived", isShared: input.adminStatus === "archived" ? false : input.isShared, adminUpdatedBy: input.updatedBy, adminUpdatedAt: new Date() }).where(eq(tripPlans.id, input.planId));
}
