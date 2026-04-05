import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getErrorMessage } from "@/lib/errors";
import { trpc } from "@/lib/trpc";
import type { ClienteListItem, ContratosListInput, LocadorListItem, MotoListItem } from "@/lib/trpc-types";
import { useForm, type DefaultValues, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ContratosTable } from "@/features/operacoes/components/ContratosTable";
import { CreateContratoDialog } from "@/features/operacoes/components/CreateContratoDialog";
import { CloseContratoDialog } from "@/features/operacoes/components/CloseContratoDialog";
import { PageHeaderCard } from "@/features/operacoes/components/PageHeaderCard";
import { StatusFilterCard } from "@/features/operacoes/components/StatusFilterCard";
import { contratoStatusOptions, type ContratoRecord, type ContratoStatusFilter } from "@/features/operacoes/types";
import { addDays, formatDateInputValue, formatMotoLabel, isContratoExpired } from "@/features/operacoes/utils";
import { gerarContratoHTML } from "@/features/gerar-contrato/contract-html";
import { defaultLocador, defaultLocatario, defaultTermos, type ContratoTermos, type LocadorData, type LocatarioData, type VeiculoData } from "@/features/gerar-contrato/types";
import { formatVehicleYear } from "@/features/gerar-contrato/utils";
import { createContratoSchema, type ContratoFormValues } from "@/features/operacoes/validation";
import "@/features/operacoes/operacoes.css";

const CONTRATO_FORM_DEFAULTS: DefaultValues<ContratoFormValues> = {
  locadorIds: [],
  locatarioId: undefined,
  motoId: undefined,
  dataInicio: "",
  dataFim: "",
  valorSemanal: 250,
  diasAposFim: 0,
};

