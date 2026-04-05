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
            <Button className="w-full gap-2 sm:w-auto">
              <Plus className="h-4 w-4" />
              Novo Tipo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Cadastrar tipo de manutenção</DialogTitle>
              <DialogDescription>
                Crie tipos padronizados para usar na manutenção e agilizar o preenchimento da modal.
              </DialogDescription>
            </DialogHeader>
            <CadastroErrorAlert title="Revise os dados do tipo" messages={errorMessages} />
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do tipo</label>
                <Input
                  value={form.nome}
                  onChange={(event) => onFormChange("nome", event.target.value)}
                  placeholder="Ex: Troca de óleo"
                  className="mt-1"
                />
                {errors.nome ? <p className="mt-1 text-sm text-red-500">{errors.nome}</p> : null}
              </div>

              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Input
                  value={form.descricao}
                  onChange={(event) => onFormChange("descricao", event.target.value)}
                  placeholder="Ex: Manutenção preventiva do motor"
                  className="mt-1"
                />
                {errors.descricao ? <p className="mt-1 text-sm text-red-500">{errors.descricao}</p> : null}
              </div>

              <div>
                <label className="text-sm font-medium">Intervalo padrão (dias)</label>
                <Input
                  value={form.intervaloDiasPadrao}
                  onChange={(event) => onFormChange("intervaloDiasPadrao", event.target.value)}
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Ex: 30"
                  className="mt-1"
                />
                {errors.intervaloDiasPadrao ? (
                  <p className="mt-1 text-sm text-red-500">{errors.intervaloDiasPadrao}</p>
                ) : null}
              </div>
            </div>
            <Button onClick={onCreate} disabled={isSubmitting} className="w-full">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar Tipo
            </Button>
          </DialogContent>
        </Dialog>
        <Dialog open={editOpen} onOpenChange={onEditOpenChange}>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar tipo de manutenção</DialogTitle>
              <DialogDescription>
                Atualize o nome, a descrição ou o intervalo padrão para manter a manutenção padronizada.
              </DialogDescription>
            </DialogHeader>
            <CadastroErrorAlert title="Revise os dados do tipo" messages={editErrorMessages} />
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do tipo</label>
                <Input
                  value={editForm.nome}
                  onChange={(event) => onEditFormChange("nome", event.target.value)}
                  placeholder="Ex: Troca de óleo"
                  className="mt-1"
                />
                {editErrors.nome ? <p className="mt-1 text-sm text-red-500">{editErrors.nome}</p> : null}
              </div>

              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Input
                  value={editForm.descricao}
                  onChange={(event) => onEditFormChange("descricao", event.target.value)}
                  placeholder="Ex: Manutenção preventiva do motor"
                  className="mt-1"
                />
                {editErrors.descricao ? <p className="mt-1 text-sm text-red-500">{editErrors.descricao}</p> : null}
              </div>

              <div>
                <label className="text-sm font-medium">Intervalo padrão (dias)</label>
                <Input
                  value={editForm.intervaloDiasPadrao}
                  onChange={(event) => onEditFormChange("intervaloDiasPadrao", event.target.value)}
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Ex: 30"
                  className="mt-1"
                />
                {editErrors.intervaloDiasPadrao ? (
                  <p className="mt-1 text-sm text-red-500">{editErrors.intervaloDiasPadrao}</p>
                ) : null}
              </div>
            </div>
            <Button onClick={onUpdate} disabled={isUpdating} className="w-full">
              {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar alterações
            </Button>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <CadastroErrorAlert
          title="Não foi possível carregar os tipos de manutenção"
          messages={loadErrorMessage ? [loadErrorMessage] : []}
        />
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="-mx-2 overflow-x-auto px-2">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Descrição</th>
                  <th className="px-4 py-3 text-left">Intervalo padrão</th>
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
                        {item.intervaloDiasPadrao ? `${item.intervaloDiasPadrao} dias` : "-"}
                      </td>
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
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
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
