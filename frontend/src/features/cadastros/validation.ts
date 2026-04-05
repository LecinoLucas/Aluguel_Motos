import type {
  LocadorFormData,
  LocadorFormErrors,
  LocatarioFormData,
  LocatarioFormErrors,
  TipoManutencaoFormData,
  TipoManutencaoFormErrors,
  VeiculoFormData,
  VeiculoFormErrors,
} from "./types";

export function isCpfLike(value: string) {
  return value.replace(/\D/g, "").length === 11;
}

export function isCnhLike(value: string) {
  return value.replace(/\D/g, "").length === 11;
}

export function isPhoneLike(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11;
}

export function isCepLike(value: string) {
  return value.replace(/\D/g, "").length === 8;
}

export function isPlateLike(value: string) {
  const plate = value.replace(/\s/g, "").toUpperCase();
  return /^[A-Z]{3}-\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/.test(plate);
}

export function isChassiLike(value: string) {
  const chassi = value.replace(/\s/g, "").toUpperCase();
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(chassi);
}

export function isRenavamLike(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 11;
}

function isEmailLike(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function hasValidationErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean);
}

export function getValidationMessages(errors: Record<string, string | undefined>) {
  return Array.from(new Set(Object.values(errors).filter((value): value is string => Boolean(value))));
}

export function validateLocadorForm(form: LocadorFormData, requireCpf = true): LocadorFormErrors {
  const errors: LocadorFormErrors = {};

  if (!form.nome.trim()) errors.nome = "Informe o nome completo do locador.";
  else if (form.nome.trim().length < 3) errors.nome = "Nome do locador precisa ter pelo menos 3 caracteres.";

  if (requireCpf) {
    if (!form.cpf.trim()) errors.cpf = "Informe o CPF do locador.";
    else if (!isCpfLike(form.cpf)) errors.cpf = "CPF do locador deve ter 11 dígitos.";
  }

  if (!form.rg.trim()) errors.rg = "Informe o RG do locador.";
  else if (form.rg.trim().length < 4) errors.rg = "RG do locador parece incompleto.";

  if (!form.orgaoEmissor.trim()) errors.orgaoEmissor = "Informe o órgão emissor do RG.";
  if (!form.nacionalidade.trim()) errors.nacionalidade = "Informe a nacionalidade do locador.";
  if (!form.estadoCivil.trim()) errors.estadoCivil = "Informe o estado civil do locador.";

  if (!form.endereco.trim()) errors.endereco = "Informe o endereço completo do locador.";
  else if (form.endereco.trim().length < 8) errors.endereco = "Endereço do locador está curto demais.";

  if (!form.cidade.trim()) errors.cidade = "Informe a cidade do locador.";
  if (!form.estado.trim()) errors.estado = "Informe o estado do locador.";
  else if (form.estado.trim().length < 2) errors.estado = "Use ao menos a sigla do estado, como GO ou SP.";

  if (!form.cep.trim()) errors.cep = "Informe o CEP do locador.";
  else if (!isCepLike(form.cep)) errors.cep = "CEP do locador deve ter 8 dígitos.";

  if (!form.telefone.trim()) errors.telefone = "Informe o telefone do locador.";
  else if (!isPhoneLike(form.telefone)) errors.telefone = "Telefone deve ter DDD e 10 ou 11 dígitos.";

  return errors;
}

