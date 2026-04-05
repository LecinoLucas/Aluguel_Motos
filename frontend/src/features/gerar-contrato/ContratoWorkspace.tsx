import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { ClienteListItem, LocadorListItem, MotoListItem } from "@/lib/trpc-types";
import "./gerar-contrato.css";
import { gerarContratoHTML } from "./contract-html";
import { ContratoPageHeader } from "./components/ContratoPageHeader";
import { FormularioContratoTab } from "./components/FormularioContratoTab";
import { HistoricoContratosTab } from "./components/HistoricoContratosTab";
import { TermosContratoTab } from "./components/TermosContratoTab";
import {
  defaultLocador,
  defaultLocatario,
  defaultTermos,
  defaultVeiculo,
  type ContratoHistoryItem,
  type ContratoTermos,
  type LocadorData,
  type LocatarioData,
  type VeiculoData,
} from "./types";
import {
  createContratoHistoryItem,
  loadContratoHistory,
  loadStoredLocadores,
  persistContratoHistory,
  persistLocadores,
  prependContratoHistory,
} from "./storage";
import { formatVehicleYear } from "./utils";

interface LocadorDraft {
  id: string;
  cadastroId: number | null;
  data: LocadorData;
}

export interface ContratoWorkspaceHandle {
  openPreview: () => void;
  generatePdf: () => void;
}

function createLocadorDraft(data?: Partial<LocadorData>, cadastroId: number | null = null): LocadorDraft {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    cadastroId,
    data: {
      ...defaultLocador,
      ...data,
    },
  };
}

function buildLocadorDataFromCadastro(selected: LocadorListItem): LocadorData {
  return {
    ...defaultLocador,
    nome: selected.nome || "",
    cpf: selected.cpf || "",
    rg: selected.rg || "",
    orgaoEmissor: selected.orgaoEmissor || "",
    nacionalidade: selected.nacionalidade || defaultLocador.nacionalidade,
    estadoCivil: selected.estadoCivil || defaultLocador.estadoCivil,
    endereco: selected.endereco || "",
    cidade: selected.cidade || defaultLocador.cidade,
    estado: selected.estado || defaultLocador.estado,
    cep: selected.cep || "",
    telefone: selected.telefone || "",
  };
}

