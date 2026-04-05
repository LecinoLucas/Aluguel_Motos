import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { ManutencaoFormValues } from "../validation";

interface CreateManutencaoDialogProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  form: UseFormReturn<ManutencaoFormValues>;
  motos: Array<{ id: number; modelo?: string; placa?: string }>;
  isSubmitting: boolean;
  onSubmit: (data: ManutencaoFormValues) => void | Promise<void>;
}

export function CreateManutencaoDialog({
  open,
  onOpenChange,
  form,
  motos,
  isSubmitting,
  onSubmit,
}: CreateManutencaoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2 sm:w-auto">
          <Plus className="h-4 w-4" />
          Registrar Manutenção
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Manutenção</DialogTitle>
          <DialogDescription>Preencha os dados da manutenção</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <label className="text-sm font-medium">Tipo de Manutenção</label>
            <Input placeholder="Ex: Troca de óleo" {...form.register("tipo")} />
            {form.formState.errors.tipo ? (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.tipo.message?.toString()}</p>
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
            <label className="text-sm font-medium">Custo (R$)</label>
            <Input type="number" step="0.01" placeholder="150.00" {...form.register("custo")} />
            {form.formState.errors.custo ? (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.custo.message?.toString()}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium">Descrição</label>
            <Input placeholder="Descrição detalhada (opcional)" {...form.register("descricao")} />
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
