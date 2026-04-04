import { TRPCError } from "@trpc/server";
import { type InsertLocador } from "../../../drizzle/schema";
import * as locadoresRepository from "./locadores.repository";

export async function createLocador(data: InsertLocador) {
  const cpfExistente = await locadoresRepository.getLocadorByCpf(data.cpf);
  if (cpfExistente) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Locador com este CPF já existe",
    });
  }

  await locadoresRepository.createLocador(data);
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
  await locadoresRepository.updateLocador(id, data);
  return { success: true } as const;
}

export async function deleteLocador(id: number) {
  await getLocadorById(id);
  await locadoresRepository.deleteLocador(id);
  return { success: true } as const;
}