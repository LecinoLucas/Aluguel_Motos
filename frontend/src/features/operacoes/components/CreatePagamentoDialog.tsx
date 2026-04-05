import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { PagamentoFormValues } from "../validation";

interface CreatePagamentoDialogProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  form: UseFormReturn<PagamentoFormValues>;
  trigger?: ReactNode;
  contratos: Array<{ id: number; label: string }>;
  motos: Array<{ id: number; label: string }>;
  isSubmitting: boolean;
  onSubmit: (data: PagamentoFormValues) => void | Promise<void>;
}

export function CreatePagamentoDialog({
  open,
  onOpenChange,
  form,
  trigger,
  contratos,
  motos,
  isSubmitting,
  onSubmit,
}: CreatePagamentoDialogProps) {
  const tipo = form.watch("tipo");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button className="w-full gap-2 sm:w-auto">
            <Plus className="h-4 w-4" />
            Nova conta
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Lançamento Financeiro</DialogTitle>
          <DialogDescription>Cadastre uma conta manual de receber ou pagar vinculada a contrato, moto ou manutenção.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tipo</label>
            <Select
              value={form.watch("tipo")}
              onValueChange={(value) => form.setValue("tipo", value as "receber" | "pagar", { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receber">Conta a Receber</SelectItem>
                <SelectItem value="pagar">Conta a Pagar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Contrato</label>
            <Select
              value={form.watch("contratoId") ? String(form.watch("contratoId")) : undefined}
              onValueChange={(value) => form.setValue("contratoId", Number(value), { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Opcional" />
              </SelectTrigger>
              <SelectContent>
                {contratos.map((contrato) => (
                  <SelectItem key={contrato.id} value={contrato.id.toString()}>
                    {contrato.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.contratoId ? (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.contratoId.message?.toString()}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium">Moto</label>
            <Select
              value={form.watch("motoId") ? String(form.watch("motoId")) : undefined}
              onValueChange={(value) => form.setValue("motoId", Number(value), { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Opcional" />
              </SelectTrigger>
              <SelectContent>
                {motos.map((moto) => (
                  <SelectItem key={moto.id} value={moto.id.toString()}>
                    {moto.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.motoId ? (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.motoId.message?.toString()}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium">Descrição</label>
            <Input placeholder={tipo === "pagar" ? "Ex.: troca de pneu, guincho, documentação" : "Ex.: repasse, taxa, caução"} {...form.register("descricao")} />
          </div>

          <div>
            <label className="text-sm font-medium">Valor (R$)</label>
            <Input type="number" step="0.01" placeholder="500.00" {...form.register("valor")} />
            {form.formState.errors.valor ? (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.valor.message?.toString()}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium">Vencimento</label>
            <Input type="date" {...form.register("data")} />
            {form.formState.errors.data ? (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.data.message?.toString()}</p>
            ) : null}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Criar lançamento
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
