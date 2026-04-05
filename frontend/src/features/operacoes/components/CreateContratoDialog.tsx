import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { ContratoFormValues } from "../validation";

interface CreateContratoDialogProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  form: UseFormReturn<ContratoFormValues>;
  trigger?: ReactNode;
  dialogClassName?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
  readonlyLocadoresLabel?: string;
  readonlyLocatarioLabel?: string;
  readonlyVeiculoLabel?: string;
  locadores: Array<{ id: number; nome: string; cpf?: string | null }>;
  locatarios: Array<{ id: number; nome: string }>;
  veiculos: Array<{
    id: number;
    marca?: string;
    modelo?: string;
    placa?: string;
    disponibilidadeManual?: "automatico" | "disponivel" | "indisponivel";
    status?: string;
  }>;
  isSubmitting: boolean;
  onSubmit: (data: ContratoFormValues) => void | Promise<void>;
}

function formatVeiculoLabel(veiculo: { marca?: string; modelo?: string; placa?: string }) {
  const nome = [veiculo.marca, veiculo.modelo].filter(Boolean).join(" / ");
  const base = nome || "Veículo";
  return veiculo.placa ? `${base} (${veiculo.placa})` : base;
}

function parseCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return 0;
  return Number(digits) / 100;
}

function parseCurrencyValue(value: number | string | undefined) {
  if (typeof value === "number") return value;
  if (value === undefined) return Number.NaN;

  const raw = value.trim();
  if (!raw) return Number.NaN;

  if (raw.includes(",")) {
    return Number(raw.replace(/\./g, "").replace(",", "."));
  }

  const parts = raw.split(".");
  if (parts.length > 2) {
    return Number(parts.join(""));
  }

  return Number(raw);
}

function formatCurrencyInput(value: number | string | undefined) {
  const amount = parseCurrencyValue(value);

  if (amount === undefined || Number.isNaN(amount)) return "";

  return amount.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function CreateContratoDialog({
  open,
  onOpenChange,
  form,
  trigger,
  dialogClassName,
  title = "Criar Novo Contrato",
  description = "Preencha os dados do contrato",
  submitLabel = "Criar Contrato",
  readonlyLocadoresLabel,
  readonlyLocatarioLabel,
  readonlyVeiculoLabel,
  locadores,
  locatarios,
  veiculos,
  isSubmitting,
  onSubmit,
}: CreateContratoDialogProps) {
  const selectedLocadorIds = form.watch("locadorIds") ?? [];
  const valorSemanal = form.watch("valorSemanal");
  const hasLocadores = readonlyLocadoresLabel ? true : locadores.length > 0;
  const hasLocatarios = readonlyLocatarioLabel ? true : locatarios.length > 0;
  const hasVeiculos = readonlyVeiculoLabel ? true : veiculos.length > 0;
  const isSubmitDisabled = isSubmitting || !hasLocadores || !hasLocatarios || !hasVeiculos;

  const toggleLocador = (locadorId: number, checked: boolean | "indeterminate") => {
    const nextIds = checked
      ? Array.from(new Set([...selectedLocadorIds, locadorId]))
      : selectedLocadorIds.filter((id) => id !== locadorId);

    form.setValue("locadorIds", nextIds, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className={`${dialogClassName ?? ""} max-h-[85vh] overflow-y-auto sm:max-w-md`.trim()}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Locadores</label>
            {readonlyLocadoresLabel ? (
              <Input value={readonlyLocadoresLabel} readOnly className="mt-1" />
            ) : (
              <div className="mt-2 space-y-2 rounded-lg border border-border/70 bg-background/60 p-3">
                {locadores.length > 0 ? (
                  locadores.map((locador) => {
                    const inputId = `contrato-locador-${locador.id}`;
                    return (
                      <div key={locador.id} className="flex items-start gap-3 rounded-md border border-border/50 bg-background/70 px-3 py-2">
                        <Checkbox
                          id={inputId}
                          checked={selectedLocadorIds.includes(locador.id)}
                          onCheckedChange={(checked) => toggleLocador(locador.id, checked)}
                        />
                        <Label htmlFor={inputId} className="flex-1 cursor-pointer items-start">
                          <span className="flex flex-col gap-1 leading-snug">
                            <span>{locador.nome}</span>
                            <span className="text-xs font-normal text-muted-foreground">{locador.cpf || "CPF não informado"}</span>
                          </span>
                        </Label>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-1 text-sm text-muted-foreground">Cadastre um locador em Cadastros primeiro.</div>
                )}
              </div>
            )}
            {form.formState.errors.locadorIds ? (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.locadorIds.message?.toString()}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium">Locatário</label>
            {readonlyLocatarioLabel ? (
              <Input value={readonlyLocatarioLabel} readOnly className="mt-1" />
            ) : (
              <Select
                value={form.watch("locatarioId") ? String(form.watch("locatarioId")) : undefined}
                onValueChange={(value) => form.setValue("locatarioId", Number(value), { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um locatário" />
                </SelectTrigger>
                <SelectContent>
                  {locatarios.length > 0 ? (
                    locatarios.map((locatario) => (
                      <SelectItem key={locatario.id} value={locatario.id.toString()}>
                        {locatario.nome}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">Cadastre um locatário em Cadastros primeiro.</div>
                  )}
                </SelectContent>
              </Select>
            )}
            {form.formState.errors.locatarioId ? (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.locatarioId.message?.toString()}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium">Veículo</label>
            {readonlyVeiculoLabel ? (
              <Input value={readonlyVeiculoLabel} readOnly className="mt-1" />
            ) : (
              <Select
                value={form.watch("motoId") ? String(form.watch("motoId")) : undefined}
                onValueChange={(value) => form.setValue("motoId", Number(value), { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um veículo" />
                </SelectTrigger>
                <SelectContent>
                  {veiculos.length > 0 ? (
                    veiculos.map((veiculo) => (
                      <SelectItem key={veiculo.id} value={veiculo.id.toString()}>
                        {formatVeiculoLabel(veiculo)}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">Nenhum veículo disponível no momento.</div>
                  )}
                </SelectContent>
              </Select>
            )}
            {form.formState.errors.motoId ? (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.motoId.message?.toString()}</p>
            ) : null}
            {!readonlyVeiculoLabel && !hasVeiculos ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Verifique se o veículo está cadastrado, sem contrato ativo e sem bloqueio manual.
              </p>
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
            <label className="text-sm font-medium">Valor Semanal (R$)</label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="250,00"
              value={formatCurrencyInput(valorSemanal)}
              onFocus={(event) => event.currentTarget.select()}
              onChange={(event) =>
                form.setValue("valorSemanal", parseCurrencyInput(event.target.value), {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            />
            {form.formState.errors.valorSemanal ? (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.valorSemanal.message?.toString()}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium">Dias após a data final</label>
            <Input type="number" min="0" step="1" placeholder="0" {...form.register("diasAposFim")} />
            {form.formState.errors.diasAposFim ? (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.diasAposFim.message?.toString()}</p>
            ) : null}
            <p className="mt-1 text-xs text-muted-foreground">
              O vencimento de cada cobrança semanal será calculado com base no fim da semana + esse número de dias.
            </p>
          </div>

          <Button type="submit" disabled={isSubmitDisabled} className="w-full">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {submitLabel}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
