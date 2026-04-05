import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getErrorMessage } from "@/lib/errors";
import { trpc } from "@/lib/trpc";
import type { ClienteListItem, ContratosListInput, MotoListItem, MotosListInput } from "@/lib/trpc-types";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ContratosTable } from "@/features/operacoes/components/ContratosTable";
import { CreateContratoDialog } from "@/features/operacoes/components/CreateContratoDialog";
import { PageHeaderCard } from "@/features/operacoes/components/PageHeaderCard";
import { StatusFilterCard } from "@/features/operacoes/components/StatusFilterCard";
import { contratoStatusOptions, type ContratoRecord, type ContratoStatusFilter } from "@/features/operacoes/types";
import { createContratoSchema, type ContratoFormValues } from "@/features/operacoes/validation";
import "@/features/operacoes/operacoes.css";

export default function Contratos() {
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ContratoStatusFilter>("all");
  const contratosFilters: ContratosListInput = { status: statusFilter === "all" ? undefined : statusFilter };
  const motosFilters: MotosListInput = { status: "disponivel" };
  const contratos = trpc.contratos.list.useQuery(contratosFilters);
  const clientes = trpc.clientes.list.useQuery();
  const motos = trpc.motos.list.useQuery(motosFilters);
  const createContrato = trpc.contratos.create.useMutation();
  const deleteContrato = trpc.contratos.delete.useMutation();

  const form = useForm<ContratoFormValues>({
    resolver: zodResolver(createContratoSchema) as Resolver<ContratoFormValues>,
  });

  const onSubmit = async (data: ContratoFormValues) => {
    try {
      await createContrato.mutateAsync({
        ...data,
        dataInicio: new Date(data.dataInicio),
        dataFim: new Date(data.dataFim),
      });
      toast.success("Contrato criado com sucesso!");
      form.reset();
      setOpen(false);
      contratos.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao criar contrato"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este contrato?")) return;
    try {
      await deleteContrato.mutateAsync({ id });
      toast.success("Contrato deletado com sucesso!");
      contratos.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao deletar contrato"));
    }
  };

  const contratoItems = (contratos.data ?? []) as ContratoRecord[];
  const clienteItems = (clientes.data ?? []) as ClienteListItem[];
  const motoItems = (motos.data ?? []) as MotoListItem[];

  return (
    <DashboardLayout>
      <div className="operacoes-page-shell">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <PageHeaderCard title="Contratos" description="Gerenciamento de contratos de aluguel" />
          <CreateContratoDialog
            open={open}
            onOpenChange={setOpen}
            form={form}
            clientes={clienteItems}
            motos={motoItems}
            isSubmitting={createContrato.isPending}
            onSubmit={onSubmit}
          />
        </div>

        <StatusFilterCard value={statusFilter} onValueChange={setStatusFilter} options={contratoStatusOptions} />

        <ContratosTable
          items={contratoItems}
          isLoading={contratos.isLoading}
          onDelete={handleDelete}
          deletePending={deleteContrato.isPending}
        />
      </div>
    </DashboardLayout>
  );
}
