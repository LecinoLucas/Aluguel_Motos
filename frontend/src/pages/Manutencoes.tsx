import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getErrorMessage } from "@/lib/errors";
import { trpc } from "@/lib/trpc";
import type { ContratoListItem, MotoListItem, PecaListItem, TipoManutencaoListItem } from "@/lib/trpc-types";
import { useForm, type DefaultValues, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { CreateManutencaoDialog } from "@/features/operacoes/components/CreateManutencaoDialog";
import { ManutencaoMonthlyChartCard, type ManutencaoMonthlyPoint } from "@/features/operacoes/components/ManutencaoMonthlyChartCard";
import { ManutencaoPartAverageCard, type MaintenancePartAverageRow } from "@/features/operacoes/components/ManutencaoPartAverageCard";
import { ManutencoesTable } from "@/features/operacoes/components/ManutencoesTable";
import { PageHeaderCard } from "@/features/operacoes/components/PageHeaderCard";
import { SummaryMetricCard } from "@/features/operacoes/components/SummaryMetricCard";
import type { ManutencaoRecord } from "@/features/operacoes/types";
import { formatCurrencyBR, formatDateBR } from "@/features/operacoes/utils";
import { createManutencaoSchema, type ManutencaoFormValues } from "@/features/operacoes/validation";
import "@/features/operacoes/operacoes.css";

const MAINTENANCE_SPEND_WINDOW_DAYS = 90;
const MONTH_SHORT_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

type MaintenanceInsightRow = {
  key: string;
  motoId: number;
  motoLabel: string;
  partLabel: string;
  lastDate: Date;
  previousDate?: Date;
  lastCost: number;
  kmAtual?: number | null;
  intervalDays?: number | null;
  daysBetweenChanges?: number;
  isEarly: boolean;
  occurrences: number;
};

type MaintenancePartAverageInsightRow = MaintenancePartAverageRow;

const MANUTENCAO_FORM_DEFAULT_VALUES: DefaultValues<ManutencaoFormValues> = {
  contratoId: undefined,
  motoId: undefined,
  peca: "",
  tipo: "",
  data: "",
  custo: undefined,
  kmAtual: undefined,
  intervaloDiasPrevisto: undefined,
  descricao: "",
};

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthShortLabel(date: Date) {
  return `${MONTH_SHORT_LABELS[date.getMonth()]}/${String(date.getFullYear()).slice(-2)}`;
}

function toDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}

