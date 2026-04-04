import { Button } from "@/components/ui/button";
import { Eye, Printer } from "lucide-react";

interface ContratoPageHeaderProps {
  showPreview: boolean;
  onTogglePreview: () => void;
  onPrint: () => void;
}

export function ContratoPageHeader({
  showPreview,
  onTogglePreview,
  onPrint,
}: ContratoPageHeaderProps) {
  return (
    <div className="contract-page-header">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">Contrato inteligente</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Gerar Contrato</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Monte contratos com cadastro existente, importação de documentos e revisão antes do preenchimento.
        </p>
      </div>
      <div className="contract-page-actions">
        <Button variant="outline" className="w-full gap-2 sm:w-auto" onClick={onTogglePreview}>
          <Eye className="h-4 w-4" />
          {showPreview ? "Formulário" : "Visualizar"}
        </Button>
        <Button className="w-full gap-2 sm:w-auto" onClick={onPrint}>
          <Printer className="h-4 w-4" />
          Gerar e Imprimir Contrato
        </Button>
      </div>
    </div>
  );
}
