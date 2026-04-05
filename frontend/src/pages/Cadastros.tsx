import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getErrorDetails, getErrorMessage, logClientError } from "@/lib/errors";
import { trpc } from "@/lib/trpc";
import "@/features/cadastros/cadastros.css";
import { CadastroImportInputs } from "@/features/cadastros/components/CadastroImportInputs";
import { EditLocadorDialog } from "@/features/cadastros/components/EditLocadorDialog";
import { EditLocatarioDialog } from "@/features/cadastros/components/EditLocatarioDialog";
import { LocadoresTab } from "@/features/cadastros/components/LocadoresTab";
import { LocatariosTab } from "@/features/cadastros/components/LocatariosTab";
import { PecasTab } from "@/features/cadastros/components/PecasTab";
import { TiposManutencaoTab } from "@/features/cadastros/components/TiposManutencaoTab";
import { VeiculosTab } from "@/features/cadastros/components/VeiculosTab";
import { formatCepDisplay, formatCnhDisplay, formatCpfDisplay, formatPhoneDisplay, formatRgDisplay } from "@/features/cadastros/format";
import { clearFieldError, getFirstInlineError, mapFieldErrors } from "@/features/cadastros/form-errors";
import { useCadastroDocumentImport } from "@/features/cadastros/hooks/useCadastroDocumentImport";
import {
  applyLocadorImport,
  applyLocatarioCnhImport,
  applyLocatarioComprovanteImport,
  applyVeiculoImport,
} from "@/features/cadastros/import-mappers";
import {
  defaultLocadorForm,
  defaultLocatarioForm,
  defaultPecaForm,
  defaultVeiculoForm,
  defaultTipoManutencaoForm,
  type LocadorField,
  type LocadorFormErrors,
  type LocadorRecord,
  type PecaField,
  type PecaFormErrors,
  type PecaRecord,
  type LocatarioField,
  type LocatarioFormErrors,
  type LocatarioRecord,
  type VeiculoField,
  type VeiculoFormErrors,
  type VeiculoRecord,
  type TipoManutencaoField,
  type TipoManutencaoFormErrors,
  type TipoManutencaoRecord,
} from "@/features/cadastros/types";
import {
  getValidationMessages,
  hasValidationErrors,
  validateLocadorForm,
  validateLocatarioForm,
  validatePecaForm,
  validateTipoManutencaoForm,
  validateVeiculoForm,
} from "@/features/cadastros/validation";
import { ImportReviewDialog } from "@/features/gerar-contrato/components/ImportReviewDialog";