export const ContratoWorkspace = forwardRef<ContratoWorkspaceHandle>(function ContratoWorkspace(_, ref) {
  const [activeTab, setActiveTab] = useState("formulario");
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const [locadoresContrato, setLocadoresContrato] = useState<LocadorDraft[]>(() =>
    loadStoredLocadores().map((locador) => createLocadorDraft(locador)),
  );
  const [locatario, setLocatario] = useState<LocatarioData>(defaultLocatario);
  const [veiculo, setVeiculo] = useState<VeiculoData>(defaultVeiculo);
  const [termos, setTermos] = useState<ContratoTermos>(defaultTermos);
  const [historicoContratos, setHistoricoContratos] = useState<ContratoHistoryItem[]>(loadContratoHistory);
  const [locatarioSelecionado, setLocatarioSelecionado] = useState<string>("manual");
  const [motoSelecionada, setMotoSelecionada] = useState<string>("manual");

  const motos = trpc.motos.list.useQuery({});
  const locatarios = trpc.clientes.list.useQuery();
  const locadores = trpc.locadores.list.useQuery();

  useEffect(() => {
    persistLocadores(locadoresContrato.map((item) => item.data));
  }, [locadoresContrato]);

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

  const handleToggleLocador = (value: string, checked: boolean) => {
    const cadastroId = Number(value);
    if (!Number.isFinite(cadastroId)) return;

    if (!checked) {
      setLocadoresContrato((prev) => prev.filter((item) => item.cadastroId !== cadastroId));
      return;
    }

    const selected = (locadores.data as LocadorListItem[] | undefined)?.find((item) => item.id === cadastroId);
    if (!selected) return;

    setLocadoresContrato((prev) => {
      if (prev.some((item) => item.cadastroId === cadastroId)) {
        return prev;
      }

      return [...prev, createLocadorDraft(buildLocadorDataFromCadastro(selected), cadastroId)];
    });
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

  const addManualLocador = () => {
    setLocadoresContrato((prev) => [...prev, createLocadorDraft()]);
  };

  const removeLocador = (draftId: string) => {
    setLocadoresContrato((prev) => {
      const next = prev.filter((item) => item.id !== draftId);
      return next.length > 0 ? next : [createLocadorDraft()];
    });
  };

  const updateLocador = (draftId: string, field: keyof LocadorData, value: string) => {
    setLocadoresContrato((prev) =>
      prev.map((item) =>
        item.id === draftId
          ? {
              ...item,
              data: {
                ...item.data,
                [field]: value,
              },
            }
          : item,
      ),
    );
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

  const saveContratoNoHistorico = () => {
    const novoItem = createContratoHistoryItem(
      locadoresContrato.map((item) => item.data),
      locatario,
      veiculo,
      termos,
    );
    setHistoricoContratos((prev) => prependContratoHistory(prev, novoItem));
  };

  const carregarContratoDoHistorico = (item: ContratoHistoryItem) => {
    setLocadoresContrato(item.locadores.map((locador) => createLocadorDraft(locador)));
    setLocatario(item.locatario);
    setVeiculo(item.veiculo);
    setTermos(item.termos);
    setLocatarioSelecionado("manual");
    setMotoSelecionada("manual");
    setActiveTab("termos");
    toast.success("Contrato carregado do histórico");
  };

  const removerContratoDoHistorico = (id: string) => {
    setHistoricoContratos((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePrint = () => {
    const html = gerarContratoHTML(
      locadoresContrato.map((item) => item.data),
      locatario,
      veiculo,
      termos,
    );
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

  useImperativeHandle(ref, () => ({
    openPreview: () => {
      setActiveTab("formulario");
      setShowPreview(true);
    },
    generatePdf: () => {
      handlePrint();
    },
  }));

  return (
    <div className="contract-page-shell">
      <ContratoPageHeader
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview((prev) => !prev)}
        onPrint={handlePrint}
      />

      {showPreview ? (
        <Card className="contract-preview-card">
          <CardContent className="contract-preview-body">
            <div
              ref={previewRef}
              dangerouslySetInnerHTML={{
                __html: gerarContratoHTML(
                  locadoresContrato.map((item) => item.data),
                  locatario,
                  veiculo,
                  termos,
                ),
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="contract-tabs-root">
          <div className="contract-tabs-shell -mx-1 overflow-x-auto px-1 pb-1">
            <TabsList className="contract-tabs-list grid min-w-[560px] grid-cols-3">
              <TabsTrigger value="formulario">Formulário</TabsTrigger>
              <TabsTrigger value="termos">Contrato</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="formulario" className="contract-tab-panel">
            <FormularioContratoTab
              locadoresContrato={locadoresContrato}
              locatario={locatario}
              veiculo={veiculo}
              locatarioSelecionado={locatarioSelecionado}
              motoSelecionada={motoSelecionada}
              selectedLocadorIds={locadoresContrato
                .filter((item) => item.cadastroId !== null)
                .map((item) => item.cadastroId!.toString())}
              locadoresDisponiveis={locadores.data || []}
              locatarios={locatarios.data || []}
              motos={motos.data || []}
              onToggleLocador={handleToggleLocador}
              onAddManualLocador={addManualLocador}
              onRemoveLocador={removeLocador}
              onSelectLocatario={handleSelectLocatario}
              onSelectMoto={handleSelectMoto}
              onUpdateLocador={updateLocador}
              onUpdateLocatario={updateLocatario}
              onUpdateVeiculo={updateVeiculo}
            />
          </TabsContent>

          <TabsContent value="termos" className="contract-tab-panel">
            <TermosContratoTab termos={termos} onUpdateTermos={updateTermos} />
          </TabsContent>

          <TabsContent value="historico" className="contract-tab-panel">
            <HistoricoContratosTab
              historico={historicoContratos}
              onLoad={carregarContratoDoHistorico}
              onRemove={removerContratoDoHistorico}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
});
