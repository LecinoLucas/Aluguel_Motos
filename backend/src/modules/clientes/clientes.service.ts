import { TRPCError } from "@trpc/server";
import { type InsertCliente } from "../../../drizzle/schema";
import * as contratosService from "../contratos/contratos.service";
import {
  normalizeCep,
  normalizeCnh,
  normalizeCpf,
  normalizeRg,
  normalizeTelefone,
} from "../shared/document-normalization";
import * as clientesRepository from "./clientes.repository";

function normalizeClienteData(data: InsertCliente | Partial<InsertCliente>) {
  return {
    ...data,
    cpf: data.cpf ? normalizeCpf(data.cpf) : data.cpf,
    cnh: data.cnh ? normalizeCnh(data.cnh) : data.cnh,
    rg: data.rg ? normalizeRg(data.rg) : data.rg,
    cep: data.cep ? normalizeCep(data.cep) : data.cep,
    telefone: data.telefone ? normalizeTelefone(data.telefone) : data.telefone,
  };
}

export async function createCliente(data: InsertCliente) {
  const normalizedData = normalizeClienteData(data) as InsertCliente;
  const cpfExistente = await clientesRepository.getClienteByCpf(normalizedData.cpf);
  if (cpfExistente) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Cliente com este CPF já existe",
    });
  }

  await clientesRepository.createCliente(normalizedData);
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
  await clientesRepository.updateCliente(id, normalizeClienteData(data));
  return { success: true } as const;
}

export async function deleteCliente(id: number) {
  await getClienteById(id);
  const contratos = await contratosService.getContratosByLocatario(id);
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
