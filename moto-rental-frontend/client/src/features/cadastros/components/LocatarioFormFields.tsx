import { CadastroField } from "./CadastroField";
import type { LocatarioField, LocatarioFormData, LocatarioFormErrors } from "../types";

interface LocatarioFormFieldsProps {
  form: LocatarioFormData;
  errors?: LocatarioFormErrors;
  onChange: (field: LocatarioField, value: string) => void;
  disableImmutable?: boolean;
}

export function LocatarioFormFields({
  form,
  errors = {},
  onChange,
  disableImmutable = false,
}: LocatarioFormFieldsProps) {
  return (
    <div className="space-y-4">
      <CadastroField
        label="Nome completo"
        placeholder="Ex.: Maria de Souza"
        value={form.nome}
        error={errors.nome}
        onChange={(e) => onChange("nome", e.target.value)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <CadastroField
          label="CPF"
          placeholder="000.000.000-00"
          value={form.cpf}
          disabled={disableImmutable}
          error={errors.cpf}
          onChange={(e) => onChange("cpf", e.target.value)}
        />
        <CadastroField
          label="CNH"
          placeholder="Número da CNH"
          value={form.cnh}
          disabled={disableImmutable}
          error={errors.cnh}
          onChange={(e) => onChange("cnh", e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <CadastroField
          label="RG"
          placeholder="Número do RG"
          value={form.rg}
          error={errors.rg}
          onChange={(e) => onChange("rg", e.target.value)}
        />
        <CadastroField
          label="Órgão emissor"
          placeholder="Ex.: SSP/GO"
          value={form.orgaoEmissor}
          error={errors.orgaoEmissor}
          onChange={(e) => onChange("orgaoEmissor", e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <CadastroField
          label="Nacionalidade"
          placeholder="Ex.: brasileiro(a)"
          value={form.nacionalidade}
          error={errors.nacionalidade}
          onChange={(e) => onChange("nacionalidade", e.target.value)}
        />
        <CadastroField
          label="Estado civil"
          placeholder="Ex.: solteiro(a)"
          value={form.estadoCivil}
          error={errors.estadoCivil}
          onChange={(e) => onChange("estadoCivil", e.target.value)}
        />
      </div>
      <CadastroField
        label="Endereço completo"
        placeholder="Rua, número, bairro e complemento"
        value={form.endereco}
        error={errors.endereco}
        onChange={(e) => onChange("endereco", e.target.value)}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <CadastroField
          label="Cidade"
          placeholder="Cidade"
          value={form.cidade}
          error={errors.cidade}
          onChange={(e) => onChange("cidade", e.target.value)}
        />
        <CadastroField
          label="Estado"
          placeholder="UF"
          value={form.estado}
          error={errors.estado}
          hint="Use a sigla, como GO ou SP."
          onChange={(e) => onChange("estado", e.target.value.toUpperCase())}
        />
        <CadastroField
          label="CEP"
          placeholder="00000-000"
          value={form.cep}
          error={errors.cep}
          onChange={(e) => onChange("cep", e.target.value)}
        />
      </div>
      <CadastroField
        label="Email"
        placeholder="nome@dominio.com"
        value={form.email}
        error={errors.email}
        hint="Opcional."
        onChange={(e) => onChange("email", e.target.value)}
      />
      <CadastroField
        label="Telefone"
        placeholder="(62) 99999-9999"
        value={form.telefone}
        error={errors.telefone}
        onChange={(e) => onChange("telefone", e.target.value)}
      />
    </div>
  );
}
