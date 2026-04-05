import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { ManutencaoFormValues } from "../validation";
import { CadastroErrorAlert } from "@/features/cadastros/components/CadastroErrorAlert";

interface CreateManutencaoDialogProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  form: UseFormReturn<ManutencaoFormValues>;
  mode?: "create" | "edit";
  trigger?: ReactNode;
  dialogClassName?: string;
  contratos: Array<{ id: number; motoId: number; label: string }>;
  motos: Array<{ id: number; marca?: string; modelo?: string; placa?: string }>;
  pecas: Array<{
    id: number;
    nome: string;
    descricao?: string | null;
  }>;
  tiposManutencao: Array<{
    id: number;
    nome: string;
    descricao?: string | null;
    intervaloDiasPadrao?: number | null;
  }>;
  isSubmitting: boolean;
  isCreatingPeca: boolean;
  isCreatingTipoManutencao: boolean;
  onSubmit: (data: ManutencaoFormValues) => void | Promise<void>;
  onCreatePeca: (data: {
    nome: string;
    descricao?: string;
  }) => Promise<void> | void;
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
  mode = "create",
  trigger,
  contratos,
  motos,
  pecas,
  tiposManutencao,
  isSubmitting,
  isCreatingPeca,
  isCreatingTipoManutencao,
  onSubmit,
  onCreatePeca,
  onCreateTipoManutencao,
  dialogClassName,
}: CreateManutencaoDialogProps) {
  const [pecaDialogOpen, setPecaDialogOpen] = useState(false);
  const [novaPecaNome, setNovaPecaNome] = useState("");
  const [novaPecaDescricao, setNovaPecaDescricao] = useState("");
  const [pecaDialogErrors, setPecaDialogErrors] = useState<string[]>([]);
  const [tipoDialogOpen, setTipoDialogOpen] = useState(false);
  const [novoTipoNome, setNovoTipoNome] = useState("");
  const [novoTipoDescricao, setNovoTipoDescricao] = useState("");
  const [novoTipoIntervalo, setNovoTipoIntervalo] = useState("");
  const [tipoDialogErrors, setTipoDialogErrors] = useState<string[]>([]);
  const selectedContratoId = form.watch("contratoId");
  const selectedMotoId = form.watch("motoId");
  const selectedTipo = form.watch("tipo") || undefined;
  const dialogTitle = mode === "edit" ? "Editar Manutenção" : "Registrar Manutenção";
  const dialogDescription =
    mode === "edit" ? "Atualize os dados do histórico de manutenção." : "Preencha os dados da manutenção";
  const submitLabel = mode === "edit" ? "Salvar alterações" : "Registrar";

  const handleSelectTipo = (value: string) => {
    form.setValue("tipo", value, { shouldValidate: true });
    const selectedTipo = tiposManutencao.find((item) => item.nome === value);
    if (selectedTipo?.intervaloDiasPadrao && !form.getValues("intervaloDiasPrevisto")) {
      form.setValue("intervaloDiasPrevisto", selectedTipo.intervaloDiasPadrao, { shouldValidate: true });
    }
  };

  const handleSelectContrato = (value: string) => {
    if (value === "0") {
      form.setValue("contratoId", undefined, { shouldValidate: true });
      return;
    }

    const contratoId = Number(value);
    const contrato = contratos.find((item) => item.id === contratoId);
    form.setValue("contratoId", contratoId, { shouldValidate: true });
    if (contrato) {
      form.setValue("motoId", contrato.motoId, { shouldValidate: true });
    }
  };

  const resetTipoDialog = () => {
    setNovoTipoNome("");
    setNovoTipoDescricao("");
    setNovoTipoIntervalo("");
    setTipoDialogErrors([]);
  };

  const resetPecaDialog = () => {
    setNovaPecaNome("");
    setNovaPecaDescricao("");
    setPecaDialogErrors([]);
  };

  const handleCreatePecaClick = async () => {
    const nextErrors: string[] = [];
    if (!novaPecaNome.trim()) nextErrors.push("Informe o nome da peça.");
    else if (novaPecaNome.trim().length < 2) nextErrors.push("O nome da peça precisa ter pelo menos 2 caracteres.");

    if (novaPecaDescricao.trim().length > 240) {
      nextErrors.push("A descrição da peça pode ter no máximo 240 caracteres.");
    }

    if (nextErrors.length > 0) {
      setPecaDialogErrors(nextErrors);
      return;
    }

    await onCreatePeca({
      nome: novaPecaNome.trim(),
      descricao: novaPecaDescricao.trim() || undefined,
    });

    form.setValue("peca", novaPecaNome.trim(), { shouldValidate: true });
    resetPecaDialog();
    setPecaDialogOpen(false);
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
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className={`${dialogClassName ?? ""} max-h-[85vh] overflow-y-auto sm:max-w-md`.trim()}>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Contrato</label>
            <Select
              value={selectedContratoId ? String(selectedContratoId) : "0"}
              onValueChange={handleSelectContrato}
            >
              <SelectTrigger>
                <SelectValue placeholder="Opcional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Sem contrato vinculado</SelectItem>
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
              value={selectedMotoId ? String(selectedMotoId) : undefined}
              onValueChange={(value) => form.setValue("motoId", Number(value), { shouldValidate: true })}
            >
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
            <div className="mt-1 flex gap-2">
              <div className="flex-1">
                <Input
                  list="pecas-cadastradas"
                  placeholder="Ex: Kit relação, pastilha de freio, óleo"
                  {...form.register("peca")}
                />
                <datalist id="pecas-cadastradas">
                  {pecas.map((peca) => (
                    <option key={peca.id} value={peca.nome} />
                  ))}
                </datalist>
              </div>
              <Button type="button" variant="outline" size="icon" onClick={() => setPecaDialogOpen(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {form.formState.errors.peca ? (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.peca.message?.toString()}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium">Tipo de Manutenção</label>
            <div className="mt-1 flex gap-2">
              <Select value={selectedTipo} onValueChange={handleSelectTipo}>
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
            {submitLabel}
          </Button>
        </form>

        <Dialog
          open={pecaDialogOpen}
          onOpenChange={(nextOpen) => {
            setPecaDialogOpen(nextOpen);
            if (!nextOpen) resetPecaDialog();
          }}
        >
          <DialogContent className={`${dialogClassName ?? ""} sm:max-w-md`.trim()}>
            <DialogHeader>
              <DialogTitle>Nova peça</DialogTitle>
              <DialogDescription>
                Cadastre uma peça nova sem sair do registro de manutenção.
              </DialogDescription>
            </DialogHeader>

            <CadastroErrorAlert title="Revise os dados da peça" messages={pecaDialogErrors} />

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={novaPecaNome}
                  onChange={(event) => setNovaPecaNome(event.target.value)}
                  placeholder="Ex: Kit relação"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Input
                  value={novaPecaDescricao}
                  onChange={(event) => setNovaPecaDescricao(event.target.value)}
                  placeholder="Ex: Relação completa com corrente"
                  className="mt-1"
                />
              </div>

              <Button type="button" onClick={handleCreatePecaClick} disabled={isCreatingPeca} className="w-full">
                {isCreatingPeca ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Salvar peça
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={tipoDialogOpen}
          onOpenChange={(nextOpen) => {
            setTipoDialogOpen(nextOpen);
            if (!nextOpen) resetTipoDialog();
          }}
        >
          <DialogContent className={`${dialogClassName ?? ""} sm:max-w-md`.trim()}>
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
