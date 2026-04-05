import { TRPCError } from "@trpc/server";
import * as validations from "../../validations";
import * as motosRepository from "../motos/motos.repository";
import * as clientesRepository from "../clientes/clientes.repository";
import * as contratosRepository from "./contratos.repository";

export async function createContrato(input: {
  clienteId: number;
  motoId: number;
  dataInicio: Date;
  dataFim: Date;
  valorDiario: number;
}) {
  const cliente = await clientesRepository.getClienteById(input.clienteId);
  if (!cliente) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Cliente não encontrado",
    });
  }

  const moto = await motosRepository.getMotoById(input.motoId);
  if (!moto) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Moto não encontrada",
    });
  }

  if (!validations.motoDisponivel(moto.status)) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Moto não está disponível para aluguel",
    });
  }

  if (!validations.validarPeriodoContrato(input.dataInicio, input.dataFim)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Data de fim deve ser posterior à data de início",
    });
  }

  await contratosRepository.createContrato({
    clienteId: input.clienteId,
    motoId: input.motoId,
    dataInicio: input.dataInicio,
    dataFim: input.dataFim,
    valorDiario: input.valorDiario.toString(),
    status: "ativo",
  } as any);

  await motosRepository.updateMoto(input.motoId, { status: "alugada" });

  return { success: true } as const;
}

export async function listContratos(status?: string) {
  return contratosRepository.listContratos(status);
}

export async function getContratoById(id: number) {
  const contrato = await contratosRepository.getContratoById(id);
  if (!contrato) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Contrato não encontrado",
    });
  }
  return contrato;
}

export async function updateContrato(id: number, data: { status?: "ativo" | "encerrado" | "cancelado"; dataFim?: Date }) {
  await getContratoById(id);
  await contratosRepository.updateContrato(id, data as any);
  return { success: true } as const;
}

export async function deleteContrato(id: number) {
  await getContratoById(id);
  await contratosRepository.deleteContrato(id);
  return { success: true } as const;
}

export async function getContratosByCliente(clienteId: number) {
  return contratosRepository.getContratosByCliente(clienteId);
}

export async function getContratosByMoto(motoId: number) {
  return contratosRepository.getContratosByMoto(motoId);
}