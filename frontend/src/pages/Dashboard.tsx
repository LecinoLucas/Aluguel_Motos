import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import type { ContratoProximoVencimentoItem, PagamentoAtrasadoItem } from "@/lib/trpc-types";
import { TrendingUp, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import { AlertListCard } from "@/features/dashboard/components/AlertListCard";
import { DashboardMetricCard } from "@/features/dashboard/components/DashboardMetricCard";
import { RevenueChartCard } from "@/features/dashboard/components/RevenueChartCard";
import { formatCurrencyBR, formatDateBR, mapReceitaMensalChartData } from "@/features/dashboard/utils";
import "@/features/dashboard/dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const metricas = trpc.dashboard.metricas.useQuery();
  const receitaMensal = trpc.dashboard.receitaMensal.useQuery();
  const contratosProximos = trpc.dashboard.contratosProximosVencimento.useQuery();
  const pagamentosAtrasados = trpc.dashboard.pagamentosAtrasados.useQuery();

  if (!user) return null;

  const chartData = mapReceitaMensalChartData(receitaMensal.data);
  const today = new Date();
  const greetingName = user?.name?.split(" ")[0] ?? "Administrador";

  return (
    <DashboardLayout>
      <div className="dashboard-shell">
        <div className="dashboard-hero">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="dashboard-hero__eyebrow">Operação central</div>
              <h1 className="dashboard-hero__title">Dashboard</h1>
              <p className="dashboard-hero__subtitle">
                Bem-vindo, {greetingName}. Aqui você acompanha a saúde da frota, a receita e os pontos de atenção
                do aluguel em um só lugar.
              </p>
              <div className="dashboard-hero__meta">
                <span>Hoje: {formatDateBR(today)}</span>
                <span>•</span>
                <span>Visão geral da operação</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardMetricCard
            title="Motos Disponíveis"
            value={metricas.data?.motosDisponiveis || 0}
            description="Prontas para aluguel"
            icon={Zap}
            accentClassName="border-l-blue-500 text-blue-500"
            isLoading={metricas.isLoading}
          />
          <DashboardMetricCard
            title="Contratos Ativos"
            value={metricas.data?.contratosAtivos || 0}
            description="Em andamento"
            icon={CheckCircle2}
            accentClassName="border-l-green-500 text-green-500"
            isLoading={metricas.isLoading}
          />
          <DashboardMetricCard
            title="Pagamentos Pendentes"
            value={metricas.data?.pagamentosPendentes || 0}
            description="Aguardando pagamento"
            icon={AlertCircle}
            accentClassName="border-l-yellow-500 text-yellow-500"
            isLoading={metricas.isLoading}
          />
          <DashboardMetricCard
            title="Receita Total"
            value={formatCurrencyBR(metricas.data?.receitaTotal || 0)}
            description="Total recebido"
            icon={TrendingUp}
            accentClassName="border-l-teal-600 text-teal-600"
            isLoading={metricas.isLoading}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <RevenueChartCard isLoading={receitaMensal.isLoading} chartData={chartData} />

          <div className="space-y-4">
            <AlertListCard<ContratoProximoVencimentoItem>
              title="Contratos Próximos do Vencimento"
              description="Próximos 3 dias"
              items={contratosProximos.data as ContratoProximoVencimentoItem[] | undefined}
              isLoading={contratosProximos.isLoading}
              emptyMessage="Nenhum contrato próximo do vencimento"
              itemToneClassName="border-yellow-200 bg-yellow-50"
              renderItem={(contrato) => ({
                title: `Contrato #${contrato.id}`,
                subtitle: `Vencimento: ${formatDateBR(contrato.dataFim)}`,
              })}
            />

            <AlertListCard<PagamentoAtrasadoItem>
              title="Pagamentos Atrasados"
              description="Ação necessária"
              items={pagamentosAtrasados.data as PagamentoAtrasadoItem[] | undefined}
              isLoading={pagamentosAtrasados.isLoading}
              emptyMessage="Nenhum pagamento atrasado"
              itemToneClassName="border-red-200 bg-red-50"
              renderItem={(pagamento) => ({
                title: `Pagamento #${pagamento.id}`,
                subtitle: `${formatCurrencyBR(parseFloat(pagamento.valor))} - Vencido em ${formatDateBR(pagamento.data)}`,
              })}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
