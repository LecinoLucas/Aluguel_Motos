import { CadastroField } from "./CadastroField";
import type { VeiculoField, VeiculoFormData, VeiculoFormErrors } from "../types";

interface VeiculoFormFieldsProps {
  form: VeiculoFormData;
  errors?: VeiculoFormErrors;
  onChange: (field: VeiculoField, value: string) => void;
}

export function VeiculoFormFields({ form, errors = {}, onChange }: VeiculoFormFieldsProps) {
  return (
    <div className="space-y-4">
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
          onChange={(e) => onChange("placa", e.target.value.toUpperCase())}
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
          onChange={(e) => onChange("renavam", e.target.value)}
        />
      </div>
      <CadastroField
        label="Chassi"
        placeholder="17 caracteres do chassi"
        value={form.chassi}
        error={errors.chassi}
        onChange={(e) => onChange("chassi", e.target.value.toUpperCase())}
      />
    </div>
  );
}