function formatDateInputValue(value: string | Date) {
  if (typeof value === "string") {
    const normalized = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    if (normalized) return normalized;
  }

  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function diffDays(later: Date, earlier: Date) {
  const millis = later.getTime() - earlier.getTime();
  return Math.max(0, Math.floor(millis / (1000 * 60 * 60 * 24)));
}

function formatMotoLabel(moto: MotoListItem | undefined) {
  if (!moto) return "Moto";
  const name = [moto.marca, moto.modelo].filter(Boolean).join(" / ");
  return `${name || "Moto"} ${moto.placa ? `(${moto.placa})` : ""}`.trim();
}

function normalizePartLabel(item: ManutencaoRecord) {
  return (item.peca || item.tipo || "Sem peça").trim();
}

function buildMaintenanceInsights(items: ManutencaoRecord[], motos: MotoListItem[]) {
  const motoById = new Map(motos.map((moto) => [moto.id, moto]));
  const datedItems = items
    .map((item) => ({ ...item, date: toDate(item.data) }))
    .sort((left, right) => right.date.getTime() - left.date.getTime());

  const totalSpent = datedItems.reduce((acc, item) => acc + Number(item.custo || 0), 0);
  const spentLastWindow = datedItems
    .filter((item) => item.date.getTime() >= Date.now() - MAINTENANCE_SPEND_WINDOW_DAYS * 24 * 60 * 60 * 1000)
    .reduce((acc, item) => acc + Number(item.custo || 0), 0);

  const monthlySpendRows: ManutencaoMonthlyPoint[] = Array.from({ length: 12 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (11 - index));
    return {
      mes: formatMonthShortLabel(date),
      total: 0,
      count: 0,
    };
  });
  const monthlyByKey = new Map(
    monthlySpendRows.map((row, index) => [
      getMonthKey(new Date(new Date().getFullYear(), new Date().getMonth() - (11 - index), 1)),
      row,
    ]),
  );

  for (const item of datedItems) {
    const bucket = monthlyByKey.get(getMonthKey(item.date));
    if (!bucket) continue;
    bucket.total += Number(item.custo || 0);
    bucket.count += 1;
  }

  const grouped = new Map<string, Array<ManutencaoRecord & { date: Date }>>();

  for (const item of datedItems) {
    const key = `${item.motoId}:${normalizePartLabel(item).toLowerCase()}`;
    const list = grouped.get(key) ?? [];
    list.push(item);
    grouped.set(key, list);
  }

  const rows: MaintenanceInsightRow[] = Array.from(grouped.entries()).map(([key, records]) => {
    const ordered = [...records].sort((left, right) => left.date.getTime() - right.date.getTime());
    const last = ordered[ordered.length - 1];
    const previous = ordered[ordered.length - 2];
    const daysBetweenChanges = previous ? diffDays(last.date, previous.date) : undefined;
    const intervalDays = last.intervaloDiasPrevisto ?? previous?.intervaloDiasPrevisto ?? null;
    const isEarly =
      intervalDays != null && daysBetweenChanges != null ? daysBetweenChanges < intervalDays : false;

    return {
      key,
      motoId: last.motoId,
      motoLabel: formatMotoLabel(motoById.get(last.motoId)),
      partLabel: normalizePartLabel(last),
      lastDate: last.date,
      previousDate: previous?.date,
      lastCost: Number(last.custo || 0),
      kmAtual: last.kmAtual ?? null,
      intervalDays,
      daysBetweenChanges,
      isEarly,
      occurrences: ordered.length,
    };
  });

  const latestPriceRows = [...rows].sort((left, right) => right.lastDate.getTime() - left.lastDate.getTime()).slice(0, 8);
  const earlyRows = rows.filter((row) => row.isEarly);
  const avgTicket = datedItems.length > 0 ? totalSpent / datedItems.length : 0;

  const partAverageMap = new Map<
    string,
    {
      partLabel: string;
      totalSpent: number;
      occurrences: number;
      lastDate: Date;
      lastCost: number;
    }
  >();

  for (const item of datedItems) {
    const partLabel = normalizePartLabel(item);
    const key = partLabel.toLowerCase();
    const current = partAverageMap.get(key);

    if (!current) {
      partAverageMap.set(key, {
        partLabel,
        totalSpent: Number(item.custo || 0),
        occurrences: 1,
        lastDate: item.date,
        lastCost: Number(item.custo || 0),
      });
      continue;
    }

    current.totalSpent += Number(item.custo || 0);
    current.occurrences += 1;
    if (item.date.getTime() > current.lastDate.getTime()) {
      current.lastDate = item.date;
      current.lastCost = Number(item.custo || 0);
    }
  }

  const partAverageRows: MaintenancePartAverageInsightRow[] = Array.from(partAverageMap.values())
    .map((row) => ({
      ...row,
      averageCost: row.occurrences > 0 ? row.totalSpent / row.occurrences : 0,
    }))
    .sort((left, right) => right.totalSpent - left.totalSpent || right.averageCost - left.averageCost)
    .slice(0, 10);

  return {
    totalSpent,
    spentLastWindow,
    avgTicket,
    trackedParts: rows.length,
    earlyRows,
    latestPriceRows,
    monthlySpendRows,
    partAverageRows,
  };
}

