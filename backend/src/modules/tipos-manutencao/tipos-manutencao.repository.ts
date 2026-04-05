import { asc, eq, sql } from "drizzle-orm";
import { type InsertTipoManutencao, tiposManutencao } from "../../../drizzle/schema";
import { getDb } from "../../db";

export async function createTipoManutencao(data: InsertTipoManutencao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(tiposManutencao).values(data);
}

export async function listTiposManutencao() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(tiposManutencao).orderBy(asc(tiposManutencao.nome));
}

export async function getTipoManutencaoById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(tiposManutencao).where(eq(tiposManutencao.id, id)).limit(1);
  return result[0];
}

export async function getTipoManutencaoByNome(nome: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select()
    .from(tiposManutencao)
    .where(sql`lower(${tiposManutencao.nome}) = ${nome.trim().toLowerCase()}`)
    .limit(1);
  return result[0];
}

export async function updateTipoManutencao(id: number, data: Partial<InsertTipoManutencao>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(tiposManutencao).set(data).where(eq(tiposManutencao.id, id));
}

export async function deleteTipoManutencao(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(tiposManutencao).where(eq(tiposManutencao.id, id));
}