export default function Cadastros() {
  const [activeTab, setActiveTab] = useState("locadores");
  const [openLocador, setOpenLocador] = useState(false);
  const [openLocatario, setOpenLocatario] = useState(false);
  const [openVeiculo, setOpenVeiculo] = useState(false);
  const [openPeca, setOpenPeca] = useState(false);
  const [openTipoManutencao, setOpenTipoManutencao] = useState(false);
  const [editLocadorOpen, setEditLocadorOpen] = useState(false);
  const [editLocatarioOpen, setEditLocatarioOpen] = useState(false);
  const [editPecaOpen, setEditPecaOpen] = useState(false);
  const [editTipoManutencaoOpen, setEditTipoManutencaoOpen] = useState(false);
  const [editingLocadorId, setEditingLocadorId] = useState<number | null>(null);
  const [editingLocatarioId, setEditingLocatarioId] = useState<number | null>(null);
  const [editingPecaId, setEditingPecaId] = useState<number | null>(null);
  const [editingTipoManutencaoId, setEditingTipoManutencaoId] = useState<number | null>(null);
  const [locadorSearchTerm, setLocadorSearchTerm] = useState("");
  const [locatarioSearchTerm, setLocatarioSearchTerm] = useState("");
  const [veiculoSearchTerm, setVeiculoSearchTerm] = useState("");
  const [pecaSearchTerm, setPecaSearchTerm] = useState("");
  const [tipoManutencaoSearchTerm, setTipoManutencaoSearchTerm] = useState("");
  const [locadorForm, setLocadorForm] = useState(defaultLocadorForm);
  const [locatarioForm, setLocatarioForm] = useState(defaultLocatarioForm);
  const [pecaForm, setPecaForm] = useState(defaultPecaForm);
  const [editLocadorForm, setEditLocadorForm] = useState(defaultLocadorForm);
  const [editLocatarioForm, setEditLocatarioForm] = useState(defaultLocatarioForm);
  const [editPecaForm, setEditPecaForm] = useState(defaultPecaForm);
  const [veiculoForm, setVeiculoForm] = useState(defaultVeiculoForm);
  const [editVeiculoOpen, setEditVeiculoOpen] = useState(false);
  const [editingVeiculoId, setEditingVeiculoId] = useState<number | null>(null);
  const [editVeiculoForm, setEditVeiculoForm] = useState(defaultVeiculoForm);
  const [tipoManutencaoForm, setTipoManutencaoForm] = useState(defaultTipoManutencaoForm);
  const [editTipoManutencaoForm, setEditTipoManutencaoForm] = useState(defaultTipoManutencaoForm);
  const [locadorErrors, setLocadorErrors] = useState<LocadorFormErrors>({});
  const [locatarioErrors, setLocatarioErrors] = useState<LocatarioFormErrors>({});
  const [editLocadorErrors, setEditLocadorErrors] = useState<LocadorFormErrors>({});
  const [editLocatarioErrors, setEditLocatarioErrors] = useState<LocatarioFormErrors>({});
  const [veiculoErrors, setVeiculoErrors] = useState<VeiculoFormErrors>({});
  const [editVeiculoErrors, setEditVeiculoErrors] = useState<VeiculoFormErrors>({});
  const [pecaErrors, setPecaErrors] = useState<PecaFormErrors>({});
  const [editPecaErrors, setEditPecaErrors] = useState<PecaFormErrors>({});
  const [tipoManutencaoErrors, setTipoManutencaoErrors] = useState<TipoManutencaoFormErrors>({});
  const [editTipoManutencaoErrors, setEditTipoManutencaoErrors] = useState<TipoManutencaoFormErrors>({});

  const cadastroImport = useCadastroDocumentImport({
    onApplyImportedFields: (kind, fields) => {
      if (kind === "locador") {
        setLocadorForm((current) => applyLocadorImport(current, fields));
        setLocadorErrors({});
      }

      if (kind === "cnh") {
        setLocatarioForm((current) => applyLocatarioCnhImport(current, fields));
        setLocatarioErrors({});
      }

      if (kind === "comprovante") {
        setLocatarioForm((current) => applyLocatarioComprovanteImport(current, fields));
        setLocatarioErrors({});
      }

      if (kind === "crlv") {
        setVeiculoForm((current) => applyVeiculoImport(current, fields));
        setVeiculoErrors({});
      }
    },
  });

  const locadores = trpc.locadores.list.useQuery();
  const locatarios = trpc.clientes.list.useQuery();
  const veiculos = trpc.motos.list.useQuery({ status: undefined });
  const pecas = trpc.pecas.list.useQuery();
  const tiposManutencao = trpc.tiposManutencao.list.useQuery();

  const createLocador = trpc.locadores.create.useMutation();
  const updateLocador = trpc.locadores.update.useMutation();
  const deleteLocador = trpc.locadores.delete.useMutation();
  const createLocatario = trpc.clientes.create.useMutation();
  const updateLocatario = trpc.clientes.update.useMutation();
  const deleteLocatario = trpc.clientes.delete.useMutation();
  const createVeiculo = trpc.motos.create.useMutation();
  const updateVeiculo = trpc.motos.update.useMutation();
  const deleteVeiculo = trpc.motos.delete.useMutation();
  const createPeca = trpc.pecas.create.useMutation();
  const updatePeca = trpc.pecas.update.useMutation();
  const deletePeca = trpc.pecas.delete.useMutation();
  const createTipoManutencao = trpc.tiposManutencao.create.useMutation();
  const updateTipoManutencao = trpc.tiposManutencao.update.useMutation();
  const deleteTipoManutencao = trpc.tiposManutencao.delete.useMutation();
  const locadoresLoadError = locadores.error
    ? getErrorDetails(locadores.error, "Erro ao carregar locadores").message
    : undefined;
  const locatariosLoadError = locatarios.error
    ? getErrorDetails(locatarios.error, "Erro ao carregar locatários").message
    : undefined;
  const veiculosLoadError = veiculos.error
    ? getErrorDetails(veiculos.error, "Erro ao carregar veículos").message
    : undefined;
  const pecasLoadError = pecas.error
    ? getErrorDetails(pecas.error, "Erro ao carregar peças").message
    : undefined;
  const tiposManutencaoLoadError = tiposManutencao.error
    ? getErrorDetails(tiposManutencao.error, "Erro ao carregar tipos de manutenção").message
    : undefined;

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

  const handleEditVeiculoOpenChange = (value: boolean) => {
    setEditVeiculoOpen(value);
    if (!value) {
      setEditingVeiculoId(null);
      setEditVeiculoErrors({});
    }
  };

  const handleTipoManutencaoOpenChange = (value: boolean) => {
    setOpenTipoManutencao(value);
    if (!value) {
      setTipoManutencaoErrors({});
    }
  };

  const handlePecaOpenChange = (value: boolean) => {
    setOpenPeca(value);
    if (!value) {
      setPecaErrors({});
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

  const handleEditTipoManutencaoOpenChange = (value: boolean) => {
    setEditTipoManutencaoOpen(value);
    if (!value) {
      setEditingTipoManutencaoId(null);
      setEditTipoManutencaoErrors({});
    }
  };

  const handleEditPecaOpenChange = (value: boolean) => {
    setEditPecaOpen(value);
    if (!value) {
      setEditingPecaId(null);
      setEditPecaErrors({});
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

  const handleEditVeiculoFormChange = (field: VeiculoField, value: string) => {
    setEditVeiculoForm((current) => ({ ...current, [field]: value }));
    setEditVeiculoErrors((current) => clearFieldError(current, field));
  };

  const handleTipoManutencaoFormChange = (field: TipoManutencaoField, value: string) => {
    setTipoManutencaoForm((current) => ({ ...current, [field]: value }));
    setTipoManutencaoErrors((current) => clearFieldError(current, field));
  };

  const handlePecaFormChange = (field: PecaField, value: string) => {
    setPecaForm((current) => ({ ...current, [field]: value }));
    setPecaErrors((current) => clearFieldError(current, field));
  };

  const handleEditTipoManutencaoFormChange = (field: TipoManutencaoField, value: string) => {
    setEditTipoManutencaoForm((current) => ({ ...current, [field]: value }));
    setEditTipoManutencaoErrors((current) => clearFieldError(current, field));
  };

  const handleEditPecaFormChange = (field: PecaField, value: string) => {
    setEditPecaForm((current) => ({ ...current, [field]: value }));
    setEditPecaErrors((current) => clearFieldError(current, field));
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
      cpf: locatario.cpf ? formatCpfDisplay(locatario.cpf) : "",
      cnh: locatario.cnh ? formatCnhDisplay(locatario.cnh) : "",
      rg: locatario.rg ? formatRgDisplay(locatario.rg) : "",
      orgaoEmissor: locatario.orgaoEmissor || "",
      nacionalidade: locatario.nacionalidade || "brasileiro(a)",
      estadoCivil: locatario.estadoCivil || "solteiro(a)",
      endereco: locatario.endereco || "",
      cidade: locatario.cidade || "",
      estado: locatario.estado || "",
      cep: locatario.cep ? formatCepDisplay(locatario.cep) : "",
      email: locatario.email || "",
      telefone: locatario.telefone ? formatPhoneDisplay(locatario.telefone) : "",
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

  const openEditVeiculo = (veiculo: VeiculoRecord) => {
    setEditingVeiculoId(veiculo.id);
    setEditVeiculoErrors({});
    setEditVeiculoForm({
      marca: veiculo.marca || "",
      modelo: veiculo.modelo || "",
      placa: veiculo.placa || "",
      ano: veiculo.ano ? String(veiculo.ano) : "",
      anoModelo: veiculo.anoModelo ? String(veiculo.anoModelo) : "",
      cor: veiculo.cor || "",
      chassi: veiculo.chassi || "",
      renavam: veiculo.renavam || "",
    });
    setEditVeiculoOpen(true);
  };

  const handleUpdateVeiculo = async () => {
    if (!editingVeiculoId) return;
    const validationError = validateVeiculoForm(editVeiculoForm);
    if (hasValidationErrors(validationError)) {
      setEditVeiculoErrors(validationError);
      return toast.error(getFirstInlineError(validationError) ?? getValidationMessages(validationError)[0]);
    }

    try {
      await updateVeiculo.mutateAsync({
        id: editingVeiculoId,
        data: {
          marca: editVeiculoForm.marca.trim(),
          modelo: editVeiculoForm.modelo.trim(),
          placa: editVeiculoForm.placa.trim().toUpperCase(),
          ano: Number(editVeiculoForm.ano),
          anoModelo: Number(editVeiculoForm.anoModelo),
          cor: editVeiculoForm.cor.trim().toUpperCase(),
          chassi: editVeiculoForm.chassi.trim().toUpperCase(),
          renavam: editVeiculoForm.renavam.replace(/\D/g, ""),
        },
      });
      toast.success("Veículo atualizado com sucesso!");
      setEditVeiculoForm(defaultVeiculoForm);
      setEditVeiculoErrors({});
      setEditVeiculoOpen(false);
      setEditingVeiculoId(null);
      veiculos.refetch();
    } catch (error) {
      logClientError("Erro ao atualizar veículo", error);
      const details = getErrorDetails(error, "Erro ao atualizar veículo");
      if (Object.keys(details.fieldErrors).length > 0) {
        setEditVeiculoErrors(mapFieldErrors<VeiculoField>(details.fieldErrors));
      }
      toast.error(details.message);
    }
  };

  const handleCreateTipoManutencao = async () => {
    const validationError = validateTipoManutencaoForm(tipoManutencaoForm);
    if (hasValidationErrors(validationError)) {
      setTipoManutencaoErrors(validationError);
      return toast.error(getFirstInlineError(validationError) ?? getValidationMessages(validationError)[0]);
    }

    try {
      await createTipoManutencao.mutateAsync({
        nome: tipoManutencaoForm.nome.trim(),
        descricao: tipoManutencaoForm.descricao.trim() || undefined,
        intervaloDiasPadrao: tipoManutencaoForm.intervaloDiasPadrao.trim()
          ? Number(tipoManutencaoForm.intervaloDiasPadrao)
          : undefined,
      });
      toast.success("Tipo de manutenção cadastrado com sucesso!");
      setTipoManutencaoForm(defaultTipoManutencaoForm);
      setTipoManutencaoErrors({});
      setOpenTipoManutencao(false);
      tiposManutencao.refetch();
    } catch (error) {
      logClientError("Erro ao cadastrar tipo de manutenção", error);
      const details = getErrorDetails(error, "Erro ao cadastrar tipo de manutenção");
      if (Object.keys(details.fieldErrors).length > 0) {
        setTipoManutencaoErrors(mapFieldErrors<TipoManutencaoField>(details.fieldErrors));
      }
      toast.error(details.message);
    }
  };

  const handleCreatePeca = async () => {
    const validationError = validatePecaForm(pecaForm);
    if (hasValidationErrors(validationError)) {
      setPecaErrors(validationError);
      return toast.error(getFirstInlineError(validationError) ?? getValidationMessages(validationError)[0]);
    }

    try {
      await createPeca.mutateAsync({
        nome: pecaForm.nome.trim(),
        descricao: pecaForm.descricao.trim() || undefined,
      });
      toast.success("Peça cadastrada com sucesso!");
      setPecaForm(defaultPecaForm);
      setPecaErrors({});
      setOpenPeca(false);
      pecas.refetch();
    } catch (error) {
      logClientError("Erro ao cadastrar peça", error);
      const details = getErrorDetails(error, "Erro ao cadastrar peça");
      if (Object.keys(details.fieldErrors).length > 0) {
        setPecaErrors(mapFieldErrors<PecaField>(details.fieldErrors));
      }
      toast.error(details.message);
    }
  };

  const openEditTipoManutencao = (tipo: TipoManutencaoRecord) => {
    setEditingTipoManutencaoId(tipo.id);
    setEditTipoManutencaoErrors({});
    setEditTipoManutencaoForm({
      nome: tipo.nome || "",
      descricao: tipo.descricao || "",
      intervaloDiasPadrao: tipo.intervaloDiasPadrao ? String(tipo.intervaloDiasPadrao) : "",
    });
    setEditTipoManutencaoOpen(true);
  };

  const openEditPeca = (peca: PecaRecord) => {
    setEditingPecaId(peca.id);
    setEditPecaErrors({});
    setEditPecaForm({
      nome: peca.nome || "",
      descricao: peca.descricao || "",
    });
    setEditPecaOpen(true);
  };

  const handleUpdateTipoManutencao = async () => {
    if (!editingTipoManutencaoId) return;
    const validationError = validateTipoManutencaoForm(editTipoManutencaoForm);
    if (hasValidationErrors(validationError)) {
      setEditTipoManutencaoErrors(validationError);
      return toast.error(getFirstInlineError(validationError) ?? getValidationMessages(validationError)[0]);
    }

    try {
      await updateTipoManutencao.mutateAsync({
        id: editingTipoManutencaoId,
        data: {
          nome: editTipoManutencaoForm.nome.trim(),
          descricao: editTipoManutencaoForm.descricao.trim() || undefined,
          intervaloDiasPadrao: editTipoManutencaoForm.intervaloDiasPadrao.trim()
            ? Number(editTipoManutencaoForm.intervaloDiasPadrao)
            : undefined,
        },
      });
      toast.success("Tipo de manutenção atualizado com sucesso!");
      setEditTipoManutencaoForm(defaultTipoManutencaoForm);
      setEditTipoManutencaoErrors({});
      setEditTipoManutencaoOpen(false);
      setEditingTipoManutencaoId(null);
      tiposManutencao.refetch();
    } catch (error) {
      logClientError("Erro ao atualizar tipo de manutenção", error);
      const details = getErrorDetails(error, "Erro ao atualizar tipo de manutenção");
      if (Object.keys(details.fieldErrors).length > 0) {
        setEditTipoManutencaoErrors(mapFieldErrors<TipoManutencaoField>(details.fieldErrors));
      }
      toast.error(details.message);
    }
  };

  const handleUpdatePeca = async () => {
    if (!editingPecaId) return;
    const validationError = validatePecaForm(editPecaForm);
    if (hasValidationErrors(validationError)) {
      setEditPecaErrors(validationError);
      return toast.error(getFirstInlineError(validationError) ?? getValidationMessages(validationError)[0]);
    }

    try {
      await updatePeca.mutateAsync({
        id: editingPecaId,
        data: {
          nome: editPecaForm.nome.trim(),
          descricao: editPecaForm.descricao.trim() || undefined,
        },
      });
      toast.success("Peça atualizada com sucesso!");
      setEditPecaForm(defaultPecaForm);
      setEditPecaErrors({});
      setEditPecaOpen(false);
      setEditingPecaId(null);
      pecas.refetch();
    } catch (error) {
      logClientError("Erro ao atualizar peça", error);
      const details = getErrorDetails(error, "Erro ao atualizar peça");
      if (Object.keys(details.fieldErrors).length > 0) {
        setEditPecaErrors(mapFieldErrors<PecaField>(details.fieldErrors));
      }
      toast.error(details.message);
    }
  };

  const handleDelete = async (type: "locador" | "locatario" | "veiculo" | "peca" | "tipoManutencao", id: number) => {
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
      if (type === "peca") {
        await deletePeca.mutateAsync({ id });
        pecas.refetch();
      }
      if (type === "tipoManutencao") {
        await deleteTipoManutencao.mutateAsync({ id });
        tiposManutencao.refetch();
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

  const filteredVeiculos = ((veiculos.data || []) as VeiculoRecord[]).filter((item) => {
    const term = veiculoSearchTerm.trim().toLowerCase();
    if (!term) return true;
    return [item.marca, item.modelo, item.placa, item.renavam]
      .filter((value): value is string => Boolean(value))
      .some((value) => value.toLowerCase().includes(term));
  });

  const filteredPecas = ((pecas.data || []) as PecaRecord[]).filter((item) => {
    const term = pecaSearchTerm.trim().toLowerCase();
    if (!term) return true;
    return [item.nome, item.descricao]
      .filter((value): value is string => Boolean(value))
      .some((value) => value.toLowerCase().includes(term));
  });

  const filteredTiposManutencao = ((tiposManutencao.data || []) as TipoManutencaoRecord[]).filter((item) => {
    const term = tipoManutencaoSearchTerm.trim().toLowerCase();
    if (!term) return true;
    return item.nome.toLowerCase().includes(term);
  });

  const locadoresCount = (locadores.data || []).length;
  const locatariosCount = (locatarios.data || []).length;
  const veiculosCount = (veiculos.data || []).length;
  const pecasCount = (pecas.data || []).length;
  const tiposManutencaoCount = (tiposManutencao.data || []).length;
  const activeTabLabel =
    activeTab === "locadores"
      ? "Locadores"
      : activeTab === "locatarios"
        ? "Locatários"
        : activeTab === "veiculos"
          ? "Veículos"
          : activeTab === "pecas"
            ? "Peças"
            : "Tipos de manutenção";
  const importStatusLabel = cadastroImport.isAnyImporting
    ? "Importação em andamento"
    : cadastroImport.backendAvailable === false
      ? "OCR local ativo"
      : "Leitura assistida disponível";

  return (
    <DashboardLayout>
      <div className="cadastros-page-shell">
        <section className="cadastros-page-header">
          <div className="cadastros-page-header__content">
            <div className="cadastros-page-header__main">
              <div className="cadastros-page-header__eyebrow">Base da operação</div>
              <h1 className="cadastros-page-header__title">Cadastros centrais</h1>
              <p className="cadastros-page-header__subtitle">
                Organize pessoas, veículos e catálogos operacionais em uma visão única, com leitura mais clara e ações mais rápidas.
              </p>

              <div className="cadastros-page-header__stats" aria-label="Resumo dos cadastros">
                <article className="cadastros-page-header__stat">
                  <span className="cadastros-page-header__stat-value">{locadoresCount}</span>
                  <span className="cadastros-page-header__stat-label">Locadores</span>
                </article>
                <article className="cadastros-page-header__stat">
                  <span className="cadastros-page-header__stat-value">{locatariosCount}</span>
                  <span className="cadastros-page-header__stat-label">Locatários</span>
                </article>
                <article className="cadastros-page-header__stat">
                  <span className="cadastros-page-header__stat-value">{veiculosCount}</span>
                  <span className="cadastros-page-header__stat-label">Veículos</span>
                </article>
                <article className="cadastros-page-header__stat">
                  <span className="cadastros-page-header__stat-value">{pecasCount}</span>
                  <span className="cadastros-page-header__stat-label">Peças</span>
                </article>
                <article className="cadastros-page-header__stat">
                  <span className="cadastros-page-header__stat-value">{tiposManutencaoCount}</span>
                  <span className="cadastros-page-header__stat-label">Tipos</span>
                </article>
              </div>
            </div>

            <aside className="cadastros-page-header__aside">
              <div className="cadastros-page-header__aside-card">
                <span className="cadastros-page-header__aside-label">Área ativa</span>
                <strong className="cadastros-page-header__aside-value">{activeTabLabel}</strong>
                <p className="cadastros-page-header__aside-text">
                  Acompanhe a área em foco e mantenha o fluxo de cadastro mais direto.
                </p>
                <div className="cadastros-page-header__aside-status">
                  <span className="cadastros-page-header__aside-status-dot" aria-hidden="true" />
                  <span>{importStatusLabel}</span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {cadastroImport.backendAvailable === false ? (
          <Alert className="cadastros-page-notice">
            <AlertDescription>
              O serviço avançado de leitura não está disponível no momento. A importação continuará usando OCR local no navegador.
            </AlertDescription>
          </Alert>
        ) : null}

        {cadastroImport.isAnyImporting ? (
          <Alert className="cadastros-page-notice">
            <AlertDescription>Processando documento e preparando os campos para revisão.</AlertDescription>
          </Alert>
        ) : null}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="cadastros-tabs-root">
          <div className="cadastros-tabs-shell -mx-1 overflow-x-auto px-1 pb-1">
            <TabsList className="cadastros-tabs-list min-w-[820px]">
              <TabsTrigger value="locadores">Locadores</TabsTrigger>
              <TabsTrigger value="locatarios">Locatários</TabsTrigger>
              <TabsTrigger value="veiculos">Veículos</TabsTrigger>
              <TabsTrigger value="pecas">Peças</TabsTrigger>
              <TabsTrigger value="tiposManutencao">Tipos de manutenção</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="locadores" className="cadastros-tab-panel">
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
              loadErrorMessage={locadoresLoadError}
              isSubmitting={createLocador.isPending}
              onCreate={handleCreateLocador}
              onEdit={openEditLocador}
              onDelete={(id) => handleDelete("locador", id)}
              locadorImport={{
                fileName: cadastroImport.importedFiles.locador,
                isImporting: cadastroImport.isImporting.locador,
                onImportClick: () => cadastroImport.openImportPicker("locador"),
              }}
            />
          </TabsContent>

          <TabsContent value="locatarios" className="cadastros-tab-panel">
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
              loadErrorMessage={locatariosLoadError}
              isSubmitting={createLocatario.isPending}
              onCreate={handleCreateLocatario}
              onEdit={openEditLocatario}
              onDelete={(id) => handleDelete("locatario", id)}
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
          </TabsContent>

          <TabsContent value="veiculos" className="cadastros-tab-panel">
            <VeiculosTab
              open={openVeiculo}
              onOpenChange={handleVeiculoOpenChange}
              form={veiculoForm}
              errors={veiculoErrors}
              onFormChange={handleVeiculoFormChange}
              editOpen={editVeiculoOpen}
              onEditOpenChange={handleEditVeiculoOpenChange}
              editForm={editVeiculoForm}
              editErrors={editVeiculoErrors}
              onEditFormChange={handleEditVeiculoFormChange}
              items={filteredVeiculos}
              isLoading={veiculos.isLoading}
              loadErrorMessage={veiculosLoadError}
              isSubmitting={createVeiculo.isPending}
              onCreate={handleCreateVeiculo}
              isUpdating={updateVeiculo.isPending}
              onEdit={openEditVeiculo}
              onUpdate={handleUpdateVeiculo}
              onDelete={(id) => handleDelete("veiculo", id)}
              searchTerm={veiculoSearchTerm}
              onSearchTermChange={setVeiculoSearchTerm}
              crlvImport={{
                fileName: cadastroImport.importedFiles.crlv,
                isImporting: cadastroImport.isImporting.crlv,
                onImportClick: () => cadastroImport.openImportPicker("crlv"),
              }}
            />
          </TabsContent>

          <TabsContent value="tiposManutencao" className="cadastros-tab-panel">
            <TiposManutencaoTab
              open={openTipoManutencao}
              onOpenChange={handleTipoManutencaoOpenChange}
              form={tipoManutencaoForm}
              errors={tipoManutencaoErrors}
              onFormChange={handleTipoManutencaoFormChange}
              searchTerm={tipoManutencaoSearchTerm}
              onSearchTermChange={setTipoManutencaoSearchTerm}
              editOpen={editTipoManutencaoOpen}
              onEditOpenChange={handleEditTipoManutencaoOpenChange}
              editForm={editTipoManutencaoForm}
              editErrors={editTipoManutencaoErrors}
              onEditFormChange={handleEditTipoManutencaoFormChange}
              items={filteredTiposManutencao}
              isLoading={tiposManutencao.isLoading}
              loadErrorMessage={tiposManutencaoLoadError}
              isSubmitting={createTipoManutencao.isPending}
              onCreate={handleCreateTipoManutencao}
              isUpdating={updateTipoManutencao.isPending}
              onEdit={openEditTipoManutencao}
              onUpdate={handleUpdateTipoManutencao}
              onDelete={(id) => handleDelete("tipoManutencao", id)}
            />
          </TabsContent>

          <TabsContent value="pecas" className="cadastros-tab-panel">
            <PecasTab
              open={openPeca}
              onOpenChange={handlePecaOpenChange}
              form={pecaForm}
              errors={pecaErrors}
              onFormChange={handlePecaFormChange}
              searchTerm={pecaSearchTerm}
              onSearchTermChange={setPecaSearchTerm}
              editOpen={editPecaOpen}
              onEditOpenChange={handleEditPecaOpenChange}
              editForm={editPecaForm}
              editErrors={editPecaErrors}
              onEditFormChange={handleEditPecaFormChange}
              items={filteredPecas}
              isLoading={pecas.isLoading}
              loadErrorMessage={pecasLoadError}
              isSubmitting={createPeca.isPending}
              isUpdating={updatePeca.isPending}
              onCreate={handleCreatePeca}
              onEdit={openEditPeca}
              onUpdate={handleUpdatePeca}
              onDelete={(id) => handleDelete("peca", id)}
            />
          </TabsContent>
        </Tabs>

        <CadastroImportInputs
          kinds={["locador", "cnh", "comprovante", "crlv"]}
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
