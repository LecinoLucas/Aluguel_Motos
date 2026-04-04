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
import { Loader2, Plus, Trash2 } from "lucide-react";
import { VeiculoFormFields } from "./VeiculoFormFields";
import type { VeiculoField, VeiculoFormData, VeiculoFormErrors, VeiculoRecord } from "../types";

interface VeiculosTabProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  form: VeiculoFormData;
  errors?: VeiculoFormErrors;
  onFormChange: (field: VeiculoField, value: string) => void;
  items: VeiculoRecord[];
  isLoading: boolean;
  isSubmitting: boolean;
  onCreate: () => void;
  onDelete: (id: number) => void;
  title?: string;
  createLabel?: string;
  createDialogTitle?: string;
  createDialogDescription?: string;
  emptyMessage?: string;
}

export function VeiculosTab({
  open,
  onOpenChange,
  form,
  errors,
  onFormChange,
  items,
  isLoading,
  isSubmitting,
  onCreate,
  onDelete,
  title = "Veículos",
  createLabel = "Novo Veículo",
  createDialogTitle = "Cadastrar Veículo",
  createDialogDescription = "Dados da moto/veículo para contrato",
  emptyMessage = 'Nenhum veículo cadastrado.',
}: VeiculosTabProps) {
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
            <VeiculoFormFields
              form={form}
              errors={errors}
              onChange={onFormChange}
            />
            <Button onClick={onCreate} disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Veículo
            </Button>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="-mx-2 overflow-x-auto px-2">
            <table className="w-full min-w-[1180px]">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left">Marca / Modelo</th>
                  <th className="px-4 py-3 text-left">Placa</th>
                  <th className="px-4 py-3 text-left">Ano Fab/Mod</th>
                  <th className="px-4 py-3 text-left">Cor</th>
                  <th className="px-4 py-3 text-left">Chassi</th>
                  <th className="px-4 py-3 text-left">RENAVAM</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{[item.marca, item.modelo].filter(Boolean).join(" / ")}</td>
                      <td className="px-4 py-3">{item.placa}</td>
                      <td className="px-4 py-3">{item.anoModelo ? `${item.ano}/${item.anoModelo}` : item.ano}</td>
                      <td className="px-4 py-3">{item.cor || "-"}</td>
                      <td className="px-4 py-3 font-mono">{item.chassi || "-"}</td>
                      <td className="px-4 py-3">{item.renavam || "-"}</td>
                      <td className="px-4 py-3">{item.status}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
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
