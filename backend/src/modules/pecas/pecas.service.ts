import { TRPCError } from "@trpc/server";
import { type InsertPeca } from "../../../drizzle/schema";
import * as pecasRepository from "./pecas.repository";

function normalizePecaData(data: InsertPeca | Partial<InsertPeca>) {
  return {
    ...data,
    nome: data.nome?.trim(),
    descricao: data.descricao?.trim() || null,
  };
}

export async function createPeca(data: InsertPeca) {
  const normalizedData = normalizePecaData(data) as InsertPeca;
  const existing = await pecasRepository.getPecaByNome(normalizedData.nome);

  if (existing) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Peça com este nome já existe",
    });
  }

  await pecasRepository.createPeca(normalizedData);
  return { success: true } as const;
}

export async function listPecas() {
  return pecasRepository.listPecas();
}

export async function getPecaById(id: number) {
  const peca = await pecasRepository.getPecaById(id);

  if (!peca) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Peça não encontrada",
    });
  }

  return peca;
}

export async function updatePeca(id: number, data: Partial<InsertPeca>) {
  await getPecaById(id);

  const normalizedData = normalizePecaData(data);
  if (normalizedData.nome) {
    const existing = await pecasRepository.getPecaByNome(normalizedData.nome);
    if (existing && existing.id !== id) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Peça com este nome já existe",
      });
    }
  }

  await pecasRepository.updatePeca(id, normalizedData);
  return { success: true } as const;
}

export async function deletePeca(id: number) {
  await getPecaById(id);
  await pecasRepository.deletePeca(id);
  return { success: true } as const;
}
