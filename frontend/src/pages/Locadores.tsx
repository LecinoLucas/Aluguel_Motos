import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { getErrorDetails, getErrorMessage, logClientError } from "@/lib/errors";
import { trpc } from "@/lib/trpc";
import "@/features/cadastros/cadastros.css";
import { CadastroImportInputs } from "@/features/cadastros/components/CadastroImportInputs";
import { EditLocadorDialog } from "@/features/cadastros/components/EditLocadorDialog";
import { LocadoresTab } from "@/features/cadastros/components/LocadoresTab";
import { formatCepDisplay, formatCpfDisplay, formatPhoneDisplay, formatRgDisplay } from "@/features/cadastros/format";
import { clearFieldError, getFirstInlineError, mapFieldErrors } from "@/features/cadastros/form-errors";
import { useCadastroDocumentImport } from "@/features/cadastros/hooks/useCadastroDocumentImport";
import { applyLocadorImport } from "@/features/cadastros/import-mappers";
import {
  defaultLocadorForm,
  type LocadorField,
  type LocadorFormErrors,
  type LocadorRecord,
} from "@/features/cadastros/types";
import { getValidationMessages, hasValidationErrors, validateLocadorForm } from "@/features/cadastros/validation";
import { ImportReviewDialog } from "@/features/gerar-contrato/components/ImportReviewDialog";

