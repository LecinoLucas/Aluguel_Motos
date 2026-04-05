import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";
import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { MultaFormValues } from "../validation";

interface CreateMultaDialogProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  form: UseFormReturn<MultaFormValues>;
  trigger?: ReactNode;
  hideTrigger?: boolean;
  contratos: Array<{ id: number; label: string }>;
  isSubmitting: boolean;
  onSubmit: (data: MultaFormValues) => void | Promise<void>;
  title?: string;
  description?: string;
  submitLabel?: string;
}

export function CreateMultaDialog({
  open,
  onOpenChange,
  form,
  trigger,
  hideTrigger = false,
  contratos,
  isSubmitting,
  onSubmit,
  title = "Nova ocorrência",
  description = "Cadastre multa ou prejuízo vinculado ao contrato para controlar pagamento, desconto na caução e saldo final.",
  submitLabel = "Salvar ocorrência",
}: CreateMultaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {hideTrigger ? null : trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button className="w-full gap-2 sm:w-auto">
            <Plus className="h-4 w-4" />
            Nova ocorrência
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Contrato</label>
            <Select
              value={form.watch("contratoId") ? String(form.watch("contratoId")) : undefined}
              onValueChange={(value) => form.setValue("contratoId", Number(value), { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o contrato" />
              </SelectTrigger>
              <SelectContent>
                {contratos.map((contrato) => (
                  <SelectItem key={contrato.id} value={String(contrato.id)}>
                    {contrato.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.contratoId ? (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.contratoId.message?.toString()}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Tipo</label>
              <Select
                value={form.watch("tipo")}
                onValueChange={(value) => form.setValue("tipo", value as "multa" | "prejuizo", { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multa">Multa</SelectItem>
                  <SelectItem value="prejuizo">Prejuízo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) =>
                  form.setValue("status", value as "pendente" | "pago" | "descontado_caucao", { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="descontado_caucao">Descontado da caução</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Responsável</label>
            <Input placeholder="Ex.: locatário, terceiro, devolução com avaria" {...form.register("responsavel")} />
            {form.formState.errors.responsavel ? (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.responsavel.message?.toString()}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium">Descrição</label>
            <Textarea
              rows={3}
              placeholder="Ex.: multa de trânsito, carenagem quebrada, farol danificado, documento atrasado"
              {...form.register("descricao")}
            />
            {form.formState.errors.descricao ? (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.descricao.message?.toString()}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Data</label>
              <Input type="date" {...form.register("data")} />
              {form.formState.errors.data ? (
                <p className="mt-1 text-sm text-red-500">{form.formState.errors.data.message?.toString()}</p>
              ) : null}
            </div>

            <div>
              <label className="text-sm font-medium">Valor (R$)</label>
              <Input type="number" step="0.01" placeholder="150.00" {...form.register("valor")} />
              {form.formState.errors.valor ? (
                <p className="mt-1 text-sm text-red-500">{form.formState.errors.valor.message?.toString()}</p>
              ) : null}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Observação</label>
            <Textarea rows={2} placeholder="Opcional" {...form.register("observacao")} />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {submitLabel}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
