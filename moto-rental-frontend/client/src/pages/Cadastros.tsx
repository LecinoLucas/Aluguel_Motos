import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getErrorDetails, getErrorMessage, logClientError } from "@/lib/errors";
import { trpc } from "@/lib/trpc";
import "@/features/cadastros/cadastros.css";
import { EditLocadorDialog } from "@/features/cadastros/components/EditLocadorDialog";
import { EditLocatarioDialog } from "@/features/cadastros/components/EditLocatarioDialog";
import { LocadoresTab } from "@/features/cadastros/components/LocadoresTab";
import { LocatariosTab } from "@/features/cadastros/components/LocatariosTab";
import { VeiculosTab } from "@/features/cadastros/components/VeiculosTab";
import { clearFieldError, getFirstInlineError, mapFieldErrors } from "@/features/cadastros/form-errors";
import {
  defaultLocadorForm,
  defaultLocatarioForm,
  defaultVeiculoForm,
  type LocadorField,
  type LocadorFormErrors,
  type LocadorRecord,
  type LocatarioField,
  type LocatarioFormErrors,
  type LocatarioRecord,
  type VeiculoField,
  type VeiculoFormErrors,
  type VeiculoRecord,
} from "@/features/cadastros/types";
import {
  getValidationMessages,
  hasValidationErrors,
  validateLocadorForm,
  validateLocatarioForm,
  validateVeiculoForm,
} from "@/features/cadastros/validation";

