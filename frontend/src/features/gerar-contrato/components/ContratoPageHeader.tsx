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
      <div className="contract-page-header__content">
        <div className="contract-page-header__main">
          <div className="contract-page-header__eyebrow">Contrato inteligente</div>
          <h1 className="contract-page-header__title">Gerar Contrato</h1>
          <p className="contract-page-header__subtitle">
            Monte contratos com cadastro existente, importação de documentos e revisão antes do preenchimento. O fluxo abre a impressão do navegador para salvar em PDF.
          </p>

          <div className="contract-page-header__stats">
            <article className="contract-page-header__stat">
              <span className="contract-page-header__stat-value">Cadastro</span>
              <span className="contract-page-header__stat-label">Locador, locatário e veículo integrados</span>
            </article>
            <article className="contract-page-header__stat">
              <span className="contract-page-header__stat-value">Revisão</span>
              <span className="contract-page-header__stat-label">Pré-visualização antes da impressão</span>
            </article>
          </div>
        </div>

        <aside className="contract-page-header__aside">
          <div className="contract-page-header__aside-card">
            <span className="contract-page-header__aside-label">Modo atual</span>
            <strong className="contract-page-header__aside-value">{showPreview ? "Pré-visualização" : "Edição guiada"}</strong>
            <p className="contract-page-header__aside-text">
              Alterne entre preenchimento e leitura final sem perder o contexto do contrato em andamento.
            </p>
            <div className="contract-page-actions">
              <Button variant="outline" className="contract-outline-button w-full gap-2 sm:w-auto" onClick={onTogglePreview}>
                <Eye className="h-4 w-4" />
                {showPreview ? "Formulário" : "Visualizar"}
              </Button>
              <Button className="contract-primary-button w-full gap-2 sm:w-auto" onClick={onPrint}>
                <Printer className="h-4 w-4" />
                Gerar PDF
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
