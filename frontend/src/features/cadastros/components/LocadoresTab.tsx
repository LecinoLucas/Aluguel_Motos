import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getValidationMessages } from "@/features/cadastros/validation";
import { Edit2, Loader2, Plus, Trash2 } from "lucide-react";
import { formatCpfDisplay, formatPhoneDisplay, formatRgDisplay } from "../format";
import { CadastroImportButton } from "./CadastroImportButton";
import { CadastroErrorAlert } from "./CadastroErrorAlert";
import { LocadorFormFields } from "./LocadorFormFields";
import type { LocadorField, LocadorFormData, LocadorFormErrors, LocadorRecord } from "../types";

interface LocadorImportConfig {
  fileName?: string;
  isImporting: boolean;
  onImportClick: () => void;
}

interface LocadoresTabProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  form: LocadorFormData;
  errors?: LocadorFormErrors;
  onFormChange: (field: LocadorField, value: string) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  items: LocadorRecord[];
  isLoading: boolean;
  loadErrorMessage?: string;
  isSubmitting: boolean;
  onCreate: () => void;
  onEdit: (item: LocadorRecord) => void;
  onDelete: (id: number) => void;
  title?: string;
  createLabel?: string;
  createDialogTitle?: string;
  createDialogDescription?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  showEditAction?: boolean;
  locadorImport?: LocadorImportConfig;
}

export function LocadoresTab({
  open,
  onOpenChange,
  form,
  errors = {},
  onFormChange,
  searchTerm,
  onSearchTermChange,
  items,
  isLoading,
  loadErrorMessage,
  isSubmitting,
  onCreate,
  onEdit,
  onDelete,
  title = "Locadores",
  createLabel = "Novo Locador",
  createDialogTitle = "Cadastrar Locador",
  createDialogDescription = "Dados do proprietário/locador",
  searchPlaceholder = "Buscar locador por nome ou CPF...",
  emptyMessage = "Nenhum locador cadastrado.",
  showEditAction = true,
  locadorImport,
}: LocadoresTabProps) {
  const errorMessages = getValidationMessages(errors);

  return (
    <Card className="cadastros-section-card">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Total: {items.length}</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
            <Button className="cadastros-primary-button w-full gap-2 sm:w-auto">
              <Plus className="h-4 w-4" />
              {createLabel}
            </Button>
          </DialogTrigger>
          <DialogContent
            overlayClassName="cadastros-dialog-overlay"
            className="cadastros-dialog sm:max-w-2xl"
          >
            <DialogHeader>
              <DialogTitle>{createDialogTitle}</DialogTitle>
              <DialogDescription>{createDialogDescription}</DialogDescription>
            </DialogHeader>
            <div className="cadastros-dialog__body">
              {locadorImport ? (
                <div className="cadastro-import-grid">
                  <CadastroImportButton
                    title="Importar documento do locador"
                    description="Extrai identidade e endereço para preencher o cadastro mais rápido."
                    fileName={locadorImport.fileName}
                    isImporting={locadorImport.isImporting}
                    onClick={locadorImport.onImportClick}
                  />
                </div>
              ) : null}
              <CadastroErrorAlert title="Revise os dados do locador" messages={errorMessages} />
              <LocadorFormFields form={form} errors={errors} onChange={onFormChange} />
            </div>
            <div className="cadastros-dialog__footer">
              <Button onClick={onCreate} disabled={isSubmitting} className="cadastros-primary-button w-full sm:w-auto">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Locador
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <CadastroErrorAlert
          title="Não foi possível carregar os locadores"
          messages={loadErrorMessage ? [loadErrorMessage] : []}
        />
        <div className="cadastros-search-bar">
          <Input
            className="cadastros-search-input"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>
        {isLoading ? (
          <div className="cadastros-card-state">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="cadastros-table-wrap">
            <table className="cadastros-table w-full min-w-[900px]">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>RG</th>
                  <th>Telefone</th>
                  <th>Cidade/UF</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td data-label="Nome">{item.nome}</td>
                      <td data-label="CPF">{formatCpfDisplay(item.cpf)}</td>
                      <td data-label="RG">{formatRgDisplay(item.rg)}</td>
                      <td data-label="Telefone">{formatPhoneDisplay(item.telefone)}</td>
                      <td data-label="Cidade/UF">{[item.cidade, item.estado].filter(Boolean).join(" / ") || "-"}</td>
                      <td data-label="Ações">
                        <div className="cadastros-table-actions">
                          {showEditAction ? (
                            <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          ) : null}
                          <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="cadastros-table-empty">
                      {emptyMessage}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
