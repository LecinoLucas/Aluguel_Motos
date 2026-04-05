import { CadastroField } from "./CadastroField";
import { formatCepInput, formatCnhInput, formatCpfInput, formatPhoneInput, formatRgInput } from "../format";
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
    <div className="cadastros-form-layout">
      <section className="cadastros-form-section">
        <div className="cadastros-form-section__header">
          <h3>Documentação</h3>
          <p>Dados pessoais e documentos que alimentam o contrato e a validação do locatário.</p>
        </div>
        <div className="cadastros-form-stack">
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
              onChange={(e) => onChange("cpf", formatCpfInput(e.target.value))}
            />
            <CadastroField
              label="CNH"
              placeholder="Número da CNH"
              value={form.cnh}
              disabled={disableImmutable}
              error={errors.cnh}
              hint="Somente números, com até 11 dígitos."
              onChange={(e) => onChange("cnh", formatCnhInput(e.target.value))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <CadastroField
              label="RG"
              placeholder="Número do RG"
              value={form.rg}
              error={errors.rg}
              hint="Aceita RG com dígito final X."
              onChange={(e) => onChange("rg", formatRgInput(e.target.value))}
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
        </div>
      </section>

      <section className="cadastros-form-section">
        <div className="cadastros-form-section__header">
          <h3>Contato e endereço</h3>
          <p>Informações para comunicação, cobrança e composição do contrato.</p>
        </div>
        <div className="cadastros-form-stack">
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
              onChange={(e) => onChange("cep", formatCepInput(e.target.value))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
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
              onChange={(e) => onChange("telefone", formatPhoneInput(e.target.value))}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
