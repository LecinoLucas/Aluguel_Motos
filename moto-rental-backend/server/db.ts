import { eq, and, gte, lte, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  InsertUser,
  users,
  motos,
  clientes,
  contratos,
  pagamentos,
  notificacoes,
  InsertMoto,
  InsertCliente,
  InsertContrato,
  InsertPagamento,
  InsertNotificacao,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ==================== MOTOS ====================

export async function createMoto(data: InsertMoto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(motos).values(data);
  return result;
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
  const result = await db
    .select()
    .from(motos)
    .where(eq(motos.placa, placa))
    .limit(1);
  return result[0];
}

// ==================== CLIENTES ====================

export async function createCliente(data: InsertCliente) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(clientes).values(data);
}

export async function getClienteById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select()
    .from(clientes)
    .where(eq(clientes.id, id))
    .limit(1);
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
  const result = await db
    .select()
    .from(clientes)
    .where(eq(clientes.cpf, cpf))
    .limit(1);
  return result[0];
}

export async function getClienteByNome(nome: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(clientes)
    .where(eq(clientes.nome, nome))
    .orderBy(desc(clientes.createdAt));
}

// ==================== LOCADORES ====================

// ==================== CONTRATOS ====================

// ==================== PAGAMENTOS ====================

// ==================== NOTIFICAÇÕES ====================

export async function createNotificacao(data: InsertNotificacao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(notificacoes).values(data);
}

export async function listNotificacoes() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(notificacoes).orderBy(desc(notificacoes.enviada));
}

export async function getNotificacoesByContrato(contratoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(notificacoes)
    .where(eq(notificacoes.contratoId, contratoId))
    .orderBy(desc(notificacoes.enviada));
}
