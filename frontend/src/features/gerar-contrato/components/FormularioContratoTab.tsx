import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ClienteListItem, LocadorListItem, MotoListItem } from "@/lib/trpc-types";
import { Plus, Trash2 } from "lucide-react";
import type { LocadorData, LocatarioData, VeiculoData } from "../types";
import { LabeledInput } from "./LabeledInput";

interface LocadorDraft {
  id: string;
  cadastroId: number | null;
  data: LocadorData;
}

interface FormularioContratoTabProps {
  locadoresContrato: LocadorDraft[];
  locatario: LocatarioData;
  veiculo: VeiculoData;
  selectedLocadorIds: string[];
  locatarioSelecionado: string;
  motoSelecionada: string;
  locadoresDisponiveis: LocadorListItem[];
  locatarios: ClienteListItem[];
  motos: MotoListItem[];
  onToggleLocador: (value: string, checked: boolean) => void;
  onAddManualLocador: () => void;
  onRemoveLocador: (draftId: string) => void;
  onSelectLocatario: (value: string) => void;
  onSelectMoto: (value: string) => void;
  onUpdateLocador: (draftId: string, field: keyof LocadorData, value: string) => void;
  onUpdateLocatario: (field: keyof LocatarioData, value: string) => void;
  onUpdateVeiculo: (field: keyof VeiculoData, value: string) => void;
}

const locadorFields: Array<{ key: keyof LocadorData; label: string; placeholder?: string; className?: string }> = [
  { key: "nome", label: "Nome completo" },
  { key: "nacionalidade", label: "Nacionalidade", placeholder: "brasileiro(a)" },
  { key: "estadoCivil", label: "Estado civil", placeholder: "solteiro(a)" },
  { key: "cpf", label: "CPF", placeholder: "000.000.000-00" },
  { key: "rg", label: "RG" },
  { key: "orgaoEmissor", label: "Órgão emissor", placeholder: "SSP/GO" },
  { key: "telefone", label: "Telefone", placeholder: "(62) 99999-9999" },
  { key: "endereco", label: "Endereço", className: "md:col-span-2" },
  { key: "cidade", label: "Cidade" },
  { key: "estado", label: "Estado" },
  { key: "cep", label: "CEP", placeholder: "00000-000" },
];

const locatarioFields: Array<{ key: keyof LocatarioData; label: string; placeholder?: string; className?: string }> = [
  { key: "nome", label: "Nome completo" },
  { key: "nacionalidade", label: "Nacionalidade", placeholder: "brasileiro(a)" },
  { key: "estadoCivil", label: "Estado civil", placeholder: "solteiro(a)" },
  { key: "cpf", label: "CPF", placeholder: "000.000.000-00" },
  { key: "cnh", label: "CNH" },
  { key: "rg", label: "RG" },
  { key: "orgaoEmissor", label: "Órgão emissor", placeholder: "SSP/GO" },
  { key: "telefone", label: "Telefone", placeholder: "(62) 99999-9999" },
  { key: "endereco", label: "Endereço", className: "md:col-span-2" },
  { key: "cidade", label: "Cidade" },
  { key: "estado", label: "Estado" },
  { key: "cep", label: "CEP", placeholder: "00000-000" },
];

