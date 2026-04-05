import "dotenv/config";

import { eq } from "drizzle-orm";

import { clientes, locadores, motos } from "../drizzle/schema";
import { getDb } from "../src/db";
import {
  normalizeCep,
  normalizeCnh,
  normalizeChassi,
  normalizeCpf,
  normalizePlaca,
  normalizeRenavam,
  normalizeRg,
  normalizeTelefone,
} from "../src/modules/shared/document-normalization";

type ClienteRow = typeof clientes.$inferSelect;
type LocadorRow = typeof locadores.$inferSelect;
type MotoRow = typeof motos.$inferSelect;

type Collision = {
  field: string;
  value: string;
  ids: number[];
};

type InvalidValue = {
  entity: string;
  id: number;
  field: string;
  value: string | null;
};

const args = new Set(process.argv.slice(2));
const isDryRun = args.has("--dry-run") || !args.has("--apply");

function normalizeCliente(row: ClienteRow) {
  return {
    cpf: row.cpf ? normalizeCpf(row.cpf) : row.cpf,
    cnh: row.cnh ? normalizeCnh(row.cnh) : row.cnh,
    rg: row.rg ? normalizeRg(row.rg) : row.rg,
    cep: row.cep ? normalizeCep(row.cep) : row.cep,
    telefone: row.telefone ? normalizeTelefone(row.telefone) : row.telefone,
  };
}

function normalizeLocador(row: LocadorRow) {
  return {
    cpf: row.cpf ? normalizeCpf(row.cpf) : row.cpf,
    rg: row.rg ? normalizeRg(row.rg) : row.rg,
    cep: row.cep ? normalizeCep(row.cep) : row.cep,
    telefone: row.telefone ? normalizeTelefone(row.telefone) : row.telefone,
  };
}

function normalizeMoto(row: MotoRow) {
  return {
    placa: row.placa ? normalizePlaca(row.placa) : row.placa,
    chassi: row.chassi ? normalizeChassi(row.chassi) : row.chassi,
    renavam: row.renavam ? normalizeRenavam(row.renavam) : row.renavam,
  };
}

function collectCollisions<T extends { id: number }>(
  entity: string,
  rows: T[],
  getValue: (row: T) => string | null | undefined,
  field: string,
) {
  const groups = new Map<string, number[]>();

  for (const row of rows) {
    const value = getValue(row);
    if (!value) continue;
    const ids = groups.get(value) ?? [];
    ids.push(row.id);
    groups.set(value, ids);
  }

  const collisions: Collision[] = [];
  for (const [value, ids] of Array.from(groups.entries())) {
    if (ids.length > 1) {
      collisions.push({
        field: `${entity}.${field}`,
        value,
        ids,
      });
    }
  }

  return collisions;
}

function diffFields<T extends Record<string, string | null | undefined>>(
  current: T,
  normalized: T,
) {
  const changedEntries = Object.entries(normalized).filter(([key, value]) => current[key] !== value);
  return Object.fromEntries(changedEntries) as Partial<T>;
}

