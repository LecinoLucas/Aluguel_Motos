import { desc, eq, inArray } from "drizzle-orm";
import { type InsertLocador, locadores } from "../../../drizzle/schema";
import { getDb } from "../../db";

export async function createLocador(data: InsertLocador) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(locadores).values(data);
}

export async function listLocadores() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(locadores).orderBy(desc(locadores.createdAt));
}

export async function getLocadorById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(locadores).where(eq(locadores.id, id)).limit(1);
  return result[0];
}

export async function getLocadoresByIds(ids: number[]) {
  if (ids.length === 0) return [];

  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(locadores).where(inArray(locadores.id, ids));
}

export async function getLocadorByCpf(cpf: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(locadores).where(eq(locadores.cpf, cpf)).limit(1);
  return result[0];
}

export async function updateLocador(id: number, data: Partial<InsertLocador>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(locadores).set(data).where(eq(locadores.id, id));
}

export async function deleteLocador(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(locadores).where(eq(locadores.id, id));
}