export function validateLocatarioForm(
  form: LocatarioFormData,
  requireImmutableFields = true,
): LocatarioFormErrors {
  const errors: LocatarioFormErrors = {};

  if (!form.nome.trim()) errors.nome = "Informe o nome completo do locatário.";
  else if (form.nome.trim().length < 3) errors.nome = "Nome do locatário precisa ter pelo menos 3 caracteres.";

  if (requireImmutableFields) {
    if (!form.cpf.trim()) errors.cpf = "Informe o CPF do locatário.";
    else if (!isCpfLike(form.cpf)) errors.cpf = "CPF do locatário deve ter 11 dígitos.";

    if (!form.cnh.trim()) errors.cnh = "Informe a CNH do locatário.";
    else if (!isCnhLike(form.cnh)) errors.cnh = "CNH do locatário deve ter 11 dígitos.";
  }

  if (!form.rg.trim()) errors.rg = "Informe o RG do locatário.";
  else if (form.rg.trim().length < 4) errors.rg = "RG do locatário parece incompleto.";

  if (!form.orgaoEmissor.trim()) errors.orgaoEmissor = "Informe o órgão emissor do RG.";
  if (!form.nacionalidade.trim()) errors.nacionalidade = "Informe a nacionalidade do locatário.";
  if (!form.estadoCivil.trim()) errors.estadoCivil = "Informe o estado civil do locatário.";

  if (!form.endereco.trim()) errors.endereco = "Informe o endereço completo do locatário.";
  else if (form.endereco.trim().length < 8) errors.endereco = "Endereço do locatário está curto demais.";

  if (!form.cidade.trim()) errors.cidade = "Informe a cidade do locatário.";
  if (!form.estado.trim()) errors.estado = "Informe o estado do locatário.";
  else if (form.estado.trim().length < 2) errors.estado = "Use ao menos a sigla do estado, como GO ou SP.";

  if (!form.cep.trim()) errors.cep = "Informe o CEP do locatário.";
  else if (!isCepLike(form.cep)) errors.cep = "CEP do locatário deve ter 8 dígitos.";

  if (form.email.trim() && !isEmailLike(form.email)) {
    errors.email = "Email inválido. Exemplo: nome@dominio.com";
  }

  if (!form.telefone.trim()) errors.telefone = "Informe o telefone do locatário.";
  else if (!isPhoneLike(form.telefone)) errors.telefone = "Telefone deve ter DDD e 10 ou 11 dígitos.";

  return errors;
}

export function validateVeiculoForm(form: VeiculoFormData): VeiculoFormErrors {
  const currentYear = new Date().getFullYear();
  const ano = Number(form.ano);
  const anoModelo = Number(form.anoModelo);
  const errors: VeiculoFormErrors = {};

  if (!form.marca.trim()) errors.marca = "Informe a marca do veículo.";
  else if (form.marca.trim().length < 2) errors.marca = "Marca do veículo está curta demais.";

  if (!form.modelo.trim()) errors.modelo = "Informe o modelo do veículo.";
  else if (form.modelo.trim().length < 3) errors.modelo = "Modelo do veículo precisa ter pelo menos 3 caracteres.";

  if (!form.placa.trim()) errors.placa = "Informe a placa do veículo.";
  else if (!isPlateLike(form.placa)) errors.placa = "Placa inválida. Use ABC-1234 ou ABC1D23.";

  if (!form.ano.trim()) errors.ano = "Informe o ano de fabricação.";
  else if (!Number.isInteger(ano) || ano < 1900 || ano > currentYear) {
    errors.ano = `Ano de fabricação deve estar entre 1900 e ${currentYear}.`;
  }

  if (!form.anoModelo.trim()) errors.anoModelo = "Informe o ano modelo.";
  else if (!Number.isInteger(anoModelo) || anoModelo < 1900 || anoModelo > currentYear + 1) {
    errors.anoModelo = `Ano modelo deve estar entre 1900 e ${currentYear + 1}.`;
  } else if (Number.isInteger(ano) && Math.abs(anoModelo - ano) > 1) {
    errors.anoModelo = "Ano modelo deve ser igual ao ano de fabricação ou no máximo 1 ano diferente.";
  }

  if (!form.cor.trim()) errors.cor = "Informe a cor do veículo.";
  if (!form.chassi.trim()) errors.chassi = "Informe o chassi do veículo.";
  else if (!isChassiLike(form.chassi)) errors.chassi = "Chassi inválido. Use os 17 caracteres do documento.";

  if (!form.renavam.trim()) errors.renavam = "Informe o RENAVAM do veículo.";
  else if (!isRenavamLike(form.renavam)) errors.renavam = "RENAVAM inválido. Confira os dígitos do documento.";

  return errors;
}

export function validateTipoManutencaoForm(form: TipoManutencaoFormData): TipoManutencaoFormErrors {
  const errors: TipoManutencaoFormErrors = {};
  const intervalo = Number(form.intervaloDiasPadrao);

  if (!form.nome.trim()) errors.nome = "Informe o nome do tipo de manutenção.";
  else if (form.nome.trim().length < 2) errors.nome = "O nome do tipo precisa ter pelo menos 2 caracteres.";

  if (form.descricao.trim() && form.descricao.trim().length > 240) {
    errors.descricao = "A descrição pode ter no máximo 240 caracteres.";
  }

  if (form.intervaloDiasPadrao.trim()) {
    if (!Number.isInteger(intervalo) || intervalo <= 0) {
      errors.intervaloDiasPadrao = "O intervalo padrão deve ser um número inteiro positivo.";
    }
  }

  return errors;
}
