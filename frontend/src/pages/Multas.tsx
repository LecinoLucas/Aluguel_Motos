import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { getErrorMessage } from "@/lib/errors";
import { trpc } from "@/lib/trpc";
import type { ContratoListItem, MotoListItem, MultaStatusInput, MultasListInput, PagamentoListItem } from "@/lib/trpc-types";
import { PageHeaderCard } from "@/features/operacoes/components/PageHeaderCard";
import { StatusFilterCard } from "@/features/operacoes/components/StatusFilterCard";
import { SummaryMetricCard } from "@/features/operacoes/components/SummaryMetricCard";
import { CreateMultaDialog } from "@/features/operacoes/components/CreateMultaDialog";
import { MultasTable } from "@/features/operacoes/components/MultasTable";
import {
  multaStatusOptions,
  multaTipoOptions,
  type ContratoRecord,
  type MultaRecord,
  type MultaStatusFilter,
  type MultaTipoFilter,
} from "@/features/operacoes/types";
import { defaultTermos } from "@/features/gerar-contrato/types";
import { formatContratoCode, formatCurrencyBR, formatMotoLabel, parseCurrencyValue } from "@/features/operacoes/utils";
import { createMultaSchema, type MultaFormValues } from "@/features/operacoes/validation";
import { useForm, type Resolver } from "react-hook-form";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import "@/features/operacoes/operacoes.css";

type ContratoFilterValue = "all" | `${number}`;

function getDefaultMultaFormValues(): MultaFormValues {
  return {
    contratoId: 0,
    tipo: "multa",
    responsavel: "",
    descricao: "",
    data: new Date().toISOString().slice(0, 10),
    valor: 0,
    status: "pendente",
    observacao: "",
  };
}

function getContratoCaucao(contrato?: ContratoListItem | ContratoRecord | null) {
  return parseCurrencyValue(contrato?.documentoSnapshot?.termos.valorCaucao ?? defaultTermos.valorCaucao);
}

function isPagamentoDentroDoContrato(
  pagamento: PagamentoListItem,
  contrato?: ContratoListItem | ContratoRecord | null,
) {
  if (!contrato) return false;
  const dataPagamento = new Date(pagamento.data);
  const dataInicio = new Date(contrato.dataInicio);
  const dataFim = new Date(contrato.dataFim);
  dataFim.setDate(dataFim.getDate() + 7);
  return dataPagamento >= dataInicio && dataPagamento <= dataFim;
}

