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
        <div className="contract-page-header__eyebrow">Contrato inteligente</div>
        <h1 className="contract-page-header__title">Gerar Contrato</h1>
        <p className="contract-page-header__subtitle">
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
