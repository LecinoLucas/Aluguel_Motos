import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { ManutencaoFormValues } from "../validation";
import { CadastroErrorAlert } from "@/features/cadastros/components/CadastroErrorAlert";

interface CreateManutencaoDialogProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  form: UseFormReturn<ManutencaoFormValues>;
  motos: Array<{ id: number; marca?: string; modelo?: string; placa?: string }>;
  tiposManutencao: Array<{
    id: number;
    nome: string;
    descricao?: string | null;
    intervaloDiasPadrao?: number | null;
  }>;
  isSubmitting: boolean;
  isCreatingTipoManutencao: boolean;
  onSubmit: (data: ManutencaoFormValues) => void | Promise<void>;
  onCreateTipoManutencao: (data: {
    nome: string;
    descricao?: string;
    intervaloDiasPadrao?: number;
  }) => Promise<void> | void;
}

function formatMotoLabel(moto: { marca?: string; modelo?: string; placa?: string }) {
  const name = [moto.marca, moto.modelo].filter(Boolean).join(" / ");
  return `${name || "Moto"} ${moto.placa ? `(${moto.placa})` : ""}`.trim();
}

export function CreateManutencaoDialog({
  open,
  onOpenChange,
  form,
  motos,
  tiposManutencao,
  isSubmitting,
  isCreatingTipoManutencao,
  onSubmit,
  onCreateTipoManutencao,
}: CreateManutencaoDialogProps) {
  const [tipoDialogOpen, setTipoDialogOpen] = useState(false);
  const [novoTipoNome, setNovoTipoNome] = useState("");
  const [novoTipoDescricao, setNovoTipoDescricao] = useState("");
  const [novoTipoIntervalo, setNovoTipoIntervalo] = useState("");
  const [tipoDialogErrors, setTipoDialogErrors] = useState<string[]>([]);

  const handleSelectTipo = (value: string) => {
    form.setValue("tipo", value, { shouldValidate: true });
    const selectedTipo = tiposManutencao.find((item) => item.nome === value);
    if (selectedTipo?.intervaloDiasPadrao && !form.getValues("intervaloDiasPrevisto")) {
      form.setValue("intervaloDiasPrevisto", selectedTipo.intervaloDiasPadrao, { shouldValidate: true });
    }
  };

  const resetTipoDialog = () => {
    setNovoTipoNome("");
    setNovoTipoDescricao("");
    setNovoTipoIntervalo("");
    setTipoDialogErrors([]);
  };

  const handleCreateTipo = async () => {
    const nextErrors: string[] = [];
    if (!novoTipoNome.trim()) nextErrors.push("Informe o nome do tipo de manutenção.");
    else if (novoTipoNome.trim().length < 2) nextErrors.push("O nome do tipo precisa ter pelo menos 2 caracteres.");

    if (novoTipoDescricao.trim().length > 240) {
      nextErrors.push("A descrição do tipo pode ter no máximo 240 caracteres.");
    }

    if (novoTipoIntervalo.trim()) {
      const intervalo = Number(novoTipoIntervalo);
      if (!Number.isInteger(intervalo) || intervalo <= 0) {
        nextErrors.push("O intervalo padrão deve ser um número inteiro positivo.");
      }
    }

    if (nextErrors.length > 0) {
      setTipoDialogErrors(nextErrors);
      return;
    }

    await onCreateTipoManutencao({
      nome: novoTipoNome.trim(),
      descricao: novoTipoDescricao.trim() || undefined,
      intervaloDiasPadrao: novoTipoIntervalo.trim() ? Number(novoTipoIntervalo) : undefined,
    });

    handleSelectTipo(novoTipoNome.trim());
    resetTipoDialog();
    setTipoDialogOpen(false);
  };

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
                    {formatMotoLabel(moto)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.motoId ? (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.motoId.message?.toString()}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium">Peça / componente</label>
            <Input placeholder="Ex: Kit relação, pastilha de freio, óleo" {...form.register("peca")} />
            {form.formState.errors.peca ? (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.peca.message?.toString()}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium">Tipo de Manutenção</label>
            <div className="mt-1 flex gap-2">
              <Select value={form.watch("tipo") || undefined} onValueChange={handleSelectTipo}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione um tipo cadastrado" />
                </SelectTrigger>
                <SelectContent>
                  {tiposManutencao.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.nome}>
                      {tipo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" size="icon" onClick={() => setTipoDialogOpen(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">KM atual</label>
              <Input type="number" min="0" step="1" placeholder="Ex: 45210" {...form.register("kmAtual")} />
            </div>
            <div>
              <label className="text-sm font-medium">Intervalo esperado (dias)</label>
              <Input type="number" min="1" step="1" placeholder="Ex: 30" {...form.register("intervaloDiasPrevisto")} />
            </div>
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

        <Dialog
          open={tipoDialogOpen}
          onOpenChange={(nextOpen) => {
            setTipoDialogOpen(nextOpen);
            if (!nextOpen) resetTipoDialog();
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Novo tipo de manutenção</DialogTitle>
              <DialogDescription>
                Cadastre um tipo novo sem sair da manutenção.
              </DialogDescription>
            </DialogHeader>

            <CadastroErrorAlert title="Revise os dados do tipo" messages={tipoDialogErrors} />

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={novoTipoNome}
                  onChange={(event) => setNovoTipoNome(event.target.value)}
                  placeholder="Ex: Troca de óleo"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Input
                  value={novoTipoDescricao}
                  onChange={(event) => setNovoTipoDescricao(event.target.value)}
                  placeholder="Ex: Serviço preventivo do motor"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Intervalo padrão (dias)</label>
                <Input
                  value={novoTipoIntervalo}
                  onChange={(event) => setNovoTipoIntervalo(event.target.value)}
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Ex: 30"
                  className="mt-1"
                />
              </div>

              <Button type="button" onClick={handleCreateTipo} disabled={isCreatingTipoManutencao} className="w-full">
                {isCreatingTipoManutencao ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Salvar tipo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