export function FormularioContratoTab({
  locadoresContrato,
  locatario,
  veiculo,
  selectedLocadorIds,
  locatarioSelecionado,
  motoSelecionada,
  locadoresDisponiveis,
  locatarios,
  motos,
  onToggleLocador,
  onAddManualLocador,
  onRemoveLocador,
  onSelectLocatario,
  onSelectMoto,
  onUpdateLocador,
  onUpdateLocatario,
  onUpdateVeiculo,
}: FormularioContratoTabProps) {
  const resumoLocadores =
    locadoresContrato.length > 0
      ? locadoresContrato.map((item) => item.data.nome || "Locador sem nome").join(", ")
      : "-";

  return (
    <Card className="contract-section-card">
      <CardHeader>
        <CardTitle>Formulário Inteligente do Contrato</CardTitle>
        <p className="text-sm text-muted-foreground">
          Selecione os cadastros já preenchidos nas telas de locadores, clientes e motos, e complemente manualmente só o que faltar.
        </p>
      </CardHeader>
      <CardContent className="contract-form-card space-y-6">
        <div className="contract-selector-grid">
          <div className="contract-summary-card md:col-span-2 space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold">Locadores do contrato</p>
              <p className="text-sm text-muted-foreground">
                Marque quantos locadores quiser e adicione extras manualmente quando precisar.
              </p>
            </div>

            <div className="grid gap-2">
              {locadoresDisponiveis.length > 0 ? (
                locadoresDisponiveis.map((item) => {
                  const inputId = `gerar-contrato-locador-${item.id}`;
                  return (
                    <div key={item.id} className="flex items-start gap-3 rounded-md border border-border/60 bg-background/70 px-3 py-2">
                      <Checkbox
                        id={inputId}
                        checked={selectedLocadorIds.includes(item.id.toString())}
                        onCheckedChange={(checked) => onToggleLocador(item.id.toString(), Boolean(checked))}
                      />
                      <Label htmlFor={inputId} className="flex-1 cursor-pointer items-start">
                        <span className="flex flex-col gap-1 leading-snug">
                          <span>{item.nome}</span>
                          <span className="text-xs font-normal text-muted-foreground">{item.cpf}</span>
                        </span>
                      </Label>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum locador cadastrado no momento.</p>
              )}
            </div>

            <Button type="button" variant="outline" className="contract-outline-button gap-2" onClick={onAddManualLocador}>
              <Plus className="h-4 w-4" />
              Adicionar locador manual
            </Button>
          </div>

          <div className="md:col-span-2">
            <label className="contract-selector-label">Selecionar locatário cadastrado</label>
            <Select value={locatarioSelecionado} onValueChange={onSelectLocatario}>
              <SelectTrigger className="contract-select-trigger mt-1">
                <SelectValue placeholder="Selecione um locatário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Preencher manualmente</SelectItem>
                {locatarios.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.nome} ({item.cpf})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <label className="contract-selector-label">Selecionar veículo cadastrado</label>
            <Select value={motoSelecionada} onValueChange={onSelectMoto}>
              <SelectTrigger className="contract-select-trigger mt-1">
                <SelectValue placeholder="Selecione um veículo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Preencher manualmente</SelectItem>
                {motos.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.modelo} - {item.placa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="contract-summary-card md:col-span-2">
            <p><strong>Locadores:</strong> {resumoLocadores}</p>
            <p><strong>Locatário:</strong> {locatario.nome || "-"}</p>
            <p><strong>CPF Locatário:</strong> {locatario.cpf || "-"}</p>
            <p><strong>Veículo:</strong> {[veiculo.marca, veiculo.modelo, veiculo.placa].filter(Boolean).join(" - ") || "-"}</p>
          </div>
        </div>

        <div className="contract-form-sections">
          {locadoresContrato.map((locador, index) => (
            <section key={locador.id} className="contract-form-section">
              <div className="contract-form-section__header flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold">Dados do Locador {index + 1}</h3>
                  <p className="text-sm text-muted-foreground">
                    {locador.cadastroId
                      ? "Dados trazidos do cadastro e liberados para ajustes específicos deste contrato."
                      : "Preencha manualmente quando o locador ainda não estiver cadastrado."}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="contract-ghost-button gap-2 self-start"
                  onClick={() => onRemoveLocador(locador.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Remover
                </Button>
              </div>
              <div className="contract-form-grid">
                {locadorFields.map((field) => (
                  <LabeledInput
                    key={`${locador.id}-${field.key}`}
                    label={field.label}
                    value={locador.data[field.key]}
                    onChange={(value) => onUpdateLocador(locador.id, field.key, value)}
                    placeholder={field.placeholder}
                    className={field.className || ""}
                  />
                ))}
              </div>
            </section>
          ))}

          <section className="contract-form-section">
            <div className="contract-form-section__header">
              <h3 className="text-base font-semibold">Dados do Locatário</h3>
              <p className="text-sm text-muted-foreground">Use o cadastro de clientes para trazer identificação e endereço já revisados.</p>
            </div>
            <div className="contract-form-grid">
              {locatarioFields.map((field) => (
                <LabeledInput
                  key={field.key}
                  label={field.label}
                  value={locatario[field.key]}
                  onChange={(value) => onUpdateLocatario(field.key, value)}
                  placeholder={field.placeholder}
                  className={field.className || ""}
                />
              ))}
            </div>
          </section>

          <section className="contract-form-section">
            <div className="contract-form-section__header">
              <h3 className="text-base font-semibold">Dados do Veículo</h3>
              <p className="text-sm text-muted-foreground">Selecione uma moto cadastrada ou ajuste manualmente os dados do veículo no contrato.</p>
            </div>
            <div className="contract-form-grid">
              <LabeledInput label="Marca" value={veiculo.marca} onChange={(v) => onUpdateVeiculo("marca", v)} placeholder="HONDA" />
              <LabeledInput label="Modelo" value={veiculo.modelo} onChange={(v) => onUpdateVeiculo("modelo", v)} placeholder="CG 150 FAN ESI" />
              <LabeledInput label="Ano (Fab/Mod)" value={veiculo.ano} onChange={(v) => onUpdateVeiculo("ano", v)} placeholder="2010/2010" />
              <LabeledInput label="Cor" value={veiculo.cor} onChange={(v) => onUpdateVeiculo("cor", v)} placeholder="PRETA" />
              <LabeledInput label="Placa" value={veiculo.placa} onChange={(v) => onUpdateVeiculo("placa", v)} placeholder="ABC1D23" />
              <LabeledInput label="Chassi" value={veiculo.chassi} onChange={(v) => onUpdateVeiculo("chassi", v)} />
              <LabeledInput label="RENAVAM" value={veiculo.renavam} onChange={(v) => onUpdateVeiculo("renavam", v)} />
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  );
}
