import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getErrorMessage } from "@/lib/errors";
import { trpc } from "@/lib/trpc";
import type { ContratoListItem, PagamentoStatusInput, PagamentosListInput } from "@/lib/trpc-types";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CreatePagamentoDialog } from "@/features/operacoes/components/CreatePagamentoDialog";
import { PageHeaderCard } from "@/features/operacoes/components/PageHeaderCard";
import { PagamentosTable } from "@/features/operacoes/components/PagamentosTable";
import { StatusFilterCard } from "@/features/operacoes/components/StatusFilterCard";
import { SummaryMetricCard } from "@/features/operacoes/components/SummaryMetricCard";
import { pagamentoStatusOptions, type PagamentoRecord, type PagamentoStatusFilter } from "@/features/operacoes/types";
import { formatCurrencyBR } from "@/features/operacoes/utils";
import { createPagamentoSchema, type PagamentoFormValues } from "@/features/operacoes/validation";
import "@/features/operacoes/operacoes.css";

export default function Pagamentos() {
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PagamentoStatusFilter>("all");
  const pagamentosFilters: PagamentosListInput = { status: statusFilter === "all" ? undefined : statusFilter };
  const pagamentos = trpc.pagamentos.list.useQuery(pagamentosFilters);
  const contratos = trpc.contratos.list.useQuery({ status: "ativo" });
  const createPagamento = trpc.pagamentos.create.useMutation();
  const updatePagamento = trpc.pagamentos.update.useMutation();
  const deletePagamento = trpc.pagamentos.delete.useMutation();

  const form = useForm<PagamentoFormValues>({
    resolver: zodResolver(createPagamentoSchema) as Resolver<PagamentoFormValues>,
    defaultValues: {
      status: "pendente",
    },
  });

  const onSubmit = async (data: PagamentoFormValues) => {
    try {
      await createPagamento.mutateAsync({
        ...data,
        data: new Date(data.data),
      });
      toast.success("Pagamento registrado com sucesso!");
      form.reset();
      setOpen(false);
      await pagamentos.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao registrar pagamento"));
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
    if (!confirm("Tem certeza que deseja deletar este pagamento?")) return;
    try {
      await deletePagamento.mutateAsync({ id });
      toast.success("Pagamento deletado com sucesso!");
      await pagamentos.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao deletar pagamento"));
    }
  };

  const pagamentoItems = (pagamentos.data ?? []) as PagamentoRecord[];
  const contratoItems = (contratos.data ?? []) as ContratoListItem[];
  const totalPago = pagamentoItems.filter((pagamento) => pagamento.status === "pago").reduce((acc, pagamento) => acc + parseFloat(String(pagamento.valor)), 0);
  const totalPendente = pagamentoItems.filter((pagamento) => pagamento.status === "pendente" || pagamento.status === "atrasado").reduce((acc, pagamento) => acc + parseFloat(String(pagamento.valor)), 0);

  return (
    <DashboardLayout>
      <div className="operacoes-page-shell">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <PageHeaderCard title="Pagamentos" description="Gerenciamento de pagamentos" />
          <CreatePagamentoDialog
            open={open}
            onOpenChange={setOpen}
            form={form}
            contratos={contratoItems}
            isSubmitting={createPagamento.isPending}
            onSubmit={onSubmit}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <SummaryMetricCard title="Total Recebido" value={formatCurrencyBR(totalPago)} toneClassName="text-green-600" />
          <SummaryMetricCard title="Total Pendente" value={formatCurrencyBR(totalPendente)} toneClassName="text-yellow-600" />
        </div>

        <StatusFilterCard value={statusFilter} onValueChange={setStatusFilter} options={pagamentoStatusOptions} />

        <PagamentosTable
          items={pagamentoItems}
          isLoading={pagamentos.isLoading}
          onDelete={handleDelete}
          deletePending={deletePagamento.isPending}
          onStatusChange={(id, status) => handleStatusChange(id, status as PagamentoStatusInput)}
        />
      </div>
    </DashboardLayout>
  );
}