async function main() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available. Confira o DATABASE_URL no backend/.env.");
  }

  const [clientesRows, locadoresRows, motosRows] = await Promise.all([
    db.select().from(clientes),
    db.select().from(locadores),
    db.select().from(motos),
  ]);

  const clienteUpdates = clientesRows
    .map((row) => ({
      id: row.id,
      current: row,
      normalized: normalizeCliente(row),
    }))
    .map(({ id, current, normalized }) => ({
      id,
      changes: diffFields(
        {
          cpf: current.cpf,
          cnh: current.cnh,
          rg: current.rg,
          cep: current.cep,
          telefone: current.telefone,
        },
        normalized,
      ),
    }))
    .filter((row) => Object.keys(row.changes).length > 0);

  const locadorUpdates = locadoresRows
    .map((row) => ({
      id: row.id,
      current: row,
      normalized: normalizeLocador(row),
    }))
    .map(({ id, current, normalized }) => ({
      id,
      changes: diffFields(
        {
          cpf: current.cpf,
          rg: current.rg,
          cep: current.cep,
          telefone: current.telefone,
        },
        normalized,
      ),
    }))
    .filter((row) => Object.keys(row.changes).length > 0);

  const normalizedClientes = clientesRows.map((row) => ({
    id: row.id,
    cpf: row.cpf ? normalizeCpf(row.cpf) : row.cpf,
    cnh: row.cnh ? normalizeCnh(row.cnh) : row.cnh,
  }));
  const normalizedLocadores = locadoresRows.map((row) => ({
    id: row.id,
    cpf: row.cpf ? normalizeCpf(row.cpf) : row.cpf,
  }));
  const motoUpdates = motosRows
    .map((row) => ({
      id: row.id,
      current: row,
      normalized: normalizeMoto(row),
    }))
    .map(({ id, current, normalized }) => ({
      id,
      changes: diffFields(
        {
          placa: current.placa,
          chassi: current.chassi,
          renavam: current.renavam,
        },
        normalized,
      ),
    }))
    .filter((row) => Object.keys(row.changes).length > 0);
  const normalizedMotos = motosRows.map((row) => ({
    id: row.id,
    placa: row.placa ? normalizePlaca(row.placa) : row.placa,
  }));

  const collisions = [
    ...collectCollisions("clientes", normalizedClientes, (row) => row.cpf, "cpf"),
    ...collectCollisions("clientes", normalizedClientes, (row) => row.cnh, "cnh"),
    ...collectCollisions("locadores", normalizedLocadores, (row) => row.cpf, "cpf"),
    ...collectCollisions("motos", normalizedMotos, (row) => row.placa, "placa"),
  ];

  const invalidValues: InvalidValue[] = [];
  for (const row of normalizedClientes) {
    if (!row.cpf || row.cpf.length !== 11) {
      invalidValues.push({
        entity: "clientes",
        id: row.id,
        field: "cpf",
        value: row.cpf,
      });
    }
    if (!row.cnh || row.cnh.length !== 11) {
      invalidValues.push({
        entity: "clientes",
        id: row.id,
        field: "cnh",
        value: row.cnh,
      });
    }
  }

  for (const row of normalizedLocadores) {
    if (!row.cpf || row.cpf.length !== 11) {
      invalidValues.push({
        entity: "locadores",
        id: row.id,
        field: "cpf",
        value: row.cpf,
      });
    }
  }

  for (const row of normalizedMotos) {
    if (!row.placa || row.placa.length !== 7) {
      invalidValues.push({
        entity: "motos",
        id: row.id,
        field: "placa",
        value: row.placa,
      });
    }
  }

  console.log("[Normalize Legacy] Resumo inicial");
  console.log(`- Clientes encontrados: ${clientesRows.length}`);
  console.log(`- Locadores encontrados: ${locadoresRows.length}`);
  console.log(`- Motos encontradas: ${motosRows.length}`);
  console.log(`- Clientes com ajuste: ${clienteUpdates.length}`);
  console.log(`- Locadores com ajuste: ${locadorUpdates.length}`);
  console.log(`- Motos com ajuste: ${motoUpdates.length}`);

  if (clienteUpdates.length > 0) {
    console.log("[Normalize Legacy] Clientes que seriam atualizados:");
    for (const update of clienteUpdates) {
      console.log(`  - cliente #${update.id}: ${Object.keys(update.changes).join(", ")}`);
    }
  }

  if (locadorUpdates.length > 0) {
    console.log("[Normalize Legacy] Locadores que seriam atualizados:");
    for (const update of locadorUpdates) {
      console.log(`  - locador #${update.id}: ${Object.keys(update.changes).join(", ")}`);
    }
  }

  if (motoUpdates.length > 0) {
    console.log("[Normalize Legacy] Motos que seriam atualizadas:");
    for (const update of motoUpdates) {
      console.log(`  - moto #${update.id}: ${Object.keys(update.changes).join(", ")}`);
    }
  }

  if (invalidValues.length > 0) {
    console.error("[Normalize Legacy] Existem registros inválidos após normalização.");
    for (const invalid of invalidValues) {
      console.error(
        `  - ${invalid.entity} #${invalid.id}: campo ${invalid.field} ficou inválido (${invalid.value ?? "vazio"})`,
      );
    }
    process.exitCode = 1;
    return;
  }

  if (collisions.length > 0) {
    console.error("[Normalize Legacy] Encontramos colisões que precisam de revisão manual.");
    for (const collision of collisions) {
      console.error(
        `  - ${collision.field}=${collision.value} aparece nos IDs ${collision.ids.join(", ")}`,
      );
    }
    process.exitCode = 1;
    return;
  }

  if (isDryRun) {
    console.log("[Normalize Legacy] Dry-run concluído. Nenhuma alteração foi gravada.");
    return;
  }

  await db.transaction(async (tx) => {
    for (const update of clienteUpdates) {
      await tx.update(clientes).set(update.changes).where(eq(clientes.id, update.id));
    }

    for (const update of locadorUpdates) {
      await tx.update(locadores).set(update.changes).where(eq(locadores.id, update.id));
    }

    for (const update of motoUpdates) {
      await tx.update(motos).set(update.changes).where(eq(motos.id, update.id));
    }
  });

  console.log("[Normalize Legacy] Limpeza concluída com sucesso.");
  console.log(`- Clientes atualizados: ${clienteUpdates.length}`);
  console.log(`- Locadores atualizados: ${locadorUpdates.length}`);
  console.log(`- Motos atualizadas: ${motoUpdates.length}`);
}

main().catch((error) => {
  console.error("[Normalize Legacy] Falha ao normalizar registros antigos.");
  console.error(error);
  process.exitCode = 1;
});
