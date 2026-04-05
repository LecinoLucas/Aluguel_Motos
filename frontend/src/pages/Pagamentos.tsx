import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getErrorMessage } from "@/lib/errors";
import { trpc } from "@/lib/trpc";
import type { ContratoListItem, MotoListItem, PagamentoStatusInput, PagamentosListInput } from "@/lib/trpc-types";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { CreatePagamentoDialog } from "@/features/operacoes/components/CreatePagamentoDialog";
import { PageHeaderCard } from "@/features/operacoes/components/PageHeaderCard";
import { PagamentosTable } from "@/features/operacoes/components/PagamentosTable";
import { StatusFilterCard } from "@/features/operacoes/components/StatusFilterCard";
import { SummaryMetricCard } from "@/features/operacoes/components/SummaryMetricCard";
import {
  pagamentoStatusOptions,
  pagamentoTipoOptions,
  type PagamentoRecord,
  type PagamentoStatusFilter,
  type PagamentoTipoFilter,
} from "@/features/operacoes/types";
import { addDays, formatContratoCode, formatCurrencyBR } from "@/features/operacoes/utils";
import { createPagamentoSchema, type PagamentoFormValues } from "@/features/operacoes/validation";
import "@/features/operacoes/operacoes.css";

function getDefaultContaFormValues(): PagamentoFormValues {
  return {
    contratoId: undefined,
    motoId: undefined,
    tipo: "receber",
    descricao: "",
    valor: 0,
    data: addDays(new Date(), 1).toISOString().slice(0, 10),
    status: "pendente",
  };
}

export default function Pagamentos() {
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PagamentoStatusFilter>("all");
  const [tipoFilter, setTipoFilter] = useState<PagamentoTipoFilter>("all");
  const pagamentosFilters: PagamentosListInput = {
    status: statusFilter === "all" ? undefined : statusFilter,
    tipo: tipoFilter === "all" ? undefined : tipoFilter,
  };
  const pagamentos = trpc.pagamentos.list.useQuery(pagamentosFilters);
  const contratos = trpc.contratos.list.useQuery({});
  const motos = trpc.motos.list.useQuery({});
  const createPagamento = trpc.pagamentos.create.useMutation();
  const updatePagamento = trpc.pagamentos.update.useMutation();
  const deletePagamento = trpc.pagamentos.delete.useMutation();

  const form = useForm<PagamentoFormValues>({
    resolver: zodResolver(createPagamentoSchema) as Resolver<PagamentoFormValues>,
    defaultValues: getDefaultContaFormValues(),
  });

  const onSubmit = async (data: PagamentoFormValues) => {
    try {
      await createPagamento.mutateAsync({
        contratoId: data.contratoId,
        motoId: data.motoId,
        tipo: data.tipo,
        descricao: data.descricao?.trim() || undefined,
        valor: data.valor,
        data: new Date(data.data),
        status: "pendente",
      });
      toast.success("Lançamento criado com sucesso!");
      form.reset(getDefaultContaFormValues());
      setOpen(false);
      await pagamentos.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao criar lançamento"));
    }
  };

  const handleStatusChange = async (id: number, newStatus: PagamentoStatusInput) => {
    try {
      await updatePagamento.mutateAsync({
        id,
        data: { status: newStatus },
      });
      toast.success("Status atualizado com sucesso!");
      await pagamentos.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao atualizar status"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta conta?")) return;
    try {
      await deletePagamento.mutateAsync({ id });
      toast.success("Conta removida com sucesso!");
      await pagamentos.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao deletar conta"));
    }
  };

  const pagamentoItems = (pagamentos.data ?? []) as PagamentoRecord[];
  const contratoItems = (contratos.data ?? []) as ContratoListItem[];
  const motoItems = (motos.data ?? []) as MotoListItem[];
  const contratoOptions = useMemo(
    () =>
      contratoItems.map((contrato) => ({
        id: contrato.id,
        label: `${formatContratoCode(contrato.id)} • Locatário ${contrato.locatarioId} • Veículo ${contrato.motoId}`,
      })),
    [contratoItems],
  );
  const motoOptions = useMemo(
    () =>
      motoItems.map((moto) => ({
        id: moto.id,
        label: `${[moto.marca, moto.modelo].filter(Boolean).join(" / ") || "Moto"}${moto.placa ? ` (${moto.placa})` : ""}`,
      })),
    [motoItems],
  );
  const totalPago = pagamentoItems
    .filter((pagamento) => pagamento.status === "pago")
    .reduce((acc, pagamento) => acc + parseFloat(String(pagamento.valor)), 0);
  const totalAberto = pagamentoItems
    .filter((pagamento) => pagamento.status !== "pago")
    .reduce((acc, pagamento) => acc + parseFloat(String(pagamento.valor)), 0);
  const totalAtrasado = pagamentoItems
    .filter((pagamento) => pagamento.status === "atrasado")
    .reduce((acc, pagamento) => acc + parseFloat(String(pagamento.valor)), 0);
  const contasAbertas = pagamentoItems.filter((pagamento) => pagamento.status !== "pago").length;

  return (
    <DashboardLayout>
      <div className="operacoes-page-shell">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <PageHeaderCard
            title="Financeiro"
            description="Acompanhe contas a receber semanais dos contratos, receitas extras e contas a pagar das motos, inclusive manutenção."
          />
          <CreatePagamentoDialog
            open={open}
            onOpenChange={(nextOpen) => {
              setOpen(nextOpen);
              if (!nextOpen) {
                form.reset(getDefaultContaFormValues());
              }
            }}
            form={form}
            trigger={
              <Button className="w-full gap-2 sm:w-auto">
                <Plus className="h-4 w-4" />
                Novo lançamento
              </Button>
            }
            contratos={contratoOptions}
            motos={motoOptions}
            isSubmitting={createPagamento.isPending}
            onSubmit={onSubmit}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryMetricCard title="Total quitado" value={formatCurrencyBR(totalPago)} toneClassName="text-green-600" />
          <SummaryMetricCard title="Em aberto" value={formatCurrencyBR(totalAberto)} toneClassName="text-yellow-600" />
          <SummaryMetricCard title="Em atraso" value={formatCurrencyBR(totalAtrasado)} toneClassName="text-red-600" />
          <SummaryMetricCard title="Lançamentos abertos" value={String(contasAbertas)} />
        </div>

        <StatusFilterCard value={tipoFilter} onValueChange={setTipoFilter} options={pagamentoTipoOptions} />
        <StatusFilterCard value={statusFilter} onValueChange={setStatusFilter} options={pagamentoStatusOptions} />

        <PagamentosTable
          items={pagamentoItems}
          contratos={contratoItems}
          motos={motoItems}
          isLoading={pagamentos.isLoading}
          onDelete={handleDelete}
          deletePending={deletePagamento.isPending}
          onMarkAsPaid={(id) => handleStatusChange(id, "pago")}
          onReopen={(id) => handleStatusChange(id, "pendente")}
          updatePending={updatePagamento.isPending}
        />
      </div>
    </DashboardLayout>
  );
}
