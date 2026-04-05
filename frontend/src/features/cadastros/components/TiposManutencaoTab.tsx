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
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { CadastroErrorAlert } from "./CadastroErrorAlert";
import type {
  TipoManutencaoField,
  TipoManutencaoFormData,
  TipoManutencaoFormErrors,
  TipoManutencaoRecord,
} from "../types";

interface TiposManutencaoTabProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  form: TipoManutencaoFormData;
  errors?: TipoManutencaoFormErrors;
  onFormChange: (field: TipoManutencaoField, value: string) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  editOpen: boolean;
  onEditOpenChange: (value: boolean) => void;
  editForm: TipoManutencaoFormData;
  editErrors?: TipoManutencaoFormErrors;
  onEditFormChange: (field: TipoManutencaoField, value: string) => void;
  items: TipoManutencaoRecord[];
  isLoading: boolean;
  loadErrorMessage?: string;
  isSubmitting: boolean;
  onCreate: () => void;
  isUpdating: boolean;
  onEdit: (item: TipoManutencaoRecord) => void;
  onUpdate: () => void;
  onDelete: (id: number) => void;
}

export function TiposManutencaoTab({
  open,
  onOpenChange,
  form,
  errors = {},
  onFormChange,
  searchTerm,
  onSearchTermChange,
  editOpen,
  onEditOpenChange,
  editForm,
  editErrors = {},
  onEditFormChange,
  items,
  isLoading,
  loadErrorMessage,
  isSubmitting,
  onCreate,
  isUpdating,
  onEdit,
  onUpdate,
  onDelete,
}: TiposManutencaoTabProps) {
  const errorMessages = getValidationMessages(errors);
  const editErrorMessages = getValidationMessages(editErrors);

  return (
    <Card className="cadastros-section-card">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Tipos de manutenção</CardTitle>
          <CardDescription>Total: {items.length}</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
            <Button className="cadastros-primary-button w-full gap-2 sm:w-auto">
              <Plus className="h-4 w-4" />
              Novo Tipo
            </Button>
          </DialogTrigger>
          <DialogContent
            overlayClassName="cadastros-dialog-overlay"
            className="cadastros-dialog sm:max-w-xl"
          >
            <DialogHeader>
              <DialogTitle>Cadastrar tipo de manutenção</DialogTitle>
              <DialogDescription>
                Crie tipos padronizados para usar na manutenção e agilizar o preenchimento da modal.
              </DialogDescription>
            </DialogHeader>
            <div className="cadastros-dialog__body">
              <CadastroErrorAlert title="Revise os dados do tipo" messages={errorMessages} />
              <div className="cadastros-form-section cadastros-form-section--single">
                <div className="cadastros-form-section__header">
                  <h3>Padronização de manutenção</h3>
                  <p>Defina uma nomenclatura única para acelerar os lançamentos e análises.</p>
                </div>
                <div className="cadastros-form-stack">
                  <div className="cadastros-field">
                    <label>Nome do tipo</label>
                    <Input
                      value={form.nome}
                      onChange={(event) => onFormChange("nome", event.target.value)}
                      placeholder="Ex: Troca de óleo"
                    />
                    {errors.nome ? <p className="text-sm text-red-500">{errors.nome}</p> : null}
                  </div>

                  <div className="cadastros-field">
                    <label>Descrição</label>
                    <Input
                      value={form.descricao}
                      onChange={(event) => onFormChange("descricao", event.target.value)}
                      placeholder="Ex: Manutenção preventiva do motor"
                    />
                    {errors.descricao ? <p className="text-sm text-red-500">{errors.descricao}</p> : null}
                  </div>

                  <div className="cadastros-field">
                    <label>Intervalo padrão (dias)</label>
                    <Input
                      value={form.intervaloDiasPadrao}
                      onChange={(event) => onFormChange("intervaloDiasPadrao", event.target.value)}
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Ex: 30"
                    />
                    {errors.intervaloDiasPadrao ? <p className="text-sm text-red-500">{errors.intervaloDiasPadrao}</p> : null}
                  </div>
                </div>
              </div>
            </div>
            <div className="cadastros-dialog__footer">
              <Button onClick={onCreate} disabled={isSubmitting} className="cadastros-primary-button w-full sm:w-auto">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Salvar Tipo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={editOpen} onOpenChange={onEditOpenChange}>
          <DialogContent
            overlayClassName="cadastros-dialog-overlay"
            className="cadastros-dialog sm:max-w-xl"
          >
            <DialogHeader>
              <DialogTitle>Editar tipo de manutenção</DialogTitle>
              <DialogDescription>
                Atualize o nome, a descrição ou o intervalo padrão para manter a manutenção padronizada.
              </DialogDescription>
            </DialogHeader>
            <div className="cadastros-dialog__body">
              <CadastroErrorAlert title="Revise os dados do tipo" messages={editErrorMessages} />
              <div className="cadastros-form-section cadastros-form-section--single">
                <div className="cadastros-form-section__header">
                  <h3>Editar tipo</h3>
                  <p>Atualize nome, descrição e intervalo sem perder a padronização da base.</p>
                </div>
                <div className="cadastros-form-stack">
                  <div className="cadastros-field">
                    <label>Nome do tipo</label>
                    <Input
                      value={editForm.nome}
                      onChange={(event) => onEditFormChange("nome", event.target.value)}
                      placeholder="Ex: Troca de óleo"
                    />
                    {editErrors.nome ? <p className="text-sm text-red-500">{editErrors.nome}</p> : null}
                  </div>

                  <div className="cadastros-field">
                    <label>Descrição</label>
                    <Input
                      value={editForm.descricao}
                      onChange={(event) => onEditFormChange("descricao", event.target.value)}
                      placeholder="Ex: Manutenção preventiva do motor"
                    />
                    {editErrors.descricao ? <p className="text-sm text-red-500">{editErrors.descricao}</p> : null}
                  </div>

                  <div className="cadastros-field">
                    <label>Intervalo padrão (dias)</label>
                    <Input
                      value={editForm.intervaloDiasPadrao}
                      onChange={(event) => onEditFormChange("intervaloDiasPadrao", event.target.value)}
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Ex: 30"
                    />
                    {editErrors.intervaloDiasPadrao ? (
                      <p className="text-sm text-red-500">{editErrors.intervaloDiasPadrao}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            <div className="cadastros-dialog__footer">
              <Button onClick={onUpdate} disabled={isUpdating} className="cadastros-primary-button w-full sm:w-auto">
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Salvar alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <CadastroErrorAlert
          title="Não foi possível carregar os tipos de manutenção"
          messages={loadErrorMessage ? [loadErrorMessage] : []}
        />
        <div className="cadastros-search-bar">
          <Input
            className="cadastros-search-input"
            placeholder="Buscar tipo de manutenção por nome..."
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
          />
        </div>
        {isLoading ? (
          <div className="cadastros-card-state">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="cadastros-table-wrap">
            <table className="cadastros-table w-full min-w-[860px]">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Descrição</th>
                  <th>Intervalo padrão</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td data-label="Tipo" className="font-medium">{item.nome}</td>
                      <td data-label="Descrição">{item.descricao || "-"}</td>
                      <td data-label="Intervalo padrão">
                        {item.intervaloDiasPadrao ? `${item.intervaloDiasPadrao} dias` : "-"}
                      </td>
                      <td data-label="Ações">
                        <div className="cadastros-table-actions">
                          <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="cadastros-table-empty">
                      Nenhum tipo de manutenção cadastrado.
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
