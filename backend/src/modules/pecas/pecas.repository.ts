import { asc, eq, sql } from "drizzle-orm";
import { type InsertPeca, pecas } from "../../../drizzle/schema";
import { getDb } from "../../db";

export async function createPeca(data: InsertPeca) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(pecas).values(data);
}

export async function listPecas() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(pecas).orderBy(asc(pecas.nome));
}

export async function getPecaById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(pecas).where(eq(pecas.id, id)).limit(1);
  return result[0];
}

export async function getPecaByNome(nome: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select()
    .from(pecas)
    .where(sql`lower(${pecas.nome}) = ${nome.trim().toLowerCase()}`)
    .limit(1);
  return result[0];
}

export async function updatePeca(id: number, data: Partial<InsertPeca>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(pecas).set(data).where(eq(pecas.id, id));
}

export async function deletePeca(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(pecas).where(eq(pecas.id, id));
}
