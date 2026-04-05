import { TRPCError } from "@trpc/server";
import { type InsertTipoManutencao } from "../../../drizzle/schema";
import * as tiposManutencaoRepository from "./tipos-manutencao.repository";

function normalizeTipoManutencaoData(
  data: InsertTipoManutencao | Partial<InsertTipoManutencao>,
) {
  return {
    ...data,
    nome: data.nome?.trim(),
    descricao: data.descricao?.trim() || null,
  };
}

export async function createTipoManutencao(data: InsertTipoManutencao) {
  const normalizedData = normalizeTipoManutencaoData(data) as InsertTipoManutencao;
  const existing = await tiposManutencaoRepository.getTipoManutencaoByNome(normalizedData.nome);

  if (existing) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Tipo de manutenção com este nome já existe",
    });
  }

  await tiposManutencaoRepository.createTipoManutencao(normalizedData);
  return { success: true } as const;
}

export async function listTiposManutencao() {
  return tiposManutencaoRepository.listTiposManutencao();
}

export async function getTipoManutencaoById(id: number) {
  const tipo = await tiposManutencaoRepository.getTipoManutencaoById(id);

  if (!tipo) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Tipo de manutenção não encontrado",
    });
  }

  return tipo;
}

export async function updateTipoManutencao(id: number, data: Partial<InsertTipoManutencao>) {
  await getTipoManutencaoById(id);

  const normalizedData = normalizeTipoManutencaoData(data);
  if (normalizedData.nome) {
    const existing = await tiposManutencaoRepository.getTipoManutencaoByNome(normalizedData.nome);
    if (existing && existing.id !== id) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Tipo de manutenção com este nome já existe",
      });
    }
  }

  await tiposManutencaoRepository.updateTipoManutencao(id, normalizedData);
  return { success: true } as const;
}

export async function deleteTipoManutencao(id: number) {
  await getTipoManutencaoById(id);
  await tiposManutencaoRepository.deleteTipoManutencao(id);
  return { success: true } as const;
}
