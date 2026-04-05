import { TRPCError } from "@trpc/server";
import { type InsertMoto } from "../../../drizzle/schema";
import { normalizeChassi, normalizePlaca, normalizeRenavam } from "../shared/document-normalization";
import * as motosRepository from "./motos.repository";

function normalizeMotoData(data: InsertMoto | Partial<InsertMoto>) {
  return {
    ...data,
    placa: data.placa ? normalizePlaca(data.placa) : data.placa,
    chassi: data.chassi ? normalizeChassi(data.chassi) : data.chassi,
    renavam: data.renavam ? normalizeRenavam(data.renavam) : data.renavam,
  };
}

export async function createMoto(data: InsertMoto) {
  const normalizedData = normalizeMotoData(data) as InsertMoto;
  const existente = await motosRepository.getMotoByPlaca(normalizedData.placa);
  if (existente) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Moto com esta placa já existe",
    });
  }

  await motosRepository.createMoto(normalizedData);
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
  await motosRepository.updateMoto(id, normalizeMotoData(data));
  return { success: true } as const;
}

export async function deleteMoto(id: number) {
  await getMotoById(id);
  await motosRepository.deleteMoto(id);
  return { success: true } as const;
}
