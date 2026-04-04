import { TRPCError } from "@trpc/server";
import { type InsertCliente } from "../../../drizzle/schema";
import * as contratosService from "../contratos/contratos.service";
import * as clientesRepository from "./clientes.repository";

export async function createCliente(data: InsertCliente) {
  const cpfExistente = await clientesRepository.getClienteByCpf(data.cpf);
  if (cpfExistente) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Cliente com este CPF já existe",
    });
  }

  await clientesRepository.createCliente(data);
  return { success: true } as const;
}

export async function listClientes() {
  return clientesRepository.listClientes();
}

export async function getClienteById(id: number) {
  const cliente = await clientesRepository.getClienteById(id);
  if (!cliente) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Cliente não encontrado",
    });
  }
  return cliente;
}

export async function updateCliente(id: number, data: Partial<InsertCliente>) {
  await getClienteById(id);
  await clientesRepository.updateCliente(id, data);
  return { success: true } as const;
}

export async function deleteCliente(id: number) {
  await getClienteById(id);
  const contratos = await contratosService.getContratosByCliente(id);
  if (contratos.length > 0) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Não é possível deletar cliente com contratos ativos",
    });
  }
  await clientesRepository.deleteCliente(id);
  return { success: true } as const;
}

export async function getClienteByNome(nome: string) {
  return clientesRepository.getClienteByNome(nome);
}