export default function Contratos() {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [editingContrato, setEditingContrato] = useState<ContratoRecord | null>(null);
  const [renewingContrato, setRenewingContrato] = useState<ContratoRecord | null>(null);
  const [closingContrato, setClosingContrato] = useState<ContratoRecord | null>(null);
  const [closingDate, setClosingDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContratoStatusFilter>("ativo");

  const contratosFilters: ContratosListInput = { status: statusFilter === "all" ? undefined : statusFilter };
  const contratos = trpc.contratos.list.useQuery(contratosFilters);
  const locadores = trpc.locadores.list.useQuery();
  const locatarios = trpc.clientes.list.useQuery();
  const veiculos = trpc.motos.list.useQuery({});
  const createContrato = trpc.contratos.create.useMutation();
  const updateContrato = trpc.contratos.update.useMutation();
  const renewContrato = trpc.contratos.renew.useMutation();
  const deleteContrato = trpc.contratos.delete.useMutation();

  const form = useForm<ContratoFormValues>({
    resolver: zodResolver(createContratoSchema) as Resolver<ContratoFormValues>,
    defaultValues: CONTRATO_FORM_DEFAULTS,
  });

  const renewForm = useForm<ContratoFormValues>({
    resolver: zodResolver(createContratoSchema) as Resolver<ContratoFormValues>,
    defaultValues: CONTRATO_FORM_DEFAULTS,
  });

  const editForm = useForm<ContratoFormValues>({
    resolver: zodResolver(createContratoSchema) as Resolver<ContratoFormValues>,
    defaultValues: CONTRATO_FORM_DEFAULTS,
  });

  const parseMoneyValue = (value: number | string) => {
    if (typeof value === "number") return value;

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
  };

  const formatMoneyForContract = (value: number | string) => {
    const amount = parseMoneyValue(value);
    if (Number.isNaN(amount)) return typeof value === "string" ? value : String(value);
    return amount.toFixed(2).replace(".", ",");
  };

  const openContratoWindow = (html: string, title: string) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          @media print {
            body { margin: 0; }
            @page { margin: 2cm; }
          }
        </style>
      </head>
      <body>${html}</body>
      </html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const onSubmit = async (data: ContratoFormValues) => {
    try {
      await createContrato.mutateAsync({
        ...data,
        locadorIds: data.locadorIds,
        dataInicio: new Date(data.dataInicio),
        dataFim: new Date(data.dataFim),
      });
      toast.success("Contrato criado com sucesso!");
      form.reset(CONTRATO_FORM_DEFAULTS);
      setOpen(false);
      await Promise.all([contratos.refetch(), veiculos.refetch()]);
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao criar contrato"));
    }
  };

  const onRenewSubmit = async (data: ContratoFormValues) => {
    if (!renewingContrato) return;

    try {
      await renewContrato.mutateAsync({
        id: renewingContrato.id,
        data: {
          locadorIds: data.locadorIds,
          dataInicio: new Date(data.dataInicio),
          dataFim: new Date(data.dataFim),
          valorSemanal: data.valorSemanal,
          diasAposFim: data.diasAposFim,
        },
      });
      toast.success("Contrato renovado com sucesso!");
      renewForm.reset(CONTRATO_FORM_DEFAULTS);
      setRenewingContrato(null);
      setRenewOpen(false);
      await Promise.all([contratos.refetch(), veiculos.refetch()]);
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao renovar contrato"));
    }
  };

  const handleRenew = (contrato: ContratoRecord) => {
    const defaultStart = addDays(contrato.dataFim, 1);
    const originalStart = new Date(contrato.dataInicio);
    const originalEnd = new Date(contrato.dataFim);
    const durationDays = Math.max(
      1,
      Math.ceil((originalEnd.getTime() - originalStart.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const defaultEnd = addDays(defaultStart, durationDays);

    renewForm.reset({
      locadorIds: contrato.locadorIds ?? [],
      locatarioId: contrato.locatarioId,
      motoId: contrato.motoId,
      dataInicio: formatDateInputValue(defaultStart),
      dataFim: formatDateInputValue(defaultEnd),
      valorSemanal: Number(contrato.valorSemanal),
      diasAposFim: contrato.diasAposFim ?? 0,
    });

    setRenewingContrato(contrato);
    setRenewOpen(true);
  };

  const handleEdit = (contrato: ContratoRecord) => {
    editForm.reset({
      locadorIds: contrato.locadorIds ?? [],
      locatarioId: contrato.locatarioId,
      motoId: contrato.motoId,
      dataInicio: formatDateInputValue(contrato.dataInicio),
      dataFim: formatDateInputValue(contrato.dataFim),
      valorSemanal: Number(contrato.valorSemanal),
      diasAposFim: contrato.diasAposFim ?? 0,
    });
    setEditingContrato(contrato);
    setEditOpen(true);
  };

  const handleClose = (contrato: ContratoRecord) => {
    const hoje = new Date();
    const dataInicio = new Date(contrato.dataInicio);
    const dataFimOriginal = new Date(contrato.dataFim);
    const dataPadrao = hoje < dataInicio ? dataInicio : hoje > dataFimOriginal ? dataFimOriginal : hoje;

    setClosingContrato(contrato);
    setClosingDate(formatDateInputValue(dataPadrao));
    setCloseOpen(true);
  };

  const handleIssueAgain = (contrato: ContratoRecord) => {
    if (contrato.documentoSnapshot) {
      const html = gerarContratoHTML(
        contrato.documentoSnapshot.locadores,
        contrato.documentoSnapshot.locatario,
        contrato.documentoSnapshot.veiculo,
        {
          ...contrato.documentoSnapshot.termos,
          valorSemanal: formatMoneyForContract(contrato.valorSemanal),
        },
      );
      openContratoWindow(html, `Contrato ${String(contrato.id).padStart(6, "0")} - Reimprimir`);
      return;
    }

    const locadorById = new Map(locadorItems.map((item) => [item.id, item]));
    const locatarioById = new Map(locatarioItems.map((item) => [item.id, item]));
    const veiculoById = new Map(veiculoItems.map((item) => [item.id, item]));

    const locadoresContrato = (contrato.locadorIds.length > 0 ? contrato.locadorIds : contrato.locadores.map((item) => item.id))
      .map((id) => locadorById.get(id))
      .filter((item): item is LocadorListItem => Boolean(item))
      .map<LocadorData>((item) => ({
        ...defaultLocador,
        nome: item.nome || "",
        nacionalidade: item.nacionalidade || defaultLocador.nacionalidade,
        estadoCivil: item.estadoCivil || defaultLocador.estadoCivil,
        cpf: item.cpf || "",
        rg: item.rg || "",
        orgaoEmissor: item.orgaoEmissor || "",
        endereco: item.endereco || "",
        cidade: item.cidade || defaultLocador.cidade,
        estado: item.estado || defaultLocador.estado,
        cep: item.cep || "",
        telefone: item.telefone || "",
      }));

    const locatario = locatarioById.get(contrato.locatarioId);
    const veiculo = veiculoById.get(contrato.motoId);

    if (!locadoresContrato.length || !locatario || !veiculo) {
      toast.error("Não foi possível emitir novamente este contrato. Verifique os cadastros vinculados.");
      return;
    }

    const contratoLocatario: LocatarioData = {
      ...defaultLocatario,
      nome: locatario.nome || "",
      nacionalidade: locatario.nacionalidade || defaultLocatario.nacionalidade,
      estadoCivil: locatario.estadoCivil || defaultLocatario.estadoCivil,
      cpf: locatario.cpf || "",
      rg: locatario.rg || "",
      orgaoEmissor: locatario.orgaoEmissor || "",
      endereco: locatario.endereco || "",
      cidade: locatario.cidade || "",
      estado: locatario.estado || "",
      cep: locatario.cep || "",
      telefone: locatario.telefone || "",
      cnh: locatario.cnh || "",
    };

    const contratoVeiculo: VeiculoData = {
      marca: veiculo.marca || "",
      modelo: veiculo.modelo || "",
      ano: formatVehicleYear(veiculo.ano, veiculo.anoModelo),
      cor: veiculo.cor || "",
      placa: veiculo.placa || "",
      chassi: veiculo.chassi || "",
      renavam: veiculo.renavam || "",
    };

    const contratoTermos: ContratoTermos = {
      ...defaultTermos,
      localContrato: defaultTermos.localContrato,
      dataContrato: formatDateInputValue(contrato.createdAt ?? contrato.dataInicio),
      dataInicio: formatDateInputValue(contrato.dataInicio),
      dataFim: formatDateInputValue(contrato.dataFim),
      valorSemanal: formatMoneyForContract(contrato.valorSemanal),
    };

    const html = gerarContratoHTML(locadoresContrato, contratoLocatario, contratoVeiculo, contratoTermos);
    openContratoWindow(html, `Contrato ${String(contrato.id).padStart(6, "0")} - Reemitir`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este contrato?")) return;
    try {
      await deleteContrato.mutateAsync({ id });
      toast.success("Contrato deletado com sucesso!");
      await Promise.all([contratos.refetch(), veiculos.refetch()]);
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao deletar contrato"));
    }
  };

  const onCloseSubmit = async () => {
    if (!closingContrato || !closingDate) return;

    const dataInicio = new Date(closingContrato.dataInicio);
    const dataFimReal = new Date(closingDate);
    const dataFimOriginal = new Date(closingContrato.dataFim);

    if (dataFimReal < dataInicio) {
      toast.error("A devolução não pode ser antes da data inicial do contrato.");
      return;
    }

    if (dataFimReal > dataFimOriginal) {
      toast.error("A devolução não pode ultrapassar a data final atual do contrato.");
      return;
    }

    try {
      await updateContrato.mutateAsync({
        id: closingContrato.id,
        data: {
          status: "encerrado",
          dataFim: dataFimReal,
        },
      });
      toast.success("Contrato encerrado com sucesso!");
      setClosingContrato(null);
      setClosingDate("");
      setCloseOpen(false);
      await Promise.all([contratos.refetch(), veiculos.refetch()]);
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao encerrar contrato"));
    }
  };

  const onEditSubmit = async (data: ContratoFormValues) => {
    if (!editingContrato) return;

    try {
      await updateContrato.mutateAsync({
        id: editingContrato.id,
        data: {
          locadorIds: data.locadorIds,
          locatarioId: data.locatarioId,
          motoId: data.motoId,
          dataInicio: new Date(data.dataInicio),
          dataFim: new Date(data.dataFim),
          valorSemanal: data.valorSemanal,
          diasAposFim: data.diasAposFim,
        },
      });
      toast.success("Contrato atualizado com sucesso!");
      editForm.reset(CONTRATO_FORM_DEFAULTS);
      setEditingContrato(null);
      setEditOpen(false);
      await Promise.all([contratos.refetch(), veiculos.refetch()]);
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao editar contrato"));
    }
  };

  const contratoItems = (contratos.data ?? []) as ContratoRecord[];
  const locadorItems = (locadores.data ?? []) as LocadorListItem[];
  const locatarioItems = (locatarios.data ?? []) as ClienteListItem[];
  const veiculoItems = (veiculos.data ?? []) as MotoListItem[];
  const motosBloqueadas = new Set(
    contratoItems
      .filter((item) => item.status !== "cancelado" && !isContratoExpired(item.dataFim, item.status))
      .map((item) => item.motoId),
  );
  const veiculosDisponiveis = veiculoItems.filter((item) => {
    if (motosBloqueadas.has(item.id)) return false;
    if (item.disponibilidadeManual === "indisponivel") return false;
    if (item.disponibilidadeManual === "disponivel") return true;
    return true;
  });
  const contratosAtivos = contratoItems.filter((item) => item.status === "ativo").length;
  const contratosVencidos = contratoItems.filter((item) => isContratoExpired(item.dataFim, item.status)).length;
  const renewingLocatario = locatarioItems.find((item) => item.id === renewingContrato?.locatarioId);
  const renewingVeiculo = veiculoItems.find((item) => item.id === renewingContrato?.motoId);
  const veiculosDisponiveisParaEdicao = veiculoItems.filter((item) => {
    if (item.id === editingContrato?.motoId) return true;
    if (motosBloqueadas.has(item.id)) return false;
    if (item.disponibilidadeManual === "indisponivel") return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="operacoes-page-shell">
        <PageHeaderCard
          title="Contratos"
          description="Use os cadastros já preenchidos para criar contratos com cobrança semanal, reimprimir contratos ativos, encerrar devoluções antecipadas e renovar somente contratos vencidos."
          eyebrow="Central contratual"
        >
          <div className="operacoes-page-header__stats">
            <article className="operacoes-page-header__stat">
              <span className="operacoes-page-header__stat-value">{contratoItems.length}</span>
              <span className="operacoes-page-header__stat-label">Total cadastrados</span>
            </article>
            <article className="operacoes-page-header__stat">
              <span className="operacoes-page-header__stat-value">{contratosAtivos}</span>
              <span className="operacoes-page-header__stat-label">Ativos</span>
            </article>
            <article className="operacoes-page-header__stat">
              <span className="operacoes-page-header__stat-value">{contratosVencidos}</span>
              <span className="operacoes-page-header__stat-label">Vencidos</span>
            </article>
          </div>

          <CreateContratoDialog
            open={open}
            onOpenChange={(nextOpen) => {
              setOpen(nextOpen);
              if (!nextOpen) form.reset(CONTRATO_FORM_DEFAULTS);
            }}
            form={form}
            dialogClassName="operacoes-dialog"
            title="Novo contrato"
            description="Selecione locadores, locatário e veículo já cadastrados. Esta tela usa os cadastros existentes; a importação automática de documentos acontece em Cadastros."
            trigger={
              <Button className="operacoes-primary-button w-full gap-2 sm:w-auto">
                <Plus className="h-4 w-4" />
                Novo Contrato
              </Button>
            }
            locadores={locadorItems}
            locatarios={locatarioItems}
            veiculos={veiculosDisponiveis}
            isSubmitting={createContrato.isPending}
            onSubmit={onSubmit}
          />
        </PageHeaderCard>

        <CreateContratoDialog
          open={editOpen}
          onOpenChange={(nextOpen) => {
            setEditOpen(nextOpen);
            if (!nextOpen) {
              setEditingContrato(null);
              editForm.reset(CONTRATO_FORM_DEFAULTS);
            }
          }}
          form={editForm}
          dialogClassName="operacoes-dialog"
          title="Editar contrato"
          description="Atualize locadores, locatário, veículo, período e cobrança do contrato."
          submitLabel="Salvar contrato"
          locadores={locadorItems}
          locatarios={locatarioItems}
          veiculos={veiculosDisponiveisParaEdicao}
          isSubmitting={updateContrato.isPending}
          onSubmit={onEditSubmit}
        />

        <CreateContratoDialog
          open={renewOpen}
          onOpenChange={(nextOpen) => {
            setRenewOpen(nextOpen);
            if (!nextOpen) {
              setRenewingContrato(null);
              renewForm.reset(CONTRATO_FORM_DEFAULTS);
            }
          }}
          form={renewForm}
          dialogClassName="operacoes-dialog"
          title="Renovar contrato"
          description="Renovar cria uma nova vigência a partir de um contrato vencido. Para emitir a mesma via novamente, use reimprimir no contrato ativo."
          submitLabel="Renovar contrato"
          readonlyLocatarioLabel={renewingLocatario?.nome || ""}
          readonlyVeiculoLabel={formatMotoLabel(renewingVeiculo)}
          locadores={locadorItems}
          locatarios={locatarioItems}
          veiculos={veiculoItems}
          isSubmitting={renewContrato.isPending}
          onSubmit={onRenewSubmit}
        />

        <CloseContratoDialog
          open={closeOpen}
          onOpenChange={(nextOpen) => {
            setCloseOpen(nextOpen);
            if (!nextOpen) {
              setClosingContrato(null);
              setClosingDate("");
            }
          }}
          dataFim={closingDate}
          minDate={closingContrato ? formatDateInputValue(closingContrato.dataInicio) : ""}
          maxDate={closingContrato ? formatDateInputValue(closingContrato.dataFim) : ""}
          isSubmitting={updateContrato.isPending}
          onDataFimChange={setClosingDate}
          onSubmit={onCloseSubmit}
        />

        <StatusFilterCard value={statusFilter} onValueChange={setStatusFilter} options={contratoStatusOptions} />

        <ContratosTable
          items={contratoItems}
          locadores={locadorItems}
          locatarios={locatarioItems}
          veiculos={veiculoItems}
          isLoading={contratos.isLoading}
          onEdit={handleEdit}
          onRenew={handleRenew}
          canRenew={(item) => isContratoExpired(item.dataFim, item.status)}
          renewPending={renewContrato.isPending}
          onIssueAgain={handleIssueAgain}
          onClose={handleClose}
          closePending={updateContrato.isPending}
          onDelete={handleDelete}
          deletePending={deleteContrato.isPending}
        />
      </div>
    </DashboardLayout>
  );
}
