import { desc, eq } from "drizzle-orm";
import { type InsertManutencao, manutencoes } from "../../../drizzle/schema";
import { getDb } from "../../db";

export async function createManutencao(data: InsertManutencao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [created] = await db.insert(manutencoes).values(data).returning();
  return created;
}

export async function getManutencaoById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(manutencoes).where(eq(manutencoes.id, id)).limit(1);
  return result[0];
}

export async function listManutencoes() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(manutencoes).orderBy(desc(manutencoes.createdAt));
}

export async function updateManutencao(id: number, data: Partial<InsertManutencao>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(manutencoes).set(data).where(eq(manutencoes.id, id));
}

export async function deleteManutencao(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(manutencoes).where(eq(manutencoes.id, id));
}

export async function getManutencoesByMoto(motoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(manutencoes).where(eq(manutencoes.motoId, motoId)).orderBy(desc(manutencoes.createdAt));
}
