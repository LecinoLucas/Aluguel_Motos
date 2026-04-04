import { desc, eq } from "drizzle-orm";
import { type InsertContrato, contratos } from "../../../drizzle/schema";
import { getDb } from "../../db";

export async function createContrato(data: InsertContrato) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(contratos).values(data);
}

export async function getContratoById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(contratos).where(eq(contratos.id, id)).limit(1);
  return result[0];
}

export async function listContratos(status?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let query: any = db.select().from(contratos);
  if (status) {
    query = query.where(eq(contratos.status, status as any));
  }
  return query.orderBy(desc(contratos.createdAt));
}

export async function updateContrato(id: number, data: Partial<InsertContrato>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(contratos).set(data).where(eq(contratos.id, id));
}

export async function deleteContrato(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(contratos).where(eq(contratos.id, id));
}

export async function getContratosByCliente(clienteId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(contratos).where(eq(contratos.clienteId, clienteId)).orderBy(desc(contratos.createdAt));
}

export async function getContratosByMoto(motoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(contratos).where(eq(contratos.motoId, motoId)).orderBy(desc(contratos.createdAt));
}