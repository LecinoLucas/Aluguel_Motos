import { desc, eq } from "drizzle-orm";
import { type InsertCliente, clientes } from "../../../drizzle/schema";
import { getDb } from "../../db";

export async function createCliente(data: InsertCliente) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(clientes).values(data);
}

export async function getClienteById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(clientes).where(eq(clientes.id, id)).limit(1);
  return result[0];
}

export async function listClientes() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(clientes).orderBy(desc(clientes.createdAt));
}

export async function updateCliente(id: number, data: Partial<InsertCliente>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(clientes).set(data).where(eq(clientes.id, id));
}

export async function deleteCliente(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(clientes).where(eq(clientes.id, id));
}

export async function getClienteByCpf(cpf: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(clientes).where(eq(clientes.cpf, cpf)).limit(1);
  return result[0];
}

export async function getClienteByNome(nome: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(clientes).where(eq(clientes.nome, nome)).orderBy(desc(clientes.createdAt));
}