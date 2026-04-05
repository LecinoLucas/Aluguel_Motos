import { and, desc, eq, gte, lte } from "drizzle-orm";
import { type InsertPagamento, pagamentos } from "../../../drizzle/schema";
import { getDb } from "../../db";

export async function createPagamento(data: InsertPagamento) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(pagamentos).values(data);
}

export async function getPagamentoById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(pagamentos).where(eq(pagamentos.id, id)).limit(1);
  return result[0];
}

export async function listPagamentos(filters?: { status?: string; tipo?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let query: any = db.select().from(pagamentos);
  if (filters?.status && filters?.tipo) {
    query = query.where(and(eq(pagamentos.status, filters.status as any), eq(pagamentos.tipo, filters.tipo as any)));
  } else if (filters?.status) {
    query = query.where(eq(pagamentos.status, filters.status as any));
  } else if (filters?.tipo) {
    query = query.where(eq(pagamentos.tipo, filters.tipo as any));
  }
  return query.orderBy(desc(pagamentos.createdAt));
}

export async function updatePagamento(id: number, data: Partial<InsertPagamento>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(pagamentos).set(data).where(eq(pagamentos.id, id));
}

export async function deletePagamento(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(pagamentos).where(eq(pagamentos.id, id));
}

export async function getPagamentosByContrato(contratoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(pagamentos).where(eq(pagamentos.contratoId, contratoId)).orderBy(desc(pagamentos.createdAt));
}

export async function getPagamentoByManutencaoId(manutencaoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(pagamentos).where(eq(pagamentos.manutencaoId, manutencaoId)).limit(1);
  return result[0];
}

export async function getPagamentosByPeriodo(dataInicio: Date, dataFim: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(pagamentos)
    .where(and(gte(pagamentos.data, dataInicio), lte(pagamentos.data, dataFim)))
    .orderBy(desc(pagamentos.createdAt));
}
