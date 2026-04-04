import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getErrorMessage } from "@/lib/errors";
import { trpc } from "@/lib/trpc";
import type { MotoListItem, MotosListInput } from "@/lib/trpc-types";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CreateManutencaoDialog } from "@/features/operacoes/components/CreateManutencaoDialog";
import { ManutencoesTable } from "@/features/operacoes/components/ManutencoesTable";
import { PageHeaderCard } from "@/features/operacoes/components/PageHeaderCard";
import { SummaryMetricCard } from "@/features/operacoes/components/SummaryMetricCard";
import type { ManutencaoRecord } from "@/features/operacoes/types";
import { formatCurrencyBR } from "@/features/operacoes/utils";
import { createManutencaoSchema, type ManutencaoFormValues } from "@/features/operacoes/validation";
import "@/features/operacoes/operacoes.css";

export default function Manutencoes() {
  const [open, setOpen] = useState(false);
  const motosFilters: MotosListInput = { status: "disponivel" };
  const manutencoes = trpc.manutencoes.list.useQuery();
  const motos = trpc.motos.list.useQuery(motosFilters);
  const createManutencao = trpc.manutencoes.create.useMutation();
  const deleteManutencao = trpc.manutencoes.delete.useMutation();

  const form = useForm<ManutencaoFormValues>({
    resolver: zodResolver(createManutencaoSchema) as Resolver<ManutencaoFormValues>,
    defaultValues: {
      descricao: "",
    },
  });

  const onSubmit = async (data: ManutencaoFormValues) => {
    try {
      await createManutencao.mutateAsync({
        ...data,
        data: new Date(data.data),
      });
      toast.success("Manutenção registrada com sucesso!");
      form.reset();
      setOpen(false);
      await manutencoes.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao registrar manutenção"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este registro?")) return;
    try {
      await deleteManutencao.mutateAsync({ id });
      toast.success("Manutenção deletada com sucesso!");
      await manutencoes.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao deletar manutenção"));
    }
  };

  const manutencaoItems = (manutencoes.data ?? []) as ManutencaoRecord[];
  const motoItems = (motos.data ?? []) as MotoListItem[];
  const totalCusto = manutencaoItems.reduce((acc, manutencao) => acc + parseFloat(String(manutencao.custo)), 0);

  return (
    <DashboardLayout>
      <div className="operacoes-page-shell">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <PageHeaderCard title="Manutenções" description="Registro de manutenções de motos" />
          <CreateManutencaoDialog
            open={open}
            onOpenChange={setOpen}
            form={form}
            motos={motoItems}
            isSubmitting={createManutencao.isPending}
            onSubmit={onSubmit}
          />
        </div>

        <SummaryMetricCard title="Custo Total de Manutenções" value={formatCurrencyBR(totalCusto)} />

        <ManutencoesTable
          items={manutencaoItems}
          isLoading={manutencoes.isLoading}
          onDelete={handleDelete}
          deletePending={deleteManutencao.isPending}
        />
      </div>
    </DashboardLayout>
  );
}