export default function Cadastros() {
  const [activeTab, setActiveTab] = useState("locadores");
  const [openLocador, setOpenLocador] = useState(false);
  const [openLocatario, setOpenLocatario] = useState(false);
  const [openVeiculo, setOpenVeiculo] = useState(false);
  const [editLocadorOpen, setEditLocadorOpen] = useState(false);
  const [editLocatarioOpen, setEditLocatarioOpen] = useState(false);
  const [editingLocadorId, setEditingLocadorId] = useState<number | null>(null);
  const [editingLocatarioId, setEditingLocatarioId] = useState<number | null>(null);
  const [locadorSearchTerm, setLocadorSearchTerm] = useState("");
  const [locatarioSearchTerm, setLocatarioSearchTerm] = useState("");
  const [locadorForm, setLocadorForm] = useState(defaultLocadorForm);
  const [locatarioForm, setLocatarioForm] = useState(defaultLocatarioForm);
  const [editLocadorForm, setEditLocadorForm] = useState(defaultLocadorForm);
  const [editLocatarioForm, setEditLocatarioForm] = useState(defaultLocatarioForm);
  const [veiculoForm, setVeiculoForm] = useState(defaultVeiculoForm);
  const [locadorErrors, setLocadorErrors] = useState<LocadorFormErrors>({});
  const [locatarioErrors, setLocatarioErrors] = useState<LocatarioFormErrors>({});
  const [editLocadorErrors, setEditLocadorErrors] = useState<LocadorFormErrors>({});
  const [editLocatarioErrors, setEditLocatarioErrors] = useState<LocatarioFormErrors>({});
  const [veiculoErrors, setVeiculoErrors] = useState<VeiculoFormErrors>({});

  const locadores = trpc.locadores.list.useQuery();
  const locatarios = trpc.clientes.list.useQuery();
  const veiculos = trpc.motos.list.useQuery({ status: undefined });

  const createLocador = trpc.locadores.create.useMutation();
  const updateLocador = trpc.locadores.update.useMutation();
  const deleteLocador = trpc.locadores.delete.useMutation();
  const createLocatario = trpc.clientes.create.useMutation();
  const updateLocatario = trpc.clientes.update.useMutation();
  const deleteLocatario = trpc.clientes.delete.useMutation();
  const createVeiculo = trpc.motos.create.useMutation();
  const deleteVeiculo = trpc.motos.delete.useMutation();

  const handleLocadorOpenChange = (value: boolean) => {
    setOpenLocador(value);
    if (!value) {
      setLocadorErrors({});
    }
  };

  const handleLocatarioOpenChange = (value: boolean) => {
    setOpenLocatario(value);
    if (!value) {
      setLocatarioErrors({});
    }
  };

  const handleVeiculoOpenChange = (value: boolean) => {
    setOpenVeiculo(value);
    if (!value) {
      setVeiculoErrors({});
    }
  };

  const handleEditLocadorOpenChange = (value: boolean) => {
    setEditLocadorOpen(value);
    if (!value) {
      setEditingLocadorId(null);
      setEditLocadorErrors({});
    }
  };

  const handleEditLocatarioOpenChange = (value: boolean) => {
    setEditLocatarioOpen(value);
    if (!value) {
      setEditingLocatarioId(null);
      setEditLocatarioErrors({});
    }
  };

  const handleLocadorFormChange = (field: LocadorField, value: string) => {
    setLocadorForm((current) => ({ ...current, [field]: value }));
    setLocadorErrors((current) => clearFieldError(current, field));
  };

  const handleLocatarioFormChange = (field: LocatarioField, value: string) => {
    setLocatarioForm((current) => ({ ...current, [field]: value }));
    setLocatarioErrors((current) => clearFieldError(current, field));
  };

  const handleEditLocadorFormChange = (field: LocadorField, value: string) => {
    setEditLocadorForm((current) => ({ ...current, [field]: value }));
    setEditLocadorErrors((current) => clearFieldError(current, field));
  };

  const handleEditLocatarioFormChange = (field: LocatarioField, value: string) => {
    setEditLocatarioForm((current) => ({ ...current, [field]: value }));
    setEditLocatarioErrors((current) => clearFieldError(current, field));
  };

  const handleVeiculoFormChange = (field: VeiculoField, value: string) => {
    setVeiculoForm((current) => ({ ...current, [field]: value }));
    setVeiculoErrors((current) => clearFieldError(current, field));
  };

  const handleCreateLocador = async () => {
    const validationError = validateLocadorForm(locadorForm);
    if (hasValidationErrors(validationError)) {
      setLocadorErrors(validationError);
      return toast.error(getFirstInlineError(validationError) ?? getValidationMessages(validationError)[0]);
    }

    try {
      await createLocador.mutateAsync({
        ...locadorForm,
        cpf: locadorForm.cpf.trim(),
        cep: locadorForm.cep.trim(),
        telefone: locadorForm.telefone.trim(),
      });
      toast.success("Locador cadastrado com sucesso!");
      setLocadorForm(defaultLocadorForm);
      setLocadorErrors({});
      setOpenLocador(false);
      locadores.refetch();
    } catch (error) {
      logClientError("Erro ao cadastrar locador", error);
      const details = getErrorDetails(error, "Erro ao cadastrar locador");
      if (Object.keys(details.fieldErrors).length > 0) {
        setLocadorErrors(mapFieldErrors<LocadorField>(details.fieldErrors));
      }
      toast.error(details.message);
    }
  };

  const openEditLocador = (locador: LocadorRecord) => {
    setEditingLocadorId(locador.id);
    setEditLocadorErrors({});
    setEditLocadorForm({
      nome: locador.nome || "",
      cpf: locador.cpf || "",
      rg: locador.rg || "",
      orgaoEmissor: locador.orgaoEmissor || "",
      nacionalidade: locador.nacionalidade || "brasileiro(a)",
      estadoCivil: locador.estadoCivil || "solteiro(a)",
      endereco: locador.endereco || "",
      cidade: locador.cidade || "",
      estado: locador.estado || "",
      cep: locador.cep || "",
      telefone: locador.telefone || "",
    });
    setEditLocadorOpen(true);
  };

  const handleUpdateLocador = async () => {
    if (!editingLocadorId) return;
    const validationError = validateLocadorForm(editLocadorForm);
    if (hasValidationErrors(validationError)) {
      setEditLocadorErrors(validationError);
      return toast.error(getFirstInlineError(validationError) ?? getValidationMessages(validationError)[0]);
    }

    try {
      await updateLocador.mutateAsync({
        id: editingLocadorId,
        data: {
          nome: editLocadorForm.nome.trim(),
          rg: editLocadorForm.rg.trim(),
          orgaoEmissor: editLocadorForm.orgaoEmissor.trim(),
          nacionalidade: editLocadorForm.nacionalidade.trim(),
          estadoCivil: editLocadorForm.estadoCivil.trim(),
          endereco: editLocadorForm.endereco.trim(),
          cidade: editLocadorForm.cidade.trim(),
          estado: editLocadorForm.estado.trim(),
          cep: editLocadorForm.cep.trim(),
          telefone: editLocadorForm.telefone.trim(),
        },
      });
      toast.success("Locador atualizado com sucesso!");
      setEditLocadorErrors({});
      setEditLocadorOpen(false);
      setEditingLocadorId(null);
      locadores.refetch();
    } catch (error) {
      logClientError("Erro ao atualizar locador", error);
      const details = getErrorDetails(error, "Erro ao atualizar locador");
      if (Object.keys(details.fieldErrors).length > 0) {
        setEditLocadorErrors(mapFieldErrors<LocadorField>(details.fieldErrors));
      }
      toast.error(details.message);
    }
  };

  const handleCreateLocatario = async () => {
    const validationError = validateLocatarioForm(locatarioForm);
    if (hasValidationErrors(validationError)) {
      setLocatarioErrors(validationError);
      return toast.error(getFirstInlineError(validationError) ?? getValidationMessages(validationError)[0]);
    }

    try {
      await createLocatario.mutateAsync({
        ...locatarioForm,
        cpf: locatarioForm.cpf.trim(),
        cnh: locatarioForm.cnh.trim(),
        rg: locatarioForm.rg.trim(),
        orgaoEmissor: locatarioForm.orgaoEmissor.trim(),
        endereco: locatarioForm.endereco.trim(),
        cidade: locatarioForm.cidade.trim(),
        estado: locatarioForm.estado.trim(),
        cep: locatarioForm.cep.trim(),
        telefone: locatarioForm.telefone.trim(),
      });
      toast.success("Locatário cadastrado com sucesso!");
      setLocatarioForm(defaultLocatarioForm);
      setLocatarioErrors({});
      setOpenLocatario(false);
      locatarios.refetch();
    } catch (error) {
      logClientError("Erro ao cadastrar locatário", error);
      const details = getErrorDetails(error, "Erro ao cadastrar locatário");
      if (Object.keys(details.fieldErrors).length > 0) {
        setLocatarioErrors(mapFieldErrors<LocatarioField>(details.fieldErrors));
      }
      toast.error(details.message);
    }
  };

  const openEditLocatario = (locatario: LocatarioRecord) => {
    setEditingLocatarioId(locatario.id);
    setEditLocatarioErrors({});
    setEditLocatarioForm({
      nome: locatario.nome || "",
      cpf: locatario.cpf || "",
      cnh: locatario.cnh || "",
      rg: locatario.rg || "",
      orgaoEmissor: locatario.orgaoEmissor || "",
      nacionalidade: locatario.nacionalidade || "brasileiro(a)",
      estadoCivil: locatario.estadoCivil || "solteiro(a)",
      endereco: locatario.endereco || "",
      cidade: locatario.cidade || "",
      estado: locatario.estado || "",
      cep: locatario.cep || "",
      email: locatario.email || "",
      telefone: locatario.telefone || "",
    });
    setEditLocatarioOpen(true);
  };

  const handleUpdateLocatario = async () => {
    if (!editingLocatarioId) return;
    const validationError = validateLocatarioForm(editLocatarioForm, false);
    if (hasValidationErrors(validationError)) {
      setEditLocatarioErrors(validationError);
      return toast.error(getFirstInlineError(validationError) ?? getValidationMessages(validationError)[0]);
    }

    try {
      await updateLocatario.mutateAsync({
        id: editingLocatarioId,
        data: {
          nome: editLocatarioForm.nome.trim(),
          rg: editLocatarioForm.rg.trim(),
          orgaoEmissor: editLocatarioForm.orgaoEmissor.trim(),
          nacionalidade: editLocatarioForm.nacionalidade.trim(),
          estadoCivil: editLocatarioForm.estadoCivil.trim(),
          endereco: editLocatarioForm.endereco.trim(),
          cidade: editLocatarioForm.cidade.trim(),
          estado: editLocatarioForm.estado.trim(),
          cep: editLocatarioForm.cep.trim(),
          email: editLocatarioForm.email.trim(),
          telefone: editLocatarioForm.telefone.trim(),
        },
      });
      toast.success("Locatário atualizado com sucesso!");
      setEditLocatarioErrors({});
      setEditLocatarioOpen(false);
      setEditingLocatarioId(null);
      locatarios.refetch();
    } catch (error) {
      logClientError("Erro ao atualizar locatário", error);
      const details = getErrorDetails(error, "Erro ao atualizar locatário");
      if (Object.keys(details.fieldErrors).length > 0) {
        setEditLocatarioErrors(mapFieldErrors<LocatarioField>(details.fieldErrors));
      }
      toast.error(details.message);
    }
  };

  const handleCreateVeiculo = async () => {
    const validationError = validateVeiculoForm(veiculoForm);
    if (hasValidationErrors(validationError)) {
      setVeiculoErrors(validationError);
      return toast.error(getFirstInlineError(validationError) ?? getValidationMessages(validationError)[0]);
    }

    try {
      await createVeiculo.mutateAsync({
        marca: veiculoForm.marca.trim(),
        modelo: veiculoForm.modelo.trim(),
        placa: veiculoForm.placa.trim().toUpperCase(),
        ano: Number(veiculoForm.ano),
        anoModelo: Number(veiculoForm.anoModelo),
        cor: veiculoForm.cor.trim().toUpperCase(),
        chassi: veiculoForm.chassi.trim().toUpperCase(),
        renavam: veiculoForm.renavam.replace(/\D/g, ""),
      });
      toast.success("Veículo cadastrado com sucesso!");
      setVeiculoForm(defaultVeiculoForm);
      setVeiculoErrors({});
      setOpenVeiculo(false);
      veiculos.refetch();
    } catch (error) {
      logClientError("Erro ao cadastrar veículo", error);
      const details = getErrorDetails(error, "Erro ao cadastrar veículo");
      if (Object.keys(details.fieldErrors).length > 0) {
        setVeiculoErrors(mapFieldErrors<VeiculoField>(details.fieldErrors));
      }
      toast.error(details.message);
    }
  };

  const handleDelete = async (type: "locador" | "locatario" | "veiculo", id: number) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    try {
      if (type === "locador") {
        await deleteLocador.mutateAsync({ id });
        locadores.refetch();
      }
      if (type === "locatario") {
        await deleteLocatario.mutateAsync({ id });
        locatarios.refetch();
      }
      if (type === "veiculo") {
        await deleteVeiculo.mutateAsync({ id });
        veiculos.refetch();
      }
      toast.success("Registro removido com sucesso!");
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao remover registro"));
    }
  };

  const filteredLocadores = ((locadores.data || []) as LocadorRecord[]).filter((item) => {
    const term = locadorSearchTerm.trim().toLowerCase();
    if (!term) return true;
    return item.nome.toLowerCase().includes(term) || item.cpf.toLowerCase().includes(term);
  });

  const filteredLocatarios = ((locatarios.data || []) as LocatarioRecord[]).filter((item) => {
    const term = locatarioSearchTerm.trim().toLowerCase();
    if (!term) return true;
    return item.nome.toLowerCase().includes(term) || item.cpf.toLowerCase().includes(term);
  });

  return (
    <DashboardLayout>
      <div className="cadastros-page-shell">
        <div className="cadastros-page-header">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Cadastros</h1>
          <p className="mt-2 text-muted-foreground">
            Cadastre locadores, locatários e veículos para usar no Gerar Contrato.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="-mx-1 overflow-x-auto px-1 pb-1">
            <TabsList className="grid min-w-[620px] grid-cols-3">
              <TabsTrigger value="locadores">Locadores</TabsTrigger>
              <TabsTrigger value="locatarios">Locatários</TabsTrigger>
              <TabsTrigger value="veiculos">Veículos</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="locadores">
            <LocadoresTab
              open={openLocador}
              onOpenChange={handleLocadorOpenChange}
              form={locadorForm}
              errors={locadorErrors}
              onFormChange={handleLocadorFormChange}
              searchTerm={locadorSearchTerm}
              onSearchTermChange={setLocadorSearchTerm}
              items={filteredLocadores}
              isLoading={locadores.isLoading}
              isSubmitting={createLocador.isPending}
              onCreate={handleCreateLocador}
              onEdit={openEditLocador}
              onDelete={(id) => handleDelete("locador", id)}
            />
          </TabsContent>

          <TabsContent value="locatarios">
            <LocatariosTab
              open={openLocatario}
              onOpenChange={handleLocatarioOpenChange}
              form={locatarioForm}
              errors={locatarioErrors}
              onFormChange={handleLocatarioFormChange}
              searchTerm={locatarioSearchTerm}
              onSearchTermChange={setLocatarioSearchTerm}
              items={filteredLocatarios}
              isLoading={locatarios.isLoading}
              isSubmitting={createLocatario.isPending}
              onCreate={handleCreateLocatario}
              onEdit={openEditLocatario}
              onDelete={(id) => handleDelete("locatario", id)}
            />
          </TabsContent>

          <TabsContent value="veiculos">
            <VeiculosTab
              open={openVeiculo}
              onOpenChange={handleVeiculoOpenChange}
              form={veiculoForm}
              errors={veiculoErrors}
              onFormChange={handleVeiculoFormChange}
              items={(veiculos.data || []) as VeiculoRecord[]}
              isLoading={veiculos.isLoading}
              isSubmitting={createVeiculo.isPending}
              onCreate={handleCreateVeiculo}
              onDelete={(id) => handleDelete("veiculo", id)}
            />
          </TabsContent>
        </Tabs>

        <EditLocadorDialog
          open={editLocadorOpen}
          onOpenChange={handleEditLocadorOpenChange}
          form={editLocadorForm}
          errors={editLocadorErrors}
          onFormChange={handleEditLocadorFormChange}
          isSubmitting={updateLocador.isPending}
          onSave={handleUpdateLocador}
        />

        <EditLocatarioDialog
          open={editLocatarioOpen}
          onOpenChange={handleEditLocatarioOpenChange}
          form={editLocatarioForm}
          errors={editLocatarioErrors}
          onFormChange={handleEditLocatarioFormChange}
          isSubmitting={updateLocatario.isPending}
          onSave={handleUpdateLocatario}
        />
      </div>
    </DashboardLayout>
  );
}