export default function Locadores() {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState(defaultLocadorForm);
  const [editForm, setEditForm] = useState(defaultLocadorForm);
  const [formErrors, setFormErrors] = useState<LocadorFormErrors>({});
  const [editFormErrors, setEditFormErrors] = useState<LocadorFormErrors>({});

  const cadastroImport = useCadastroDocumentImport({
    onApplyImportedFields: (kind, fields) => {
      if (kind !== "locador") return;
      setForm((current) => applyLocadorImport(current, fields));
      setFormErrors({});
    },
  });

  const locadores = trpc.locadores.list.useQuery();
  const createLocador = trpc.locadores.create.useMutation();
  const updateLocador = trpc.locadores.update.useMutation();
  const deleteLocador = trpc.locadores.delete.useMutation();
  const loadErrorMessage = locadores.error
    ? getErrorDetails(locadores.error, "Erro ao carregar locadores").message
    : undefined;

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setFormErrors({});
    }
  };

  const handleEditOpenChange = (value: boolean) => {
    setEditOpen(value);
    if (!value) {
      setEditingId(null);
      setEditFormErrors({});
    }
  };

  const handleFormChange = (field: LocadorField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => clearFieldError(current, field));
  };

  const handleEditFormChange = (field: LocadorField, value: string) => {
    setEditForm((current) => ({ ...current, [field]: value }));
    setEditFormErrors((current) => clearFieldError(current, field));
  };

  const onSubmit = async () => {
    const validationError = validateLocadorForm(form);
    if (hasValidationErrors(validationError)) {
      setFormErrors(validationError);
      return toast.error(getFirstInlineError(validationError) ?? getValidationMessages(validationError)[0]);
    }

    try {
      await createLocador.mutateAsync({
        ...form,
        cpf: form.cpf.trim(),
        cep: form.cep.trim(),
        telefone: form.telefone.trim(),
      });
      toast.success("Locador cadastrado com sucesso!");
      setForm(defaultLocadorForm);
      setFormErrors({});
      setOpen(false);
      locadores.refetch();
    } catch (error) {
      logClientError("Erro ao cadastrar locador", error);
      const details = getErrorDetails(error, "Erro ao cadastrar locador");
      if (Object.keys(details.fieldErrors).length > 0) {
        setFormErrors(mapFieldErrors<LocadorField>(details.fieldErrors));
      }
      toast.error(details.message);
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este locador?")) return;
    try {
      await deleteLocador.mutateAsync({ id });
      toast.success("Locador deletado com sucesso!");
      locadores.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao deletar locador"));
    }
  };

  const openEdit = (locador: LocadorRecord) => {
    setEditingId(locador.id);
    setEditFormErrors({});
    setEditForm({
      nome: locador.nome || "",
      cpf: locador.cpf ? formatCpfDisplay(locador.cpf) : "",
      rg: locador.rg ? formatRgDisplay(locador.rg) : "",
      orgaoEmissor: locador.orgaoEmissor || "",
      nacionalidade: locador.nacionalidade || "brasileiro(a)",
      estadoCivil: locador.estadoCivil || "solteiro(a)",
      endereco: locador.endereco || "",
      cidade: locador.cidade || "",
      estado: locador.estado || "",
      cep: locador.cep ? formatCepDisplay(locador.cep) : "",
      telefone: locador.telefone ? formatPhoneDisplay(locador.telefone) : "",
    });
    setEditOpen(true);
  };

  const onEditSubmit = async () => {
    if (!editingId) return;

    const validationError = validateLocadorForm(editForm);
    if (hasValidationErrors(validationError)) {
      setEditFormErrors(validationError);
      return toast.error(getFirstInlineError(validationError) ?? getValidationMessages(validationError)[0]);
    }

    try {
      await updateLocador.mutateAsync({
        id: editingId,
        data: {
          nome: editForm.nome.trim(),
          rg: editForm.rg.trim(),
          orgaoEmissor: editForm.orgaoEmissor.trim(),
          nacionalidade: editForm.nacionalidade.trim(),
          estadoCivil: editForm.estadoCivil.trim(),
          endereco: editForm.endereco.trim(),
          cidade: editForm.cidade.trim(),
          estado: editForm.estado.trim(),
          cep: editForm.cep.trim(),
          telefone: editForm.telefone.trim(),
        },
      });
      toast.success("Locador atualizado com sucesso!");
      setEditFormErrors({});
      setEditOpen(false);
      setEditingId(null);
      locadores.refetch();
    } catch (error) {
      logClientError("Erro ao atualizar locador", error);
      const details = getErrorDetails(error, "Erro ao atualizar locador");
      if (Object.keys(details.fieldErrors).length > 0) {
        setEditFormErrors(mapFieldErrors<LocadorField>(details.fieldErrors));
      }
      toast.error(details.message);
    }
  };

  const filteredLocadores = ((locadores.data || []) as LocadorRecord[]).filter((locador) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return locador.nome.toLowerCase().includes(term) || locador.cpf.toLowerCase().includes(term);
  });

  return (
    <DashboardLayout>
      <div className="cadastros-page-shell">
        <div className="cadastros-page-header">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Locadores</h1>
          <p className="mt-2 text-muted-foreground">Cadastre os locadores e reaproveite nos contratos.</p>
        </div>

        {cadastroImport.backendAvailable === false ? (
          <Alert>
            <AlertDescription>
              O serviço avançado de leitura não está disponível. A importação seguirá com OCR local.
            </AlertDescription>
          </Alert>
        ) : null}

        {cadastroImport.isAnyImporting ? (
          <Alert>
            <AlertDescription>Processando o documento do locador para revisão.</AlertDescription>
          </Alert>
        ) : null}

        <LocadoresTab
          open={open}
          onOpenChange={handleOpenChange}
          form={form}
          errors={formErrors}
          onFormChange={handleFormChange}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          items={filteredLocadores}
          isLoading={locadores.isLoading}
          loadErrorMessage={loadErrorMessage}
          isSubmitting={createLocador.isPending}
          onCreate={onSubmit}
          onEdit={openEdit}
          onDelete={onDelete}
          emptyMessage={searchTerm ? "Nenhum locador encontrado para esta busca." : 'Nenhum locador cadastrado. Clique em "Novo Locador" para adicionar.'}
          locadorImport={{
            fileName: cadastroImport.importedFiles.locador,
            isImporting: cadastroImport.isImporting.locador,
            onImportClick: () => cadastroImport.openImportPicker("locador"),
          }}
        />

        <CadastroImportInputs
          kinds={["locador"]}
          refs={{
            locador: cadastroImport.locadorInputRef,
            cnh: cadastroImport.cnhInputRef,
            comprovante: cadastroImport.comprovanteInputRef,
            crlv: cadastroImport.crlvInputRef,
          }}
          onChange={cadastroImport.handleFileChange}
        />

        <ImportReviewDialog
          open={Boolean(cadastroImport.pendingImportReview)}
          review={cadastroImport.pendingImportReview}
          previewEntries={cadastroImport.importPreviewEntries}
          onClose={cadastroImport.cancelImportReview}
          onConfirm={cadastroImport.confirmImportReview}
          onUpdateField={cadastroImport.updatePendingImportField}
        />

        <EditLocadorDialog
          open={editOpen}
          onOpenChange={handleEditOpenChange}
          form={editForm}
          errors={editFormErrors}
          onFormChange={handleEditFormChange}
          isSubmitting={updateLocador.isPending}
          onSave={onEditSubmit}
        />
      </div>
    </DashboardLayout>
  );
}
