import { TRPCError } from "@trpc/server";
import { type InsertLocador } from "../../../drizzle/schema";
import {
  normalizeCep,
  normalizeCpf,
  normalizeRg,
  normalizeTelefone,
} from "../shared/document-normalization";
import * as locadoresRepository from "./locadores.repository";

function normalizeLocadorData(data: InsertLocador | Partial<InsertLocador>) {
  return {
    ...data,
    cpf: data.cpf ? normalizeCpf(data.cpf) : data.cpf,
    rg: data.rg ? normalizeRg(data.rg) : data.rg,
    cep: data.cep ? normalizeCep(data.cep) : data.cep,
    telefone: data.telefone ? normalizeTelefone(data.telefone) : data.telefone,
  };
}

export async function createLocador(data: InsertLocador) {
  const normalizedData = normalizeLocadorData(data) as InsertLocador;
  const cpfExistente = await locadoresRepository.getLocadorByCpf(normalizedData.cpf);
  if (cpfExistente) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Locador com este CPF já existe",
    });
  }

  await locadoresRepository.createLocador(normalizedData);
  return { success: true } as const;
}

export async function listLocadores() {
  return locadoresRepository.listLocadores();
}

export async function getLocadorById(id: number) {
  const locador = await locadoresRepository.getLocadorById(id);
  if (!locador) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Locador não encontrado",
    });
  }

  return locador;
}

export async function updateLocador(id: number, data: Partial<InsertLocador>) {
  await getLocadorById(id);
  await locadoresRepository.updateLocador(id, normalizeLocadorData(data));
  return { success: true } as const;
}

export async function deleteLocador(id: number) {
  await getLocadorById(id);
  await locadoresRepository.deleteLocador(id);
  return { success: true } as const;
}
