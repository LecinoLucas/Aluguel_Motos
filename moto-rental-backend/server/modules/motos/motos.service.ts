import { TRPCError } from "@trpc/server";
import { type InsertMoto } from "../../../drizzle/schema";
import * as motosRepository from "./motos.repository";

export async function createMoto(data: InsertMoto) {
  const existente = await motosRepository.getMotoByPlaca(data.placa);
  if (existente) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Moto com esta placa já existe",
    });
  }

  await motosRepository.createMoto(data);
  return { success: true } as const;
}

export async function listMotos(status?: string) {
  return motosRepository.listMotos(status);
}

export async function getMotoById(id: number) {
  const moto = await motosRepository.getMotoById(id);
  if (!moto) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Moto não encontrada",
    });
  }
  return moto;
}

export async function updateMoto(id: number, data: Partial<InsertMoto>) {
  await getMotoById(id);
  await motosRepository.updateMoto(id, data);
  return { success: true } as const;
}

export async function deleteMoto(id: number) {
  await getMotoById(id);
  await motosRepository.deleteMoto(id);
  return { success: true } as const;
}