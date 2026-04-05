import type { ExtractedDocumentFields } from "@/features/gerar-contrato/types";
import type { LocadorFormData, LocatarioFormData, VeiculoFormData } from "./types";

function getVehicleYears(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return { ano: "", anoModelo: "" };
  }

  const [ano, anoModelo] = normalized.split("/").map((item) => item?.trim() || "");

  return {
    ano,
    anoModelo: anoModelo || ano,
  };
}

export function applyLocadorImport(form: LocadorFormData, fields: Partial<ExtractedDocumentFields>): LocadorFormData {
  return {
    ...form,
    nome: fields.nome || form.nome,
    cpf: fields.cpf || form.cpf,
    rg: fields.rg || form.rg,
    orgaoEmissor: fields.orgaoEmissor || form.orgaoEmissor,
    endereco: fields.endereco || form.endereco,
    cidade: fields.cidade || form.cidade,
    estado: fields.estado || form.estado,
    cep: fields.cep || form.cep,
    telefone: fields.telefone || form.telefone,
  };
}

export function applyLocatarioCnhImport(
  form: LocatarioFormData,
  fields: Partial<ExtractedDocumentFields>,
): LocatarioFormData {
  return {
    ...form,
    nome: fields.nome || form.nome,
    cpf: fields.cpf || form.cpf,
    cnh: fields.cnh || form.cnh,
    rg: fields.rg || form.rg,
    orgaoEmissor: fields.orgaoEmissor || form.orgaoEmissor,
    estado: fields.estado || form.estado,
    telefone: fields.telefone || form.telefone,
  };
}

export function applyLocatarioComprovanteImport(
  form: LocatarioFormData,
  fields: Partial<ExtractedDocumentFields>,
): LocatarioFormData {
  return {
    ...form,
    nome: form.nome || fields.nome || "",
    cpf: form.cpf || fields.cpf || "",
    endereco: fields.endereco || form.endereco,
    cidade: fields.cidade || form.cidade,
    estado: fields.estado || form.estado,
    cep: fields.cep || form.cep,
    telefone: form.telefone || fields.telefone || "",
  };
}

export function applyVeiculoImport(form: VeiculoFormData, fields: Partial<ExtractedDocumentFields>): VeiculoFormData {
  const { ano, anoModelo } = getVehicleYears(fields.ano || "");

  return {
    ...form,
    marca: fields.marca || form.marca,
    modelo: fields.modelo || form.modelo,
    placa: fields.placa || form.placa,
    ano: ano || form.ano,
    anoModelo: anoModelo || form.anoModelo,
    cor: fields.cor || form.cor,
    chassi: fields.chassi || form.chassi,
    renavam: fields.renavam || form.renavam,
  };
}