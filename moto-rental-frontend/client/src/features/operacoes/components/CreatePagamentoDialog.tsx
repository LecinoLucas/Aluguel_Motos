import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { PagamentoFormValues } from "../validation";

interface CreatePagamentoDialogProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  form: UseFormReturn<PagamentoFormValues>;
  contratos: Array<{ id: number }>;
  isSubmitting: boolean;
  onSubmit: (data: PagamentoFormValues) => void | Promise<void>;
}

export function CreatePagamentoDialog({
  open,
  onOpenChange,
  form,
  contratos,
  isSubmitting,
  onSubmit,
}: CreatePagamentoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2 sm:w-auto">
          <Plus className="h-4 w-4" />
          Registrar Pagamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
          <DialogDescription>Preencha os dados do pagamento</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Contrato</label>
            <Select onValueChange={(value) => form.setValue("contratoId", Number(value), { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um contrato" />
              </SelectTrigger>
              <SelectContent>
                {contratos.map((contrato) => (
                  <SelectItem key={contrato.id} value={contrato.id.toString()}>
                    Contrato #{contrato.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.contratoId ? (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.contratoId.message?.toString()}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium">Valor (R$)</label>
            <Input type="number" step="0.01" placeholder="500.00" {...form.register("valor")} />
            {form.formState.errors.valor ? (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.valor.message?.toString()}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium">Data</label>
            <Input type="date" {...form.register("data")} />
            {form.formState.errors.data ? (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.data.message?.toString()}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>
            <Select defaultValue="pendente" onValueChange={(value) => form.setValue("status", value as PagamentoFormValues["status"], { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="atrasado">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Registrar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