export default function Multas() {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingMulta, setEditingMulta] = useState<MultaRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState<MultaStatusFilter>("all");
  const [tipoFilter, setTipoFilter] = useState<MultaTipoFilter>("all");
  const [contratoFilter, setContratoFilter] = useState<ContratoFilterValue>("all");

  const selectedContratoId = contratoFilter === "all" ? undefined : Number(contratoFilter);

  const multasFilters: MultasListInput = {
    status: statusFilter === "all" ? undefined : statusFilter,
    tipo: tipoFilter === "all" ? undefined : tipoFilter,
    contratoId: selectedContratoId,
  };

  const multas = trpc.multas.list.useQuery(multasFilters);
  const multasResumo = trpc.multas.list.useQuery({ contratoId: selectedContratoId });
  const contratos = trpc.contratos.list.useQuery({});
  const motos = trpc.motos.list.useQuery({});
  const pagamentos = trpc.pagamentos.list.useQuery({ tipo: "pagar" });
  const createMulta = trpc.multas.create.useMutation();
  const updateMulta = trpc.multas.update.useMutation();
  const deleteMulta = trpc.multas.delete.useMutation();

  const form = useForm<MultaFormValues>({
    resolver: zodResolver(createMultaSchema) as Resolver<MultaFormValues>,
    defaultValues: getDefaultMultaFormValues(),
  });

  const editForm = useForm<MultaFormValues>({
    resolver: zodResolver(createMultaSchema) as Resolver<MultaFormValues>,
    defaultValues: getDefaultMultaFormValues(),
  });

  const contratoItems = (contratos.data ?? []) as ContratoRecord[];
  const motoItems = (motos.data ?? []) as MotoListItem[];
  const pagamentoItems = (pagamentos.data ?? []) as PagamentoListItem[];
  const multaItems = (multas.data ?? []) as MultaRecord[];
  const multaResumoItems = (multasResumo.data ?? []) as MultaRecord[];
  const contratosById = new Map(contratoItems.map((contrato) => [contrato.id, contrato]));
  const motosById = new Map(motoItems.map((moto) => [moto.id, moto]));
  const contratoSelecionado = selectedContratoId ? contratosById.get(selectedContratoId) ?? null : null;
  const valorCaucao = getContratoCaucao(contratoSelecionado);

  const contratoOptions = useMemo(
    () =>
      contratoItems.map((contrato) => {
        const motoLabel = formatMotoLabel(motosById.get(contrato.motoId));
        return {
          id: contrato.id,
          label: `${formatContratoCode(contrato.id)} • Moto ${motoLabel}`,
        };
      }),
    [contratoItems, motosById],
  );

  const contratoFilterOptions = useMemo<Array<{ value: ContratoFilterValue; label: string }>>(
    () => [
      { value: "all", label: "Todos os contratos" },
      ...contratoOptions.map((contrato) => ({ value: String(contrato.id) as ContratoFilterValue, label: contrato.label })),
    ],
    [contratoOptions],
  );

  const totalPago = multaResumoItems
    .filter((item) => item.status === "pago")
    .reduce((acc, item) => acc + parseCurrencyValue(item.valor), 0);
  const totalPendente = multaResumoItems
    .filter((item) => item.status === "pendente")
    .reduce((acc, item) => acc + parseCurrencyValue(item.valor), 0);
  const totalDescontadoCaucao = multaResumoItems
    .filter((item) => item.status === "descontado_caucao")
    .reduce((acc, item) => acc + parseCurrencyValue(item.valor), 0);
  const totalManutencaoContrato = selectedContratoId
    ? pagamentoItems
        .filter(
          (item) =>
            item.tipo === "pagar" &&
            item.origem === "manutencao" &&
            item.status !== "pago" &&
            (item.contratoId === selectedContratoId ||
              (!item.contratoId &&
                contratoSelecionado &&
                item.motoId === contratoSelecionado.motoId &&
                isPagamentoDentroDoContrato(item, contratoSelecionado))),
        )
        .reduce((acc, item) => acc + parseCurrencyValue(item.valor), 0)
    : 0;
  const descontoProjetado = multaResumoItems
    .filter((item) => item.status !== "pago")
    .reduce((acc, item) => acc + parseCurrencyValue(item.valor), 0) + totalManutencaoContrato;
  const saldoPrevistoDevolucao = selectedContratoId ? Math.max(0, valorCaucao - descontoProjetado) : 0;
  const saldoDevedorLocatario = selectedContratoId ? Math.max(0, descontoProjetado - valorCaucao) : 0;

  const refetchAll = async () => {
    await Promise.all([multas.refetch(), multasResumo.refetch(), contratos.refetch()]);
  };

  const handleCreate = async (data: MultaFormValues) => {
    try {
      await createMulta.mutateAsync({
        contratoId: data.contratoId,
        tipo: data.tipo,
        responsavel: data.responsavel,
        descricao: data.descricao,
        data: new Date(data.data),
        valor: data.valor,
        status: data.status,
        observacao: data.observacao?.trim() || undefined,
      });
      toast.success("Ocorrência cadastrada com sucesso!");
      form.reset(getDefaultMultaFormValues());
      setOpen(false);
      await refetchAll();
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao cadastrar ocorrência"));
    }
  };

  const handleEdit = (item: MultaRecord) => {
    editForm.reset({
      contratoId: item.contratoId,
      tipo: item.tipo,
      responsavel: item.responsavel,
      descricao: item.descricao,
      data: typeof item.data === "string" ? item.data.slice(0, 10) : item.data.toISOString().slice(0, 10),
      valor: parseCurrencyValue(item.valor),
      status: item.status,
      observacao: item.observacao ?? "",
    });
    setEditingMulta(item);
    setEditOpen(true);
  };

  const handleUpdate = async (data: MultaFormValues) => {
    if (!editingMulta) return;

    try {
      await updateMulta.mutateAsync({
        id: editingMulta.id,
        data: {
          contratoId: data.contratoId,
          tipo: data.tipo,
          responsavel: data.responsavel,
          descricao: data.descricao,
          data: new Date(data.data),
          valor: data.valor,
          status: data.status,
          observacao: data.observacao?.trim() || undefined,
        },
      });
      toast.success("Ocorrência atualizada com sucesso!");
      editForm.reset(getDefaultMultaFormValues());
      setEditingMulta(null);
      setEditOpen(false);
      await refetchAll();
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao atualizar ocorrência"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta ocorrência?")) return;

    try {
      await deleteMulta.mutateAsync({ id });
      toast.success("Ocorrência removida com sucesso!");
      await refetchAll();
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao remover ocorrência"));
    }
  };

  const handleStatusChange = async (id: number, status: MultaStatusInput) => {
    try {
      await updateMulta.mutateAsync({
        id,
        data: { status, observacao: undefined },
      });
      toast.success("Status atualizado com sucesso!");
      await refetchAll();
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao atualizar status"));
    }
  };

  return (
    <DashboardLayout>
      <div className="operacoes-page-shell">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <PageHeaderCard
            title="Multas"
            description="Controle multas, prejuízos e despesas de manutenção vinculadas ao contrato para acompanhar a caução com mais precisão no encerramento."
          />
          <CreateMultaDialog
            open={open}
            onOpenChange={(nextOpen) => {
              setOpen(nextOpen);
              if (!nextOpen) {
                form.reset(getDefaultMultaFormValues());
              }
            }}
            form={form}
            trigger={
              <Button className="w-full gap-2 sm:w-auto">
                <Plus className="h-4 w-4" />
                Nova ocorrência
              </Button>
            }
            contratos={contratoOptions}
            isSubmitting={createMulta.isPending}
            onSubmit={handleCreate}
          />
        </div>

        {selectedContratoId ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <SummaryMetricCard title="Caução do contrato" value={formatCurrencyBR(valorCaucao)} />
            <SummaryMetricCard title="Pago fora da caução" value={formatCurrencyBR(totalPago)} toneClassName="text-green-600" />
            <SummaryMetricCard title="Pendente" value={formatCurrencyBR(totalPendente)} toneClassName="text-yellow-600" />
            <SummaryMetricCard title="Descontado da caução" value={formatCurrencyBR(totalDescontadoCaucao)} toneClassName="text-orange-600" />
            <SummaryMetricCard title="Manutenção vinculada" value={formatCurrencyBR(totalManutencaoContrato)} toneClassName="text-amber-600" />
            <SummaryMetricCard
              title={saldoDevedorLocatario > 0 ? "Saldo devedor do locatário" : "Saldo previsto para devolver"}
              value={formatCurrencyBR(saldoDevedorLocatario > 0 ? saldoDevedorLocatario : saldoPrevistoDevolucao)}
              toneClassName={saldoDevedorLocatario > 0 ? "text-red-600" : "text-blue-600"}
            />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryMetricCard title="Pago fora da caução" value={formatCurrencyBR(totalPago)} toneClassName="text-green-600" />
            <SummaryMetricCard title="Pendente" value={formatCurrencyBR(totalPendente)} toneClassName="text-yellow-600" />
            <SummaryMetricCard title="Descontado da caução" value={formatCurrencyBR(totalDescontadoCaucao)} toneClassName="text-orange-600" />
            <SummaryMetricCard title="Ocorrências" value={String(multaResumoItems.length)} />
          </div>
        )}

        <StatusFilterCard title="Contrato" value={contratoFilter} onValueChange={setContratoFilter} options={contratoFilterOptions} />
        <StatusFilterCard title="Tipo" value={tipoFilter} onValueChange={setTipoFilter} options={multaTipoOptions} />
        <StatusFilterCard title="Status" value={statusFilter} onValueChange={setStatusFilter} options={multaStatusOptions} />

        <MultasTable
          items={multaItems}
          contratos={contratoItems}
          motos={motoItems}
          isLoading={multas.isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onMarkAsPaid={(id) => handleStatusChange(id, "pago")}
          onDiscountFromDeposit={(id) => handleStatusChange(id, "descontado_caucao")}
          onReopen={(id) => handleStatusChange(id, "pendente")}
          deletePending={deleteMulta.isPending}
          updatePending={updateMulta.isPending}
        />

        <CreateMultaDialog
          open={editOpen}
          onOpenChange={(nextOpen) => {
            setEditOpen(nextOpen);
            if (!nextOpen) {
              editForm.reset(getDefaultMultaFormValues());
              setEditingMulta(null);
            }
          }}
          form={editForm}
          hideTrigger
          contratos={contratoOptions}
          isSubmitting={updateMulta.isPending}
          onSubmit={handleUpdate}
          title="Editar ocorrência"
          description="Ajuste o contrato, responsável, valor, observação e status da multa ou prejuízo."
          submitLabel="Salvar alterações"
        />
      </div>
    </DashboardLayout>
  );
}
