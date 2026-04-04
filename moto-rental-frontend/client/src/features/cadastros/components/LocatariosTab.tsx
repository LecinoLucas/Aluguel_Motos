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
import { Edit2, Loader2, Plus, Trash2 } from "lucide-react";
import { LocatarioFormFields } from "./LocatarioFormFields";
import type { LocatarioField, LocatarioFormData, LocatarioFormErrors, LocatarioRecord } from "../types";

interface LocatariosTabProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  form: LocatarioFormData;
  errors?: LocatarioFormErrors;
  onFormChange: (field: LocatarioField, value: string) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  items: LocatarioRecord[];
  isLoading: boolean;
  isSubmitting: boolean;
  onCreate: () => void;
  onEdit: (item: LocatarioRecord) => void;
  onDelete: (id: number) => void;
  title?: string;
  createLabel?: string;
  createDialogTitle?: string;
  createDialogDescription?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  showEditAction?: boolean;
}

export function LocatariosTab({
  open,
  onOpenChange,
  form,
  errors,
  onFormChange,
  searchTerm,
  onSearchTermChange,
  items,
  isLoading,
  isSubmitting,
  onCreate,
  onEdit,
  onDelete,
  title = "Locatários",
  createLabel = "Novo Locatário",
  createDialogTitle = "Cadastrar Locatário",
  createDialogDescription = "Dados do cliente locatário",
  searchPlaceholder = "Buscar locatário por nome ou CPF...",
  emptyMessage = 'Nenhum locatário cadastrado.',
  showEditAction = true,
}: LocatariosTabProps) {
  return (
    <Card className="cadastros-section-card">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Total: {items.length}</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2 sm:w-auto">
              <Plus className="h-4 w-4" />
              {createLabel}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{createDialogTitle}</DialogTitle>
              <DialogDescription>{createDialogDescription}</DialogDescription>
            </DialogHeader>
            <LocatarioFormFields
              form={form}
              errors={errors}
              onChange={onFormChange}
            />
            <Button onClick={onCreate} disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Locatário
            </Button>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="-mx-2 overflow-x-auto px-2">
            <table className="w-full min-w-[1280px]">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left">Nome</th>
                  <th className="px-4 py-3 text-left">CPF</th>
                  <th className="px-4 py-3 text-left">CNH</th>
                  <th className="px-4 py-3 text-left">RG</th>
                  <th className="px-4 py-3 text-left">Telefone</th>
                  <th className="px-4 py-3 text-left">Cidade/UF</th>
                  <th className="px-4 py-3 text-left">Endereço</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{item.nome}</td>
                      <td className="px-4 py-3">{item.cpf}</td>
                      <td className="px-4 py-3">{item.cnh}</td>
                      <td className="px-4 py-3">{item.rg || "-"}</td>
                      <td className="px-4 py-3">{item.telefone || "-"}</td>
                      <td className="px-4 py-3">{[item.cidade, item.estado].filter(Boolean).join(" / ") || "-"}</td>
                      <td className="px-4 py-3">{item.endereco || "-"}</td>
                      <td className="px-4 py-3">{item.email || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
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
                    <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
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
