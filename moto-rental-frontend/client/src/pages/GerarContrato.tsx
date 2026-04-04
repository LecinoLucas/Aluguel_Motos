import { useEffect, useRef, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { ClienteListItem, LocadorListItem, MotoListItem } from "@/lib/trpc-types";
import "@/features/gerar-contrato/gerar-contrato.css";
import { gerarContratoHTML } from "@/features/gerar-contrato/contract-html";
import { ContratoPageHeader } from "@/features/gerar-contrato/components/ContratoPageHeader";
import { FormularioContratoTab } from "@/features/gerar-contrato/components/FormularioContratoTab";
import { HistoricoContratosTab } from "@/features/gerar-contrato/components/HistoricoContratosTab";
import { ImportReviewDialog } from "@/features/gerar-contrato/components/ImportReviewDialog";
import { TermosContratoTab } from "@/features/gerar-contrato/components/TermosContratoTab";
import { useContratoDocumentImport } from "@/features/gerar-contrato/hooks/useContratoDocumentImport";
import {
  defaultLocatario,
  defaultTermos,
  defaultVeiculo,
  type ContratoHistoryItem,
  type ContratoTermos,
  type ExtractedDocumentFields,
  type ImportKind,
  type LocadorData,
  type LocatarioData,
  type VeiculoData,
} from "@/features/gerar-contrato/types";
import {
  createContratoHistoryItem,
  loadContratoHistory,
  loadStoredLocador,
  persistContratoHistory,
  persistLocador,
  prependContratoHistory,
} from "@/features/gerar-contrato/storage";
import { formatVehicleYear, mergeDefined } from "@/features/gerar-contrato/utils";

export default function GerarContrato() {
  const [activeTab, setActiveTab] = useState("formulario");
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const locadorInputRef = useRef<HTMLInputElement>(null);
  const cnhInputRef = useRef<HTMLInputElement>(null);
  const comprovanteInputRef = useRef<HTMLInputElement>(null);
  const crlvInputRef = useRef<HTMLInputElement>(null);

  const [locador, setLocador] = useState<LocadorData>(loadStoredLocador);
  const [locatario, setLocatario] = useState<LocatarioData>(defaultLocatario);
  const [veiculo, setVeiculo] = useState<VeiculoData>(defaultVeiculo);
  const [termos, setTermos] = useState<ContratoTermos>(defaultTermos);
  const [historicoContratos, setHistoricoContratos] = useState<ContratoHistoryItem[]>(loadContratoHistory);
  const [locadorSelecionado, setLocadorSelecionado] = useState<string>("manual");
  const [locatarioSelecionado, setLocatarioSelecionado] = useState<string>("manual");
  const [motoSelecionada, setMotoSelecionada] = useState<string>("manual");

  const motos = trpc.motos.list.useQuery({});
  const locatarios = trpc.clientes.list.useQuery();
  const locadores = trpc.locadores.list.useQuery();
  const backendAvailability = trpc.documentos.available.useQuery(undefined, {
    retry: false,
    staleTime: Infinity,
  });
  const extractDocument = trpc.documentos.extrair.useMutation();

  useEffect(() => {
    persistLocador(locador);
  }, [locador]);

  useEffect(() => {
    persistContratoHistory(historicoContratos);
  }, [historicoContratos]);

  const handleSelectMoto = (value: string) => {
    setMotoSelecionada(value);
    if (value === "manual") {
      setVeiculo(defaultVeiculo);
      return;
    }

    const moto = (motos.data as MotoListItem[] | undefined)?.find((item) => item.id.toString() === value);
    if (!moto) return;

    setVeiculo({
      marca: moto.marca || "",
      modelo: moto.modelo || "",
      ano: formatVehicleYear(moto.ano, moto.anoModelo),
      cor: moto.cor || "",
      placa: moto.placa || "",
      chassi: moto.chassi || "",
      renavam: moto.renavam || "",
    });
  };

  const handleSelectLocador = (value: string) => {
    setLocadorSelecionado(value);
    if (value === "manual") {
      return;
    }

    const selected = (locadores.data as LocadorListItem[] | undefined)?.find((item) => item.id.toString() === value);
    if (!selected) return;

    setLocador((prev) => ({
      ...prev,
      nome: selected.nome || "",
      cpf: selected.cpf || "",
      rg: selected.rg || "",
      orgaoEmissor: selected.orgaoEmissor || "",
      nacionalidade: selected.nacionalidade || prev.nacionalidade,
      estadoCivil: selected.estadoCivil || prev.estadoCivil,
      endereco: selected.endereco || "",
      cidade: selected.cidade || "",
      estado: selected.estado || "",
      cep: selected.cep || "",
      telefone: selected.telefone || "",
    }));
  };

  const handleSelectLocatario = (value: string) => {
    setLocatarioSelecionado(value);
    if (value === "manual") {
      return;
    }

    const selected = (locatarios.data as ClienteListItem[] | undefined)?.find((item) => item.id.toString() === value);
    if (!selected) return;

    setLocatario((prev) => ({
      ...prev,
      nome: selected.nome || "",
      cpf: selected.cpf || "",
      cnh: selected.cnh || "",
      rg: selected.rg || "",
      orgaoEmissor: selected.orgaoEmissor || "",
      nacionalidade: selected.nacionalidade || prev.nacionalidade,
      estadoCivil: selected.estadoCivil || prev.estadoCivil,
      endereco: selected.endereco || "",
      cidade: selected.cidade || "",
      estado: selected.estado || "",
      cep: selected.cep || "",
      telefone: selected.telefone || "",
    }));
  };

  const updateLocador = (field: keyof LocadorData, value: string) => {
    setLocador((prev) => ({ ...prev, [field]: value }));
  };

  const updateLocatario = (field: keyof LocatarioData, value: string) => {
    setLocatario((prev) => ({ ...prev, [field]: value }));
  };

  const updateVeiculo = (field: keyof VeiculoData, value: string) => {
    setVeiculo((prev) => ({ ...prev, [field]: value }));
  };

  const updateTermos = (field: keyof ContratoTermos, value: string) => {
    setTermos((prev) => ({ ...prev, [field]: value }));
  };

  const applyImportedFields = (kind: ImportKind, fields: Partial<ExtractedDocumentFields>) => {
    if (kind === "locador") {
      setLocador((prev) =>
        mergeDefined(prev, {
          nome: fields.nome || prev.nome || "",
          cpf: prev.cpf || fields.cpf || "",
          rg: prev.rg || fields.rg || "",
          orgaoEmissor: fields.orgaoEmissor || "",
          endereco: fields.endereco || "",
          cidade: fields.cidade || "",
          estado: fields.estado || "",
          cep: fields.cep || "",
          telefone: fields.telefone || "",
        }),
      );
      setLocadorSelecionado("manual");
      return;
    }

    if (kind === "cnh") {
      setLocatario((prev) =>
        mergeDefined(prev, {
          nome: fields.nome || "",
          cpf: fields.cpf || "",
          rg: fields.rg || "",
          orgaoEmissor: fields.orgaoEmissor || "",
          estado: fields.estado || "",
          telefone: fields.telefone || "",
          cnh: fields.cnh || "",
        }),
      );
      setLocatarioSelecionado("manual");
      return;
    }

    if (kind === "comprovante") {
      setLocatario((prev) =>
        mergeDefined(prev, {
          nome: prev.nome || fields.nome || "",
          cpf: prev.cpf || fields.cpf || "",
          endereco: fields.endereco || "",
          cidade: fields.cidade || "",
          estado: fields.estado || "",
          cep: fields.cep || "",
          telefone: prev.telefone || fields.telefone || "",
        }),
      );
      setLocatarioSelecionado("manual");
      return;
    }

    setMotoSelecionada("manual");
    setVeiculo((prev) =>
      mergeDefined(prev, {
        marca: fields.marca || "",
        modelo: fields.modelo || "",
        ano: fields.ano || "",
        cor: fields.cor || "",
        placa: fields.placa || "",
        chassi: fields.chassi || "",
        renavam: fields.renavam || "",
      }),
    );
  };

  const {
    importedFiles,
    importPreviewEntries,
    isAnyImporting,
    isImporting,
    pendingImportReview,
    cancelImportReview,
    confirmImportReview,
    handleFileChange,
    updatePendingImportField,
  } = useContratoDocumentImport({
    backendAvailable: backendAvailability.data?.available,
    extractDocument: (input) => extractDocument.mutateAsync(input),
    onApplyImportedFields: applyImportedFields,
  });

  const saveContratoNoHistorico = () => {
    const novoItem = createContratoHistoryItem(locador, locatario, veiculo, termos);
    setHistoricoContratos((prev) => prependContratoHistory(prev, novoItem));
  };

  const carregarContratoDoHistorico = (item: ContratoHistoryItem) => {
    setLocador(item.locador);
    setLocatario(item.locatario);
    setVeiculo(item.veiculo);
    setTermos(item.termos);
    setLocadorSelecionado("manual");
    setLocatarioSelecionado("manual");
    setMotoSelecionada("manual");
    setActiveTab("termos");
    toast.success("Contrato carregado do histórico");
  };

  const removerContratoDoHistorico = (id: string) => {
    setHistoricoContratos((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePrint = () => {
    const html = gerarContratoHTML(locador, locatario, veiculo, termos);
    saveContratoNoHistorico();
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Contrato de Locação - ${locatario.nome || "Novo"}</title>
        <style>
          @media print {
            body { margin: 0; }
            @page { margin: 2cm; }
          }
        </style>
      </head>
      <body>${html}</body>
      </html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const openImportPicker = (kind: ImportKind) => {
    if (kind === "locador") locadorInputRef.current?.click();
    if (kind === "cnh") cnhInputRef.current?.click();
    if (kind === "comprovante") comprovanteInputRef.current?.click();
    if (kind === "crlv") crlvInputRef.current?.click();
  };

  return (
    <DashboardLayout>
      <div className="contract-page-shell">
        <ImportReviewDialog
          open={Boolean(pendingImportReview)}
          review={pendingImportReview}
          previewEntries={importPreviewEntries}
          onClose={cancelImportReview}
          onConfirm={confirmImportReview}
          onUpdateField={updatePendingImportField}
        />

        {isAnyImporting ? (
          <Alert>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            <AlertTitle>Importação em andamento</AlertTitle>
            <AlertDescription>
              Estamos enviando o documento para extração estruturada e preenchendo os campos automaticamente. Isso pode levar alguns segundos.
            </AlertDescription>
          </Alert>
        ) : null}

        {backendAvailability.data && !backendAvailability.data.available ? (
          <Alert>
            <AlertTitle>Modo OCR local ativo</AlertTitle>
            <AlertDescription>
              A extração avançada não está configurada no backend. A leitura pode ficar mais lenta e menos precisa em alguns documentos.
            </AlertDescription>
          </Alert>
        ) : null}

        <ContratoPageHeader
          showPreview={showPreview}
          onTogglePreview={() => setShowPreview((prev) => !prev)}
          onPrint={handlePrint}
        />

        <input ref={locadorInputRef} type="file" accept=".pdf,.txt,image/*" className="hidden" onChange={handleFileChange("locador")} />
        <input ref={cnhInputRef} type="file" accept=".pdf,.txt,image/*" className="hidden" onChange={handleFileChange("cnh")} />
        <input ref={comprovanteInputRef} type="file" accept=".pdf,.txt,image/*" className="hidden" onChange={handleFileChange("comprovante")} />
        <input ref={crlvInputRef} type="file" accept=".pdf,.txt,image/*" className="hidden" onChange={handleFileChange("crlv")} />

        {showPreview ? (
          <Card className="contract-preview-card">
            <CardContent className="contract-preview-body">
              <div
                ref={previewRef}
                dangerouslySetInnerHTML={{
                  __html: gerarContratoHTML(locador, locatario, veiculo, termos),
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="-mx-1 overflow-x-auto px-1 pb-1">
              <TabsList className="grid min-w-[560px] grid-cols-3">
                <TabsTrigger value="formulario">Formulário</TabsTrigger>
                <TabsTrigger value="termos">Contrato</TabsTrigger>
                <TabsTrigger value="historico">Histórico</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="formulario">
              <FormularioContratoTab
                locador={locador}
                locatario={locatario}
                veiculo={veiculo}
                locadorSelecionado={locadorSelecionado}
                locatarioSelecionado={locatarioSelecionado}
                motoSelecionada={motoSelecionada}
                locadores={locadores.data || []}
                locatarios={locatarios.data || []}
                motos={motos.data || []}
                importedFiles={importedFiles}
                isImporting={isImporting}
                onSelectLocador={handleSelectLocador}
                onSelectLocatario={handleSelectLocatario}
                onSelectMoto={handleSelectMoto}
                onUpdateLocador={updateLocador}
                onUpdateLocatario={updateLocatario}
                onUpdateVeiculo={updateVeiculo}
                onImportClick={openImportPicker}
              />
            </TabsContent>

            <TabsContent value="termos">
              <TermosContratoTab termos={termos} onUpdateTermos={updateTermos} />
            </TabsContent>

            <TabsContent value="historico">
              <HistoricoContratosTab
                historico={historicoContratos}
                onLoad={carregarContratoDoHistorico}
                onRemove={removerContratoDoHistorico}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}