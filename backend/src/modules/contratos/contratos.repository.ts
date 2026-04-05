import { desc, eq, inArray } from "drizzle-orm";
import { type InsertContrato, contratos, contratosLocadores, locadores } from "../../../drizzle/schema";
import { getDb } from "../../db";

async function mapLocadoresPorContrato(contratoIds: number[]) {
  if (contratoIds.length === 0) {
    return new Map<number, Array<{ id: number; nome: string | null; cpf: string | null }>>();
  }

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const rows = await db
    .select({
      contratoId: contratosLocadores.contratoId,
      id: locadores.id,
      nome: locadores.nome,
      cpf: locadores.cpf,
    })
    .from(contratosLocadores)
    .innerJoin(locadores, eq(contratosLocadores.locadorId, locadores.id))
    .where(inArray(contratosLocadores.contratoId, contratoIds));

  const map = new Map<number, Array<{ id: number; nome: string | null; cpf: string | null }>>();
  for (const row of rows) {
    const current = map.get(row.contratoId) ?? [];
    current.push({
      id: row.id,
      nome: row.nome,
      cpf: row.cpf,
    });
    map.set(row.contratoId, current);
  }

  return map;
}

async function enrichContratoLocadores<T extends { id: number }>(contrato: T) {
  const locadoresPorContrato = await mapLocadoresPorContrato([contrato.id]);
  const contratoLocadores = locadoresPorContrato.get(contrato.id) ?? [];

  return {
    ...contrato,
    locadores: contratoLocadores,
    locadorIds: contratoLocadores.map((item) => item.id),
  };
}

export async function createContrato(data: InsertContrato) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [created] = await db.insert(contratos).values(data).returning();
  return created;
}

export async function setContratoLocadores(contratoId: number, locadorIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(contratosLocadores).where(eq(contratosLocadores.contratoId, contratoId));

  if (locadorIds.length === 0) {
    return;
  }

  await db.insert(contratosLocadores).values(
    locadorIds.map((locadorId) => ({
      contratoId,
      locadorId,
    })),
  );
}

export async function getContratoById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(contratos).where(eq(contratos.id, id)).limit(1);
  const contrato = result[0];
  return contrato ? enrichContratoLocadores(contrato) : undefined;
}

export async function listContratos(status?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let query: any = db.select().from(contratos);
  if (status) {
    query = query.where(eq(contratos.status, status as any));
  }
  const rows = await query.orderBy(desc(contratos.createdAt));
  const locadoresPorContrato = await mapLocadoresPorContrato(rows.map((row: { id: number }) => row.id));

  return rows.map((row: { id: number }) => {
    const contratoLocadores = locadoresPorContrato.get(row.id) ?? [];
    return {
      ...row,
      locadores: contratoLocadores,
      locadorIds: contratoLocadores.map((item) => item.id),
    };
  });
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

export async function getContratosByLocatario(locatarioId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(contratos).where(eq(contratos.locatarioId, locatarioId)).orderBy(desc(contratos.createdAt));
}

export async function getContratosByMoto(motoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(contratos).where(eq(contratos.motoId, motoId)).orderBy(desc(contratos.createdAt));
}
