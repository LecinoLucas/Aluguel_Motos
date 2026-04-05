import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import type { ContratoProximoVencimentoItem, PagamentoAtrasadoItem } from "@/lib/trpc-types";
import { ArrowDownCircle, ArrowUpCircle, AlertCircle, CheckCircle2, Landmark, Wallet, Zap } from "lucide-react";
import { AlertListCard } from "@/features/dashboard/components/AlertListCard";
import { DashboardMetricCard } from "@/features/dashboard/components/DashboardMetricCard";
import { ExpenseBreakdownCard } from "@/features/dashboard/components/ExpenseBreakdownCard";
import { FinancialFlowChartCard } from "@/features/dashboard/components/FinancialFlowChartCard";
import { ProfitabilityByMotoCard } from "@/features/dashboard/components/ProfitabilityByMotoCard";
import { formatCurrencyBR, formatDateBR, formatPercent } from "@/features/dashboard/utils";
import "@/features/dashboard/dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const metricas = trpc.dashboard.metricas.useQuery();
  const fluxoMensal = trpc.dashboard.fluxoMensal.useQuery();
  const despesasPorOrigem = trpc.dashboard.despesasPorOrigem.useQuery();
  const rentabilidadePorMoto = trpc.dashboard.rentabilidadePorMoto.useQuery();
  const contratosProximos = trpc.dashboard.contratosProximosVencimento.useQuery();
  const pagamentosAtrasados = trpc.dashboard.pagamentosAtrasados.useQuery();
  const contasPagarAtrasadas = trpc.dashboard.contasPagarAtrasadas.useQuery();

  if (!user) return null;

  const today = new Date();
  const greetingName = user?.name?.split(" ")[0] ?? "Administrador";
  const motosDisponiveis = metricas.data?.motosDisponiveis || 0;
  const contratosAtivos = metricas.data?.contratosAtivos || 0;
  const recebimentosPendentes = metricas.data?.pagamentosPendentes || 0;
  const contasPagarPendentes = metricas.data?.contasPagarPendentes || 0;
  const receitaTotal = metricas.data?.receitaTotal || 0;
  const despesaTotal = metricas.data?.despesaTotal || 0;
  const lucroReal = metricas.data?.lucroReal || 0;
  const receberEmAberto = metricas.data?.receberEmAberto || 0;
  const pagarEmAberto = metricas.data?.pagarEmAberto || 0;
  const saldoProjetado = metricas.data?.saldoProjetado || 0;
  const margemReal = metricas.data?.margemReal || 0;

  return (
    <DashboardLayout>
      <div className="dashboard-shell">
        <div className="dashboard-hero">
          <div className="dashboard-hero__content">
            <div className="dashboard-hero__main">
              <div className="dashboard-hero__eyebrow">Operação central</div>
              <h1 className="dashboard-hero__title">Dashboard</h1>
              <p className="dashboard-hero__subtitle">
                Bem-vindo, {greetingName}. Aqui você acompanha a saúde da frota, o resultado financeiro e os pontos de atenção
                que impactam o lucro do aluguel em um só lugar.
              </p>
              <div className="dashboard-hero__meta">
                <span>Hoje: {formatDateBR(today)}</span>
                <span>•</span>
                <span>Visão geral da operação</span>
              </div>

              <div className="dashboard-hero__stats">
                <article className="dashboard-hero__stat">
                  <span className="dashboard-hero__stat-value">{motosDisponiveis}</span>
                  <span className="dashboard-hero__stat-label">Motos prontas</span>
                </article>
                <article className="dashboard-hero__stat">
                  <span className="dashboard-hero__stat-value">{contratosAtivos}</span>
                  <span className="dashboard-hero__stat-label">Contratos ativos</span>
                </article>
                <article className="dashboard-hero__stat">
                  <span className="dashboard-hero__stat-value">{formatCurrencyBR(receberEmAberto)}</span>
                  <span className="dashboard-hero__stat-label">A receber</span>
                </article>
                <article className="dashboard-hero__stat">
                  <span className="dashboard-hero__stat-value">{formatCurrencyBR(pagarEmAberto)}</span>
                  <span className="dashboard-hero__stat-label">A pagar</span>
                </article>
              </div>
            </div>

            <aside className="dashboard-hero__aside">
              <div className="dashboard-hero__spotlight">
                <span className="dashboard-hero__spotlight-label">Resumo rápido</span>
                <strong className="dashboard-hero__spotlight-value">{formatCurrencyBR(lucroReal)}</strong>
                <p className="dashboard-hero__spotlight-text">
                  Lucro realizado com base no que já foi recebido menos o que já foi pago na operação.
                </p>
                <div className="dashboard-hero__spotlight-status">
                  <span className="dashboard-hero__spotlight-dot" aria-hidden="true" />
                  <span>{saldoProjetado >= 0 ? "Caixa projetado positivo" : "Despesas pressionando o caixa"}</span>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <div className="dashboard-metrics-grid">
          <DashboardMetricCard
            title="Motos Disponíveis"
            value={motosDisponiveis}
            description="Prontas para aluguel"
            icon={Zap}
            accentClassName="border-l-[color:var(--app-highlight)] text-[color:var(--app-highlight)]"
            isLoading={metricas.isLoading}
          />
          <DashboardMetricCard
            title="Contratos Ativos"
            value={contratosAtivos}
            description="Em andamento"
            icon={CheckCircle2}
            accentClassName="border-l-[color:var(--app-accent)] text-[color:var(--app-accent)]"
            isLoading={metricas.isLoading}
          />
          <DashboardMetricCard
            title="Receita Recebida"
            value={formatCurrencyBR(receitaTotal)}
            description="Entradas já pagas"
            icon={ArrowUpCircle}
            accentClassName="border-l-[color:var(--app-highlight)] text-[color:var(--app-highlight)]"
            isLoading={metricas.isLoading}
          />
          <DashboardMetricCard
            title="Despesa Paga"
            value={formatCurrencyBR(despesaTotal)}
            description="Saídas já pagas"
            icon={ArrowDownCircle}
            accentClassName="border-l-amber-400 text-amber-500 dark:border-l-amber-300 dark:text-amber-300"
            isLoading={metricas.isLoading}
          />
          <DashboardMetricCard
            title="Lucro Real"
            value={formatCurrencyBR(lucroReal)}
            description={`Margem ${formatPercent(margemReal)}`}
            icon={Wallet}
            accentClassName="border-l-blue-500 text-blue-500 dark:border-l-blue-300 dark:text-blue-300"
            isLoading={metricas.isLoading}
          />
          <DashboardMetricCard
            title="Saldo Projetado"
            value={formatCurrencyBR(saldoProjetado)}
            description="A receber menos a pagar"
            icon={Landmark}
            accentClassName="border-l-fuchsia-500 text-fuchsia-500 dark:border-l-fuchsia-300 dark:text-fuchsia-300"
            isLoading={metricas.isLoading}
          />
          <DashboardMetricCard
            title="Recebimentos Pendentes"
            value={recebimentosPendentes}
            description="Cobranças em aberto"
            icon={AlertCircle}
            accentClassName="border-l-emerald-500 text-emerald-500 dark:border-l-emerald-300 dark:text-emerald-300"
            isLoading={metricas.isLoading}
          />
          <DashboardMetricCard
            title="Contas a Pagar"
            value={contasPagarPendentes}
            description="Despesas em aberto"
            icon={AlertCircle}
            accentClassName="border-l-rose-500 text-rose-500 dark:border-l-rose-300 dark:text-rose-300"
            isLoading={metricas.isLoading}
          />
        </div>

        <div className="dashboard-content-grid">
          <FinancialFlowChartCard isLoading={fluxoMensal.isLoading} chartData={fluxoMensal.data ?? []} />

          <div className="dashboard-alerts-stack">
            <AlertListCard<ContratoProximoVencimentoItem>
              title="Contratos Próximos do Vencimento"
              description="Próximos 3 dias"
              items={contratosProximos.data as ContratoProximoVencimentoItem[] | undefined}
              isLoading={contratosProximos.isLoading}
              emptyMessage="Nenhum contrato próximo do vencimento"
              itemToneClassName="border-amber-200/70 bg-amber-50/80 dark:border-amber-400/25 dark:bg-amber-500/10"
              renderItem={(contrato) => ({
                title: `Contrato #${contrato.id}`,
                subtitle: `Vencimento: ${formatDateBR(contrato.dataFim)}`,
              })}
            />

            <AlertListCard<PagamentoAtrasadoItem>
              title="Recebimentos Atrasados"
              description="Cobranças vencidas"
              items={pagamentosAtrasados.data as PagamentoAtrasadoItem[] | undefined}
              isLoading={pagamentosAtrasados.isLoading}
              emptyMessage="Nenhum pagamento atrasado"
              itemToneClassName="border-rose-200/70 bg-rose-50/80 dark:border-rose-400/25 dark:bg-rose-500/10"
              renderItem={(pagamento) => ({
                title: `Pagamento #${pagamento.id}`,
                subtitle: `${formatCurrencyBR(parseFloat(pagamento.valor))} - Vencido em ${formatDateBR(pagamento.data)}`,
              })}
            />

            <AlertListCard<PagamentoAtrasadoItem>
              title="Despesas Atrasadas"
              description="Contas a pagar vencidas"
              items={contasPagarAtrasadas.data as PagamentoAtrasadoItem[] | undefined}
              isLoading={contasPagarAtrasadas.isLoading}
              emptyMessage="Nenhuma despesa atrasada"
              itemToneClassName="border-orange-200/70 bg-orange-50/80 dark:border-orange-400/25 dark:bg-orange-500/10"
              renderItem={(pagamento) => ({
                title: `Despesa #${pagamento.id}`,
                subtitle: `${formatCurrencyBR(parseFloat(pagamento.valor))} - Vencida em ${formatDateBR(pagamento.data)}`,
              })}
            />
          </div>
        </div>

        <ExpenseBreakdownCard isLoading={despesasPorOrigem.isLoading} items={despesasPorOrigem.data ?? []} />

        <ProfitabilityByMotoCard isLoading={rentabilidadePorMoto.isLoading} items={rentabilidadePorMoto.data ?? []} />
      </div>
    </DashboardLayout>
  );
}
