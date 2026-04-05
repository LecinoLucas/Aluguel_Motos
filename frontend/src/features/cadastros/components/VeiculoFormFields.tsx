import { CadastroField } from "./CadastroField";
import { formatPlateInput } from "../format";
import type { VeiculoField, VeiculoFormData, VeiculoFormErrors } from "../types";

interface VeiculoFormFieldsProps {
  form: VeiculoFormData;
  errors?: VeiculoFormErrors;
  onChange: (field: VeiculoField, value: string) => void;
}

export function VeiculoFormFields({ form, errors = {}, onChange }: VeiculoFormFieldsProps) {
  return (
    <div className="cadastros-form-layout">
      <section className="cadastros-form-section">
        <div className="cadastros-form-section__header">
          <h3>Dados do veículo</h3>
          <p>Identificação principal da moto para exibição, busca e operação da frota.</p>
        </div>
        <div className="cadastros-form-stack">
          <div className="grid gap-4 sm:grid-cols-2">
            <CadastroField
              label="Marca"
              placeholder="Ex.: Honda"
              value={form.marca}
              error={errors.marca}
              onChange={(e) => onChange("marca", e.target.value)}
            />
            <CadastroField
              label="Modelo"
              placeholder="Ex.: CG 160 Titan"
              value={form.modelo}
              error={errors.modelo}
              onChange={(e) => onChange("modelo", e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <CadastroField
              label="Placa"
              placeholder="ABC1D23"
              value={form.placa}
              error={errors.placa}
              hint="Aceita placa antiga ou Mercosul."
              onChange={(e) => onChange("placa", formatPlateInput(e.target.value))}
            />
            <CadastroField
              label="Ano fabricação"
              placeholder="2010"
              type="number"
              value={form.ano}
              error={errors.ano}
              onChange={(e) => onChange("ano", e.target.value)}
            />
            <CadastroField
              label="Ano modelo"
              placeholder="2011"
              type="number"
              value={form.anoModelo}
              error={errors.anoModelo}
              onChange={(e) => onChange("anoModelo", e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <CadastroField
              label="Cor"
              placeholder="PRETA"
              value={form.cor}
              error={errors.cor}
              onChange={(e) => onChange("cor", e.target.value.toUpperCase())}
            />
            <CadastroField
              label="RENAVAM"
              placeholder="Somente números"
              value={form.renavam}
              error={errors.renavam}
              onChange={(e) => onChange("renavam", e.target.value.replace(/\D/g, "").slice(0, 11))}
            />
          </div>
        </div>
      </section>

      <section className="cadastros-form-section">
        <div className="cadastros-form-section__header">
          <h3>Documentação técnica</h3>
          <p>Campo crítico para conferência, fiscalização e importação do CRLV.</p>
        </div>
        <div className="cadastros-form-stack">
          <CadastroField
            label="Chassi"
            placeholder="17 caracteres do chassi"
            value={form.chassi}
            error={errors.chassi}
            onChange={(e) => onChange("chassi", e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 17))}
          />
        </div>
      </section>
    </div>
  );
}
