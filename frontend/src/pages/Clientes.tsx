import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { getErrorDetails, getErrorMessage, logClientError } from "@/lib/errors";
import { trpc } from "@/lib/trpc";
import "@/features/cadastros/cadastros.css";
import { CadastroImportInputs } from "@/features/cadastros/components/CadastroImportInputs";
import { LocatariosTab } from "@/features/cadastros/components/LocatariosTab";
import { clearFieldError, getFirstInlineError, mapFieldErrors } from "@/features/cadastros/form-errors";
import { useCadastroDocumentImport } from "@/features/cadastros/hooks/useCadastroDocumentImport";
import { applyLocatarioCnhImport, applyLocatarioComprovanteImport } from "@/features/cadastros/import-mappers";
import {
  defaultLocatarioForm,
  type LocatarioField,
  type LocatarioFormErrors,
  type LocatarioRecord,
} from "@/features/cadastros/types";
import { getValidationMessages, hasValidationErrors, validateLocatarioForm } from "@/features/cadastros/validation";
import { ImportReviewDialog } from "@/features/gerar-contrato/components/ImportReviewDialog";

export default function Clientes() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState(defaultLocatarioForm);
  const [formErrors, setFormErrors] = useState<LocatarioFormErrors>({});

  const cadastroImport = useCadastroDocumentImport({
    onApplyImportedFields: (kind, fields) => {
      if (kind === "cnh") {
        setForm((current) => applyLocatarioCnhImport(current, fields));
        setFormErrors({});
      }

      if (kind === "comprovante") {
        setForm((current) => applyLocatarioComprovanteImport(current, fields));
        setFormErrors({});
      }
    },
  });

  const clientes = trpc.clientes.list.useQuery();
  const createCliente = trpc.clientes.create.useMutation();
  const deleteCliente = trpc.clientes.delete.useMutation();
  const loadErrorMessage = clientes.error
    ? getErrorDetails(clientes.error, "Erro ao carregar clientes").message
    : undefined;

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setFormErrors({});
    }
  };

  const handleFormChange = (field: LocatarioField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => clearFieldError(current, field));
  };

  const onSubmit = async () => {
    const validationError = validateLocatarioForm(form);
    if (hasValidationErrors(validationError)) {
      setFormErrors(validationError);
      return toast.error(getFirstInlineError(validationError) ?? getValidationMessages(validationError)[0]);
    }

    try {
      await createCliente.mutateAsync({
        ...form,
        cpf: form.cpf.trim(),
        cnh: form.cnh.trim(),
        rg: form.rg.trim(),
        orgaoEmissor: form.orgaoEmissor.trim(),
        endereco: form.endereco.trim(),
        cidade: form.cidade.trim(),
        estado: form.estado.trim(),
        cep: form.cep.trim(),
        telefone: form.telefone.trim(),
      });
      toast.success("Cliente criado com sucesso!");
      setForm(defaultLocatarioForm);
      setFormErrors({});
      setOpen(false);
      clientes.refetch();
    } catch (error) {
      logClientError("Erro ao criar cliente", error);
      const details = getErrorDetails(error, "Erro ao criar cliente");
      if (Object.keys(details.fieldErrors).length > 0) {
        setFormErrors(mapFieldErrors<LocatarioField>(details.fieldErrors));
      }
      toast.error(details.message);
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este cliente?")) return;
    try {
      await deleteCliente.mutateAsync({ id });
      toast.success("Cliente deletado com sucesso!");
      clientes.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao deletar cliente"));
    }
  };

  const filteredClientes = ((clientes.data || []) as LocatarioRecord[]).filter((cliente) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return cliente.nome.toLowerCase().includes(term) || cliente.cpf.includes(term);
  });

  return (
    <DashboardLayout>
      <div className="cadastros-page-shell">
        <div className="cadastros-page-header">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Clientes</h1>
          <p className="mt-2 text-muted-foreground">Gerenciamento de clientes.</p>
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
            <AlertDescription>Processando o documento do cliente para revisão.</AlertDescription>
          </Alert>
        ) : null}

        <LocatariosTab
          open={open}
          onOpenChange={handleOpenChange}
          form={form}
          errors={formErrors}
          onFormChange={handleFormChange}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          items={filteredClientes}
          isLoading={clientes.isLoading}
          loadErrorMessage={loadErrorMessage}
          isSubmitting={createCliente.isPending}
          onCreate={onSubmit}
          onEdit={() => {}}
          onDelete={onDelete}
          title="Clientes"
          createLabel="Novo Cliente"
          createDialogTitle="Adicionar Novo Cliente"
          createDialogDescription="Preencha os dados do novo cliente"
          searchPlaceholder="Buscar por nome ou CPF..."
          emptyMessage={searchTerm ? "Nenhum cliente encontrado" : 'Nenhum cliente cadastrado. Clique em "Novo Cliente" para adicionar.'}
          showEditAction={false}
          cnhImport={{
            fileName: cadastroImport.importedFiles.cnh,
            isImporting: cadastroImport.isImporting.cnh,
            onImportClick: () => cadastroImport.openImportPicker("cnh"),
          }}
          comprovanteImport={{
            fileName: cadastroImport.importedFiles.comprovante,
            isImporting: cadastroImport.isImporting.comprovante,
            onImportClick: () => cadastroImport.openImportPicker("comprovante"),
          }}
        />

        <CadastroImportInputs
          kinds={["cnh", "comprovante"]}
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
      </div>
    </DashboardLayout>
  );
}
