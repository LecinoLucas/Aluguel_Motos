import { desc, eq } from "drizzle-orm";
import { type InsertMoto, motos } from "../../../drizzle/schema";
import { getDb } from "../../db";

export async function createMoto(data: InsertMoto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(motos).values(data);
}

export async function getMotoById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(motos).where(eq(motos.id, id)).limit(1);
  return result[0];
}

export async function listMotos(status?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let query: any = db.select().from(motos);
  if (status) {
    query = query.where(eq(motos.status, status as any));
  }
  return query.orderBy(desc(motos.createdAt));
}

export async function updateMoto(id: number, data: Partial<InsertMoto>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(motos).set(data).where(eq(motos.id, id));
}

export async function deleteMoto(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(motos).where(eq(motos.id, id));
}

export async function getMotoByPlaca(placa: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(motos).where(eq(motos.placa, placa)).limit(1);
  return result[0];
}