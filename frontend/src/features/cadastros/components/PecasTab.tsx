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
import type { PecaField, PecaFormData, PecaFormErrors, PecaRecord } from "../types";

interface PecasTabProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  form: PecaFormData;
  errors?: PecaFormErrors;
  onFormChange: (field: PecaField, value: string) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  editOpen: boolean;
  onEditOpenChange: (value: boolean) => void;
  editForm: PecaFormData;
  editErrors?: PecaFormErrors;
  onEditFormChange: (field: PecaField, value: string) => void;
  items: PecaRecord[];
  isLoading: boolean;
  loadErrorMessage?: string;
  isSubmitting: boolean;
  isUpdating: boolean;
  onCreate: () => void;
  onEdit: (item: PecaRecord) => void;
  onUpdate: () => void;
  onDelete: (id: number) => void;
}

export function PecasTab({
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
  isUpdating,
  onCreate,
  onEdit,
  onUpdate,
  onDelete,
}: PecasTabProps) {
  const errorMessages = getValidationMessages(errors);
  const editErrorMessages = getValidationMessages(editErrors);

  return (
    <Card className="cadastros-section-card">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Peças</CardTitle>
          <CardDescription>Total: {items.length}</CardDescription>
        </div>

        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
            <Button className="cadastros-primary-button w-full gap-2 sm:w-auto">
              <Plus className="h-4 w-4" />
              Nova Peça
            </Button>
          </DialogTrigger>
          <DialogContent
            overlayClassName="cadastros-dialog-overlay"
            className="cadastros-dialog sm:max-w-xl"
          >
            <DialogHeader>
              <DialogTitle>Cadastrar peça</DialogTitle>
              <DialogDescription>
                Crie peças padronizadas para facilitar o registro de manutenção.
              </DialogDescription>
            </DialogHeader>
            <div className="cadastros-dialog__body">
              <CadastroErrorAlert title="Revise os dados da peça" messages={errorMessages} />
              <div className="cadastros-form-section cadastros-form-section--single">
                <div className="cadastros-form-section__header">
                  <h3>Base de peças</h3>
                  <p>Padronize nomes e descrições para facilitar os lançamentos de manutenção.</p>
                </div>
                <div className="cadastros-form-stack">
                  <div className="cadastros-field">
                    <label>Nome da peça</label>
                    <Input
                      value={form.nome}
                      onChange={(event) => onFormChange("nome", event.target.value)}
                      placeholder="Ex: Kit relação"
                    />
                    {errors.nome ? <p className="text-sm text-red-500">{errors.nome}</p> : null}
                  </div>

                  <div className="cadastros-field">
                    <label>Descrição</label>
                    <Input
                      value={form.descricao}
                      onChange={(event) => onFormChange("descricao", event.target.value)}
                      placeholder="Ex: Relação completa com coroa, pinhão e corrente"
                    />
                    {errors.descricao ? <p className="text-sm text-red-500">{errors.descricao}</p> : null}
                  </div>
                </div>
              </div>
            </div>
            <div className="cadastros-dialog__footer">
              <Button onClick={onCreate} disabled={isSubmitting} className="cadastros-primary-button w-full sm:w-auto">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Salvar peça
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
              <DialogTitle>Editar peça</DialogTitle>
              <DialogDescription>
                Atualize o nome e a descrição para manter a base de peças organizada.
              </DialogDescription>
            </DialogHeader>
            <div className="cadastros-dialog__body">
              <CadastroErrorAlert title="Revise os dados da peça" messages={editErrorMessages} />
              <div className="cadastros-form-section cadastros-form-section--single">
                <div className="cadastros-form-section__header">
                  <h3>Editar peça</h3>
                  <p>Ajuste a nomenclatura para manter a base consistente.</p>
                </div>
                <div className="cadastros-form-stack">
                  <div className="cadastros-field">
                    <label>Nome da peça</label>
                    <Input
                      value={editForm.nome}
                      onChange={(event) => onEditFormChange("nome", event.target.value)}
                      placeholder="Ex: Kit relação"
                    />
                    {editErrors.nome ? <p className="text-sm text-red-500">{editErrors.nome}</p> : null}
                  </div>

                  <div className="cadastros-field">
                    <label>Descrição</label>
                    <Input
                      value={editForm.descricao}
                      onChange={(event) => onEditFormChange("descricao", event.target.value)}
                      placeholder="Ex: Relação completa com coroa, pinhão e corrente"
                    />
                    {editErrors.descricao ? <p className="text-sm text-red-500">{editErrors.descricao}</p> : null}
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
          title="Não foi possível carregar as peças"
          messages={loadErrorMessage ? [loadErrorMessage] : []}
        />
        <div className="mb-4">
          <Input
            placeholder="Buscar peça por nome..."
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
          />
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="-mx-2 overflow-x-auto px-2">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left">Peça</th>
                  <th className="px-4 py-3 text-left">Descrição</th>
                  <th className="px-4 py-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{item.nome}</td>
                      <td className="px-4 py-3">{item.descricao || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
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
                    <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhuma peça cadastrada.
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