export default function Manutencoes() {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingManutencao, setEditingManutencao] = useState<ManutencaoRecord | null>(null);
  const [selectedMotoId, setSelectedMotoId] = useState<string>("all");

  const manutencoes = trpc.manutencoes.list.useQuery();
  const motos = trpc.motos.list.useQuery({});
  const contratos = trpc.contratos.list.useQuery({});
  const pecas = trpc.pecas.list.useQuery();
  const tiposManutencao = trpc.tiposManutencao.list.useQuery();
  const createManutencao = trpc.manutencoes.create.useMutation();
  const updateManutencao = trpc.manutencoes.update.useMutation();
  const createPeca = trpc.pecas.create.useMutation();
  const createTipoManutencao = trpc.tiposManutencao.create.useMutation();
  const deleteManutencao = trpc.manutencoes.delete.useMutation();

  const form = useForm<ManutencaoFormValues>({
    resolver: zodResolver(createManutencaoSchema) as Resolver<ManutencaoFormValues>,
    defaultValues: MANUTENCAO_FORM_DEFAULT_VALUES,
  });

  const editForm = useForm<ManutencaoFormValues>({
    resolver: zodResolver(createManutencaoSchema) as Resolver<ManutencaoFormValues>,
    defaultValues: MANUTENCAO_FORM_DEFAULT_VALUES,
  });

  const onSubmit = async (data: ManutencaoFormValues) => {
    try {
      await createManutencao.mutateAsync({
        ...data,
        data: new Date(data.data),
      });
      toast.success("Manutenção registrada com sucesso!");
      form.reset(MANUTENCAO_FORM_DEFAULT_VALUES);
      setOpen(false);
      await manutencoes.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao registrar manutenção"));
    }
  };

  const onEditSubmit = async (data: ManutencaoFormValues) => {
    if (!editingManutencao) return;

    try {
      await updateManutencao.mutateAsync({
        id: editingManutencao.id,
        data: {
          contratoId: data.contratoId ?? null,
          motoId: data.motoId,
          peca: data.peca,
          tipo: data.tipo,
          data: new Date(data.data),
          custo: data.custo,
          kmAtual: data.kmAtual,
          intervaloDiasPrevisto: data.intervaloDiasPrevisto,
          descricao: data.descricao,
        },
      });
      toast.success("Manutenção atualizada com sucesso!");
      editForm.reset(MANUTENCAO_FORM_DEFAULT_VALUES);
      setEditingManutencao(null);
      setEditOpen(false);
      await manutencoes.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao atualizar manutenção"));
    }
  };

  const handleCreateOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset(MANUTENCAO_FORM_DEFAULT_VALUES);
    }
  };

  const handleEditOpenChange = (nextOpen: boolean) => {
    setEditOpen(nextOpen);
    if (!nextOpen) {
      editForm.reset(MANUTENCAO_FORM_DEFAULT_VALUES);
      setEditingManutencao(null);
    }
  };

  const handleEdit = (item: ManutencaoRecord) => {
    setEditingManutencao(item);
    editForm.reset({
      contratoId: item.contratoId ?? undefined,
      motoId: item.motoId,
      peca: item.peca ?? "",
      tipo: item.tipo,
      data: formatDateInputValue(item.data),
      custo: Number(item.custo),
      kmAtual: item.kmAtual ?? undefined,
      intervaloDiasPrevisto: item.intervaloDiasPrevisto ?? undefined,
      descricao: item.descricao ?? "",
    });
    setEditOpen(true);
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
  const contratoItems = (contratos.data ?? []) as ContratoListItem[];
  const motoItems = (motos.data ?? []) as MotoListItem[];
  const pecaItems = (pecas.data ?? []) as PecaListItem[];
  const tipoItems = (tiposManutencao.data ?? []) as TipoManutencaoListItem[];
  const contratoOptions = useMemo(
    () =>
      contratoItems.map((contrato) => {
        const moto = motoItems.find((item) => item.id === contrato.motoId);
        return {
          id: contrato.id,
          motoId: contrato.motoId,
          label: `${formatDateBR(contrato.dataInicio)} • ${formatMotoLabel(moto)} • CTR-${String(contrato.id).padStart(6, "0")}`,
        };
      }),
    [contratoItems, motoItems],
  );

  const filteredManutencoes = useMemo(() => {
    if (selectedMotoId === "all") return manutencaoItems;
    return manutencaoItems.filter((item) => item.motoId === Number(selectedMotoId));
  }, [manutencaoItems, selectedMotoId]);

  const filteredMotos = useMemo(() => {
    if (selectedMotoId === "all") return motoItems;
    return motoItems.filter((item) => item.id === Number(selectedMotoId));
  }, [motoItems, selectedMotoId]);

  const insights = useMemo(
    () => buildMaintenanceInsights(filteredManutencoes, filteredMotos),
    [filteredManutencoes, filteredMotos],
  );

  const scopeLabel = useMemo(() => {
    if (selectedMotoId === "all") return "Todas as motos";
    const moto = motoItems.find((item) => item.id === Number(selectedMotoId));
    return formatMotoLabel(moto);
  }, [motoItems, selectedMotoId]);

  return (
    <DashboardLayout>
      <div className="operacoes-page-shell">
        <PageHeaderCard
          title="Manutenções"
          description="Acompanhe custos, trocas de peças e manutenção precoce da frota com uma leitura mais direta da operação."
          eyebrow="Centro de manutenção"
        >
          <div className="operacoes-page-header__stats">
            <article className="operacoes-page-header__stat">
              <span className="operacoes-page-header__stat-value">{formatCurrencyBR(insights.spentLastWindow)}</span>
              <span className="operacoes-page-header__stat-label">Últimos 90 dias</span>
            </article>
            <article className="operacoes-page-header__stat">
              <span className="operacoes-page-header__stat-value">{insights.earlyRows.length}</span>
              <span className="operacoes-page-header__stat-label">Trocas precoces</span>
            </article>
            <article className="operacoes-page-header__stat">
              <span className="operacoes-page-header__stat-value">{filteredManutencoes.length}</span>
              <span className="operacoes-page-header__stat-label">Registros filtrados</span>
            </article>
          </div>

          <CreateManutencaoDialog
            open={open}
            onOpenChange={handleCreateOpenChange}
            form={form}
            trigger={
              <Button className="operacoes-primary-button w-full gap-2 sm:w-auto">
                <Plus className="h-4 w-4" />
                Registrar Manutenção
              </Button>
            }
            dialogClassName="operacoes-dialog"
            contratos={contratoOptions}
            motos={motoItems}
            pecas={pecaItems}
            tiposManutencao={tipoItems}
            isSubmitting={createManutencao.isPending}
            isCreatingPeca={createPeca.isPending}
            isCreatingTipoManutencao={createTipoManutencao.isPending}
            onSubmit={onSubmit}
            onCreatePeca={async (data) => {
              try {
                await createPeca.mutateAsync({
                  nome: data.nome,
                  descricao: data.descricao ?? "",
                });
                toast.success("Peça cadastrada com sucesso!");
                await pecas.refetch();
              } catch (error) {
                toast.error(getErrorMessage(error, "Erro ao cadastrar peça"));
                throw error;
              }
            }}
            onCreateTipoManutencao={async (data) => {
              try {
                await createTipoManutencao.mutateAsync({
                  nome: data.nome,
                  descricao: data.descricao ?? "",
                  intervaloDiasPadrao: data.intervaloDiasPadrao,
                });
                toast.success("Tipo de manutenção cadastrado com sucesso!");
                await tiposManutencao.refetch();
              } catch (error) {
                toast.error(getErrorMessage(error, "Erro ao cadastrar tipo de manutenção"));
                throw error;
              }
            }}
          />
        </PageHeaderCard>

        <CreateManutencaoDialog
          open={editOpen}
          onOpenChange={handleEditOpenChange}
          form={editForm}
          mode="edit"
          dialogClassName="operacoes-dialog"
          contratos={contratoOptions}
          motos={motoItems}
          pecas={pecaItems}
          tiposManutencao={tipoItems}
          isSubmitting={updateManutencao.isPending}
          isCreatingPeca={createPeca.isPending}
          isCreatingTipoManutencao={createTipoManutencao.isPending}
          onSubmit={onEditSubmit}
          onCreatePeca={async (data) => {
            try {
              await createPeca.mutateAsync({
                nome: data.nome,
                descricao: data.descricao ?? "",
              });
              toast.success("Peça cadastrada com sucesso!");
              await pecas.refetch();
            } catch (error) {
              toast.error(getErrorMessage(error, "Erro ao cadastrar peça"));
              throw error;
            }
          }}
          onCreateTipoManutencao={async (data) => {
            try {
              await createTipoManutencao.mutateAsync({
                nome: data.nome,
                descricao: data.descricao ?? "",
                intervaloDiasPadrao: data.intervaloDiasPadrao,
              });
              toast.success("Tipo de manutenção cadastrado com sucesso!");
              await tiposManutencao.refetch();
            } catch (error) {
              toast.error(getErrorMessage(error, "Erro ao cadastrar tipo de manutenção"));
              throw error;
            }
          }}
        />

        <Card className="operacoes-section-card operacoes-filter-card">
          <CardHeader>
            <CardTitle className="text-base">Filtro inteligente</CardTitle>
            <CardDescription>Use este filtro para analisar um veículo específico ou toda a frota.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedMotoId} onValueChange={setSelectedMotoId}>
              <SelectTrigger className="operacoes-filter-trigger w-full md:w-96">
                <SelectValue placeholder="Filtrar por moto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as motos</SelectItem>
                {motoItems.map((moto) => (
                  <SelectItem key={moto.id} value={String(moto.id)}>
                    {formatMotoLabel(moto)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <SummaryMetricCard title="Gasto total" value={formatCurrencyBR(insights.totalSpent)} />
          <SummaryMetricCard title="Gasto últimos 90 dias" value={formatCurrencyBR(insights.spentLastWindow)} />
          <SummaryMetricCard title="Ticket médio" value={formatCurrencyBR(insights.avgTicket)} />
          <SummaryMetricCard title="Peças acompanhadas" value={String(insights.trackedParts)} />
          <SummaryMetricCard title="Trocas precoces" value={String(insights.earlyRows.length)} toneClassName="text-red-600" />
        </div>

        <div className="grid gap-4 xl:grid-cols-5">
          <ManutencaoMonthlyChartCard
            isLoading={manutencoes.isLoading}
            data={insights.monthlySpendRows}
            scopeLabel={scopeLabel}
          />
          <ManutencaoPartAverageCard
            isLoading={manutencoes.isLoading}
            rows={insights.partAverageRows}
          />
        </div>

        <Card className="operacoes-section-card">
          <CardHeader>
            <CardTitle className="text-base">Últimos preços e trocas por peça</CardTitle>
            <CardDescription>Mostra a troca mais recente de cada peça, o preço pago e se o intervalo foi respeitado.</CardDescription>
          </CardHeader>
          <CardContent>
            {insights.latestPriceRows.length > 0 ? (
              <div className="operacoes-table-wrap">
                <table className="operacoes-table w-full min-w-[1100px] text-sm">
                  <thead>
                    <tr>
                      <th>Moto</th>
                      <th>Peça</th>
                      <th>Última troca</th>
                      <th>Preço</th>
                      <th>Troca anterior</th>
                      <th>Dias entre trocas</th>
                      <th>Intervalo esperado</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insights.latestPriceRows.map((row) => (
                      <tr key={row.key}>
                        <td data-label="Moto">{row.motoLabel}</td>
                        <td data-label="Peça">{row.partLabel}</td>
                        <td data-label="Última troca">{formatDateBR(row.lastDate)}</td>
                        <td data-label="Preço" className="font-medium">{formatCurrencyBR(row.lastCost)}</td>
                        <td data-label="Troca anterior">{row.previousDate ? formatDateBR(row.previousDate) : "-"}</td>
                        <td data-label="Dias entre trocas">{row.daysBetweenChanges ?? "-"}</td>
                        <td data-label="Intervalo esperado">{row.intervalDays ? `${row.intervalDays} dias` : "-"}</td>
                        <td data-label="Status">
                          <span
                            className={`operacoes-status-chip ${row.isEarly ? "operacoes-status-chip--danger" : "operacoes-status-chip--success"}`}
                          >
                            {row.isEarly ? "Precoce" : "Dentro do previsto"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="operacoes-table-empty">
                Nenhuma manutenção encontrada para este filtro.
              </div>
            )}
          </CardContent>
        </Card>

        <ManutencoesTable
          items={filteredManutencoes}
          contratos={contratoItems}
          motos={motoItems}
          isLoading={manutencoes.isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          editPending={updateManutencao.isPending}
          deletePending={deleteManutencao.isPending}
        />
      </div>
    </DashboardLayout>
  );
}
