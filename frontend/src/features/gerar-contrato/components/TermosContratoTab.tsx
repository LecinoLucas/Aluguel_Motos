import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContratoTermos } from "../types";
import { LabeledInput } from "./LabeledInput";

interface TermosContratoTabProps {
  termos: ContratoTermos;
  onUpdateTermos: (field: keyof ContratoTermos, value: string) => void;
}

export function TermosContratoTab({ termos, onUpdateTermos }: TermosContratoTabProps) {
  return (
    <Card className="contract-section-card">
      <CardHeader>
        <CardTitle>Termos do Contrato</CardTitle>
      </CardHeader>
      <CardContent className="contract-terms-grid grid gap-4 md:grid-cols-2">
        <LabeledInput label="Local do contrato" value={termos.localContrato} onChange={(v) => onUpdateTermos("localContrato", v)} />
        <LabeledInput label="Data do contrato" type="date" value={termos.dataContrato} onChange={(v) => onUpdateTermos("dataContrato", v)} />
        <LabeledInput label="Início da locação" type="date" value={termos.dataInicio} onChange={(v) => onUpdateTermos("dataInicio", v)} />
        <LabeledInput label="Fim da locação" type="date" value={termos.dataFim} onChange={(v) => onUpdateTermos("dataFim", v)} />
        <LabeledInput label="Valor semanal (R$)" value={termos.valorSemanal} onChange={(v) => onUpdateTermos("valorSemanal", v)} placeholder="250,00" />
        <LabeledInput label="Valor caução (R$)" value={termos.valorCaucao} onChange={(v) => onUpdateTermos("valorCaucao", v)} placeholder="600,00" />
        <LabeledInput label="Forma de pagamento" value={termos.formaPagamento} onChange={(v) => onUpdateTermos("formaPagamento", v)} placeholder="pagos toda segunda até às 18h" className="md:col-span-2" />
        <LabeledInput label="Km do hodômetro" value={termos.kmHodometro} onChange={(v) => onUpdateTermos("kmHodometro", v)} placeholder="001200" />
      </CardContent>
    </Card>
  );
}
