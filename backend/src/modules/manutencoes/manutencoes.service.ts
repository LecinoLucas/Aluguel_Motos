import { TRPCError } from "@trpc/server";
import * as motosRepository from "../motos/motos.repository";
import * as manutencoesRepository from "./manutencoes.repository";

export async function createManutencao(input: {
  motoId: number;
  peca: string;
  tipo: string;
  data: Date;
  custo: number;
  kmAtual?: number;
  intervaloDiasPrevisto?: number;
  descricao?: string;
}) {
  const moto = await motosRepository.getMotoById(input.motoId);
  if (!moto) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Moto não encontrada",
    });
  }

  await manutencoesRepository.createManutencao({
    motoId: input.motoId,
    peca: input.peca.trim(),
    tipo: input.tipo,
    data: input.data,
    custo: input.custo.toString(),
    kmAtual: input.kmAtual,
    intervaloDiasPrevisto: input.intervaloDiasPrevisto,
    descricao: input.descricao,
  } as any);

  await motosRepository.updateMoto(input.motoId, { status: "manutencao" });

  return { success: true } as const;
}

export async function listManutencoes() {
  return manutencoesRepository.listManutencoes();
}

export async function getManutencaoById(id: number) {
  const manutencao = await manutencoesRepository.getManutencaoById(id);
  if (!manutencao) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Manutenção não encontrada",
    });
  }
  return manutencao;
}

export async function updateManutencao(
  id: number,
  data: { peca?: string; tipo?: string; custo?: string; kmAtual?: number; intervaloDiasPrevisto?: number; descricao?: string },
) {
  await getManutencaoById(id);
  await manutencoesRepository.updateManutencao(
    id,
    {
      ...data,
      peca: data.peca?.trim(),
    } as any,
  );
  return { success: true } as const;
}

export async function deleteManutencao(id: number) {
  await getManutencaoById(id);
  await manutencoesRepository.deleteManutencao(id);
  return { success: true } as const;
}

export async function getManutencoesByMoto(motoId: number) {
  return manutencoesRepository.getManutencoesByMoto(motoId);
}
