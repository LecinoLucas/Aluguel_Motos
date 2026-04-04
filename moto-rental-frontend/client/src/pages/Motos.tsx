import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getErrorDetails, getErrorMessage, logClientError } from "@/lib/errors";
import { trpc } from "@/lib/trpc";
import type { MotoStatusInput } from "@/lib/trpc-types";
import "@/features/cadastros/cadastros.css";
import { VeiculosTab } from "@/features/cadastros/components/VeiculosTab";
import { clearFieldError, getFirstInlineError, mapFieldErrors } from "@/features/cadastros/form-errors";
import { defaultVeiculoForm, type VeiculoField, type VeiculoFormErrors, type VeiculoRecord } from "@/features/cadastros/types";
import { getValidationMessages, hasValidationErrors, validateVeiculoForm } from "@/features/cadastros/validation";

export default function Motos() {
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "disponivel" | "alugada" | "manutencao">("all");
  const [form, setForm] = useState(defaultVeiculoForm);
  const [formErrors, setFormErrors] = useState<VeiculoFormErrors>({});

  const motos = trpc.motos.list.useQuery({ status: statusFilter === "all" ? undefined : statusFilter });
  const createMoto = trpc.motos.create.useMutation();
  const deleteMoto = trpc.motos.delete.useMutation();
  const updateMoto = trpc.motos.update.useMutation();

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setFormErrors({});
    }
  };

  const handleFormChange = (field: VeiculoField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => clearFieldError(current, field));
  };

  const onSubmit = async () => {
    const validationError = validateVeiculoForm(form);
    if (hasValidationErrors(validationError)) {
      setFormErrors(validationError);
      return toast.error(getFirstInlineError(validationError) ?? getValidationMessages(validationError)[0]);
    }

    try {
      await createMoto.mutateAsync({
        marca: form.marca.trim(),
        modelo: form.modelo.trim(),
        placa: form.placa.trim().toUpperCase(),
        ano: Number(form.ano),
        anoModelo: Number(form.anoModelo),
        cor: form.cor.trim().toUpperCase(),
        chassi: form.chassi.trim().toUpperCase(),
        renavam: form.renavam.replace(/\D/g, ""),
      });
      toast.success("Moto criada com sucesso!");
      setForm(defaultVeiculoForm);
      setFormErrors({});
      setOpen(false);
      motos.refetch();
    } catch (error) {
      logClientError("Erro ao criar moto", error);
      const details = getErrorDetails(error, "Erro ao criar moto");
      if (Object.keys(details.fieldErrors).length > 0) {
        setFormErrors(mapFieldErrors<VeiculoField>(details.fieldErrors));
      }
      toast.error(details.message);
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta moto?")) return;
    try {
      await deleteMoto.mutateAsync({ id });
      toast.success("Moto deletada com sucesso!");
      motos.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao deletar moto"));
    }
  };

  const handleStatusChange = async (id: number, newStatus: MotoStatusInput) => {
    try {
      await updateMoto.mutateAsync({
        id,
        data: { status: newStatus },
      });
      toast.success("Status atualizado com sucesso!");
      motos.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao atualizar status"));
    }
  };

  const items = (motos.data || []) as VeiculoRecord[];

  return (
    <DashboardLayout>
      <div className="cadastros-page-shell">
        <div className="cadastros-page-header">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Motos</h1>
          <p className="mt-2 text-muted-foreground">Gerenciamento de motos disponíveis.</p>
        </div>

        <Card className="cadastros-section-card">
          <CardHeader>
            <CardTitle className="text-base">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={statusFilter} onValueChange={(value: "all" | "disponivel" | "alugada" | "manutencao") => setStatusFilter(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="alugada">Alugada</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <VeiculosTab
          open={open}
          onOpenChange={handleOpenChange}
          form={form}
          errors={formErrors}
          onFormChange={handleFormChange}
          items={items}
          isLoading={motos.isLoading}
          isSubmitting={createMoto.isPending}
          onCreate={onSubmit}
          onDelete={onDelete}
          title="Motos"
          createLabel="Nova Moto"
          createDialogTitle="Adicionar Nova Moto"
          createDialogDescription="Preencha os dados da nova moto"
          emptyMessage='Nenhuma moto cadastrada. Clique em "Nova Moto" para adicionar.'
        />

        {items.length > 0 ? (
          <Card className="cadastros-section-card">
            <CardHeader>
              <CardTitle className="text-base">Status das Motos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {items.map((moto) => (
                  <div key={moto.id} className="rounded-lg border p-4">
                    <div className="mb-3">
                      <p className="font-medium">{[moto.marca, moto.modelo].filter(Boolean).join(" / ")}</p>
                      <p className="text-sm text-muted-foreground">{moto.placa}</p>
                    </div>
                    <Select value={moto.status} onValueChange={(value) => handleStatusChange(moto.id, value as MotoStatusInput)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disponivel">Disponível</SelectItem>
                        <SelectItem value="alugada">Alugada</SelectItem>
                        <SelectItem value="manutencao">Manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </DashboardLayout>
  );
}