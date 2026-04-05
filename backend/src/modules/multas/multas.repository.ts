import { and, desc, eq } from "drizzle-orm";
import { type InsertMulta, multas } from "../../../drizzle/schema";
import { getDb } from "../../db";

export async function createMulta(data: InsertMulta) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [created] = await db.insert(multas).values(data).returning();
  return created;
}

export async function listMultas(filters?: { status?: string; contratoId?: number; tipo?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [
    filters?.status ? eq(multas.status, filters.status as any) : undefined,
    filters?.contratoId ? eq(multas.contratoId, filters.contratoId) : undefined,
    filters?.tipo ? eq(multas.tipo, filters.tipo as any) : undefined,
  ].filter(Boolean);

  let query: any = db.select().from(multas);
  if (conditions.length === 1) {
    query = query.where(conditions[0]);
  } else if (conditions.length > 1) {
    query = query.where(and(...conditions));
  }

  return query.orderBy(desc(multas.createdAt));
}

export async function getMultaById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(multas).where(eq(multas.id, id)).limit(1);
  return result[0];
}

export async function updateMulta(id: number, data: Partial<InsertMulta>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(multas).set(data).where(eq(multas.id, id));
}

export async function deleteMulta(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(multas).where(eq(multas.id, id));
}

export async function getMultasByContrato(contratoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(multas).where(eq(multas.contratoId, contratoId)).orderBy(desc(multas.createdAt));
}
