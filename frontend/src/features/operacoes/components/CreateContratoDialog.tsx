import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { ContratoFormValues } from "../validation";

interface CreateContratoDialogProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  form: UseFormReturn<ContratoFormValues>;
  clientes: Array<{ id: number; nome: string }>;
  motos: Array<{ id: number; modelo?: string; placa?: string }>;
  isSubmitting: boolean;
  onSubmit: (data: ContratoFormValues) => void | Promise<void>;
}

export function CreateContratoDialog({
  open,
  onOpenChange,
  form,
  clientes,
  motos,
  isSubmitting,
  onSubmit,
}: CreateContratoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2 sm:w-auto">
          <Plus className="h-4 w-4" />
          Novo Contrato
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Contrato</DialogTitle>
          <DialogDescription>Preencha os dados do contrato</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Cliente</label>
            <Select onValueChange={(value) => form.setValue("clienteId", Number(value), { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id.toString()}>
                    {cliente.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.clienteId ? (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.clienteId.message?.toString()}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium">Moto</label>
            <Select onValueChange={(value) => form.setValue("motoId", Number(value), { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma moto" />
              </SelectTrigger>
              <SelectContent>
                {motos.map((moto) => (
                  <SelectItem key={moto.id} value={moto.id.toString()}>
                    {moto.modelo} ({moto.placa})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.motoId ? (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.motoId.message?.toString()}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium">Data de Início</label>
            <Input type="date" {...form.register("dataInicio")} />
            {form.formState.errors.dataInicio ? (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.dataInicio.message?.toString()}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium">Data de Fim</label>
            <Input type="date" {...form.register("dataFim")} />
            {form.formState.errors.dataFim ? (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.dataFim.message?.toString()}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium">Valor Diário (R$)</label>
            <Input type="number" step="0.01" placeholder="100.00" {...form.register("valorDiario")} />
            {form.formState.errors.valorDiario ? (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.valorDiario.message?.toString()}</p>
            ) : null}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Criar Contrato
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
