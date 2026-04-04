import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ClienteListItem, LocadorListItem, MotoListItem } from "@/lib/trpc-types";
import type {
  ExtractedDocumentFields,
  ImportKind,
  LocadorData,
  LocatarioData,
  VeiculoData,
} from "../types";
import { ImportButton } from "./ImportButton";
import { LabeledInput } from "./LabeledInput";

interface FormularioContratoTabProps {
  locador: LocadorData;
  locatario: LocatarioData;
  veiculo: VeiculoData;
  locadorSelecionado: string;
  locatarioSelecionado: string;
  motoSelecionada: string;
  locadores: LocadorListItem[];
  locatarios: ClienteListItem[];
  motos: MotoListItem[];
  importedFiles: Record<ImportKind, string>;
  isImporting: Record<ImportKind, boolean>;
  onSelectLocador: (value: string) => void;
  onSelectLocatario: (value: string) => void;
  onSelectMoto: (value: string) => void;
  onUpdateLocador: (field: keyof LocadorData, value: string) => void;
  onUpdateLocatario: (field: keyof LocatarioData, value: string) => void;
  onUpdateVeiculo: (field: keyof VeiculoData, value: string) => void;
  onImportClick: (kind: ImportKind) => void;
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
  locador,
  locatario,
  veiculo,
  locadorSelecionado,
  locatarioSelecionado,
  motoSelecionada,
  locadores,
  locatarios,
  motos,
  importedFiles,
  isImporting,
  onSelectLocador,
  onSelectLocatario,
  onSelectMoto,
  onUpdateLocador,
  onUpdateLocatario,
  onUpdateVeiculo,
  onImportClick,
}: FormularioContratoTabProps) {
  return (
    <Card className="contract-section-card">
      <CardHeader>
        <CardTitle>Formulário Inteligente do Contrato</CardTitle>
        <p className="text-sm text-muted-foreground">
          Selecione cadastros existentes, complemente manualmente e importe documentos quando precisar preencher mais rápido.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="contract-selector-grid">
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Selecionar locador cadastrado</label>
            <Select value={locadorSelecionado} onValueChange={onSelectLocador}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione um locador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Preencher manualmente</SelectItem>
                {locadores.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.nome} ({item.cpf})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Selecionar locatário cadastrado</label>
            <Select value={locatarioSelecionado} onValueChange={onSelectLocatario}>
              <SelectTrigger className="mt-1">
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
            <label className="text-sm font-medium">Selecionar veículo cadastrado</label>
            <Select value={motoSelecionada} onValueChange={onSelectMoto}>
              <SelectTrigger className="mt-1">
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
            <p><strong>Locador:</strong> {locador.nome || "-"}</p>
            <p><strong>CPF Locador:</strong> {locador.cpf || "-"}</p>
            <p><strong>Locatário:</strong> {locatario.nome || "-"}</p>
            <p><strong>CPF Locatário:</strong> {locatario.cpf || "-"}</p>
            <p><strong>Veículo:</strong> {[veiculo.marca, veiculo.modelo, veiculo.placa].filter(Boolean).join(" - ") || "-"}</p>
          </div>
        </div>

        <div className="contract-import-grid">
          <ImportButton
            label="Importar documento do locador"
            description="Combina identidade e comprovante para preencher o bloco do locador."
            onClick={() => onImportClick("locador")}
            loading={isImporting.locador}
            fileName={importedFiles.locador}
          />
          <ImportButton
            label="Importar CNH do locatário"
            description="Extrai nome, CPF, RG, órgão emissor e CNH do locatário."
            onClick={() => onImportClick("cnh")}
            loading={isImporting.cnh}
            fileName={importedFiles.cnh}
          />
          <ImportButton
            label="Importar comprovante do locatário"
            description="Complementa endereço, cidade, estado, CEP e telefone do locatário."
            onClick={() => onImportClick("comprovante")}
            loading={isImporting.comprovante}
            fileName={importedFiles.comprovante}
          />
          <ImportButton
            label="Importar CRLV da moto"
            description="Lê CRLV em PDF ou imagem e preenche os dados do veículo do contrato."
            onClick={() => onImportClick("crlv")}
            loading={isImporting.crlv}
            fileName={importedFiles.crlv}
          />
        </div>

        <div className="contract-form-sections">
          <section className="contract-form-section">
            <div className="contract-form-section__header">
              <h3 className="text-base font-semibold">Dados do Locador</h3>
              <p className="text-sm text-muted-foreground">Use cadastro, importação ou ajuste manual para deixar o contrato pronto.</p>
            </div>
            <div className="contract-form-grid">
              {locadorFields.map((field) => (
                <LabeledInput
                  key={field.key}
                  label={field.label}
                  value={locador[field.key]}
                  onChange={(value) => onUpdateLocador(field.key, value)}
                  placeholder={field.placeholder}
                  className={field.className || ""}
                />
              ))}
            </div>
          </section>

          <section className="contract-form-section">
            <div className="contract-form-section__header">
              <h3 className="text-base font-semibold">Dados do Locatário</h3>
              <p className="text-sm text-muted-foreground">A CNH cobre identificação; o comprovante complementa endereço e contato.</p>
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
              <p className="text-sm text-muted-foreground">Selecione uma moto cadastrada, ajuste manualmente ou importe o CRLV.</p>
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
