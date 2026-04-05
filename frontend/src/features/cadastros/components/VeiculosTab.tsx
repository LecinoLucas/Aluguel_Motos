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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getValidationMessages } from "@/features/cadastros/validation";
import { Edit2, Loader2, Plus, Trash2 } from "lucide-react";
import { formatChassiDisplay, formatPlateDisplay, formatRenavamDisplay } from "../format";
import { CadastroImportButton } from "./CadastroImportButton";
import { CadastroErrorAlert } from "./CadastroErrorAlert";
import { VeiculoFormFields } from "./VeiculoFormFields";
import type { VeiculoField, VeiculoFormData, VeiculoFormErrors, VeiculoRecord } from "../types";

interface VeiculoImportConfig {
  fileName?: string;
  isImporting: boolean;
  onImportClick: () => void;
}

interface VeiculosTabProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  form: VeiculoFormData;
  errors?: VeiculoFormErrors;
  onFormChange: (field: VeiculoField, value: string) => void;
  editOpen?: boolean;
  onEditOpenChange?: (value: boolean) => void;
  editForm?: VeiculoFormData;
  editErrors?: VeiculoFormErrors;
  onEditFormChange?: (field: VeiculoField, value: string) => void;
  items: VeiculoRecord[];
  isLoading: boolean;
  loadErrorMessage?: string;
  isSubmitting: boolean;
  onCreate: () => void;
  isUpdating?: boolean;
  disponibilidadeUpdatingId?: number | null;
  onEdit?: (item: VeiculoRecord) => void;
  onUpdate?: () => void;
  onUpdateDisponibilidade?: (
    item: VeiculoRecord,
    disponibilidadeManual: "automatico" | "disponivel" | "indisponivel",
  ) => void | Promise<void>;
  onDelete: (id: number) => void;
  searchTerm?: string;
  onSearchTermChange?: (value: string) => void;
  title?: string;
  createLabel?: string;
  createDialogTitle?: string;
  createDialogDescription?: string;
  editDialogTitle?: string;
  editDialogDescription?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  showEditAction?: boolean;
  crlvImport?: VeiculoImportConfig;
}

export function VeiculosTab({
  open,
  onOpenChange,
  form,
  errors = {},
  onFormChange,
  editOpen = false,
  onEditOpenChange,
  editForm = form,
  editErrors = {},
  onEditFormChange,
  items,
  isLoading,
  loadErrorMessage,
  isSubmitting,
  onCreate,
  isUpdating = false,
  disponibilidadeUpdatingId,
  onEdit,
  onUpdate,
  onUpdateDisponibilidade,
  onDelete,
  searchTerm = "",
  onSearchTermChange,
  title = "Veículos",
  createLabel = "Novo Veículo",
  createDialogTitle = "Cadastrar Veículo",
  createDialogDescription = "Dados da moto/veículo para contrato",
  editDialogTitle = "Editar Veículo",
  editDialogDescription = "Atualize os dados do veículo cadastrado.",
  searchPlaceholder = "Buscar veículo por marca, modelo ou placa...",
  emptyMessage = "Nenhum veículo cadastrado.",
  showEditAction = true,
  crlvImport,
}: VeiculosTabProps) {
  const errorMessages = getValidationMessages(errors);
  const editErrorMessages = getValidationMessages(editErrors);

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
              {crlvImport ? (
                <div className="cadastro-import-grid">
                  <CadastroImportButton
                    title="Importar CRLV"
                    description="Extrai os dados principais do veículo para preencher o cadastro."
                    fileName={crlvImport.fileName}
                    isImporting={crlvImport.isImporting}
                    onClick={crlvImport.onImportClick}
                  />
                </div>
              ) : null}
              <CadastroErrorAlert title="Revise os dados do veículo" messages={errorMessages} />
              <VeiculoFormFields form={form} errors={errors} onChange={onFormChange} />
            </div>
            <div className="cadastros-dialog__footer">
              <Button onClick={onCreate} disabled={isSubmitting} className="cadastros-primary-button w-full sm:w-auto">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Veículo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        {onEditOpenChange && onUpdate && onEditFormChange ? (
          <Dialog open={editOpen} onOpenChange={onEditOpenChange}>
            <DialogContent
              overlayClassName="cadastros-dialog-overlay"
              className="cadastros-dialog sm:max-w-2xl"
            >
              <DialogHeader>
                <DialogTitle>{editDialogTitle}</DialogTitle>
                <DialogDescription>{editDialogDescription}</DialogDescription>
              </DialogHeader>
              <div className="cadastros-dialog__body">
                <CadastroErrorAlert title="Revise os dados do veículo" messages={editErrorMessages} />
                <VeiculoFormFields form={editForm} errors={editErrors} onChange={onEditFormChange} />
              </div>
              <div className="cadastros-dialog__footer">
                <Button onClick={onUpdate} disabled={isUpdating} className="cadastros-primary-button w-full sm:w-auto">
                  {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Salvar alterações
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : null}
      </CardHeader>
      <CardContent>
        <CadastroErrorAlert
          title="Não foi possível carregar os veículos"
          messages={loadErrorMessage ? [loadErrorMessage] : []}
        />
        {onSearchTermChange ? (
          <div className="cadastros-search-bar">
            <Input
              className="cadastros-search-input"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
            />
          </div>
        ) : null}
        {isLoading ? (
          <div className="cadastros-card-state">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="cadastros-table-wrap">
            <table className="cadastros-table w-full min-w-[1180px]">
              <thead>
                <tr>
                  <th>Marca / Modelo</th>
                  <th>Placa</th>
                  <th>Ano Fab/Mod</th>
                  <th>Cor</th>
                  <th>Chassi</th>
                  <th>RENAVAM</th>
                  <th>Status</th>
                  <th>Disponibilidade</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td data-label="Marca / Modelo">{[item.marca, item.modelo].filter(Boolean).join(" / ")}</td>
                      <td data-label="Placa">{formatPlateDisplay(item.placa)}</td>
                      <td data-label="Ano Fab/Mod">{item.anoModelo ? `${item.ano}/${item.anoModelo}` : item.ano}</td>
                      <td data-label="Cor">{item.cor || "-"}</td>
                      <td data-label="Chassi" className="font-mono">{formatChassiDisplay(item.chassi)}</td>
                      <td data-label="RENAVAM" className="font-mono">{formatRenavamDisplay(item.renavam)}</td>
                      <td data-label="Status">{item.status}</td>
                      <td data-label="Disponibilidade">
                        {onUpdateDisponibilidade ? (
                          <Select
                            value={item.disponibilidadeManual}
                            onValueChange={(value) =>
                              onUpdateDisponibilidade(
                                item,
                                value as "automatico" | "disponivel" | "indisponivel",
                              )
                            }
                            disabled={disponibilidadeUpdatingId === item.id}
                          >
                            <SelectTrigger className="w-[160px]">
                              <SelectValue placeholder="Escolha" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="automatico">Automático</SelectItem>
                              <SelectItem value="disponivel">Forçar disponível</SelectItem>
                              <SelectItem value="indisponivel">Forçar indisponível</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          item.disponibilidadeManual
                        )}
                      </td>
                      <td data-label="Ações">
                        <div className="cadastros-table-actions">
                          {showEditAction && onEdit ? (
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
                    <td colSpan={9} className="cadastros-table-empty">
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
