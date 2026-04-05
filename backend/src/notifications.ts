import { getDb } from "./db";
import { notifyOwner } from "./_core/notification";
import { contratos, pagamentos } from "../drizzle/schema";
import { eq, lt, and } from "drizzle-orm";

/**
 * Verifica contratos próximos do vencimento (3 dias antes)
 * e envia notificação ao proprietário
 */
export async function verificarContratosProximosVencimento() {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Notifications] Database not available");
      return;
    }

    const hoje = new Date();
    const emTresDias = new Date(hoje.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Buscar contratos que vencem em até 3 dias (mas ainda não vencidos)
    const contratosProximos = await db
      .select()
      .from(contratos)
      .where(
        and(
          eq(contratos.status, "ativo"),
          lt(contratos.dataFim, emTresDias)
        )
      );

    if (contratosProximos.length > 0) {
      const mensagem = contratosProximos
        .map(
          (c) =>
            `Contrato #${c.id}: Vencimento em ${new Date(c.dataFim).toLocaleDateString("pt-BR")}`
        )
        .join("\n");

      await notifyOwner({
        title: `⚠️ ${contratosProximos.length} Contrato(s) Próximo(s) do Vencimento`,
        content: `Os seguintes contratos vencem nos próximos 3 dias:\n\n${mensagem}`,
      });

      console.log(`[Notifications] Enviadas ${contratosProximos.length} notificações de contratos próximos do vencimento`);
    }
  } catch (error) {
    console.error("[Notifications] Erro ao verificar contratos próximos do vencimento:", error);
  }
}

/**
 * Verifica pagamentos atrasados
 * e envia notificação ao proprietário
 */
export async function verificarPagamentosAtrasados() {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Notifications] Database not available");
      return;
    }

    const hoje = new Date();

    // Buscar pagamentos atrasados (data passada e status não pago)
    const pagamentosAtrasados = await db
      .select()
      .from(pagamentos)
      .where(
        and(
          lt(pagamentos.data, hoje),
          eq(pagamentos.status, "pendente"),
          eq(pagamentos.tipo, "receber"),
        )
      );

    if (pagamentosAtrasados.length > 0) {
      const totalAtrasado = pagamentosAtrasados.reduce(
        (acc, p) => acc + parseFloat(p.valor),
        0
      );

      const mensagem = pagamentosAtrasados
        .map(
          (p) =>
            `Pagamento #${p.id}: R$ ${parseFloat(p.valor).toFixed(2)} - Vencido em ${new Date(p.data).toLocaleDateString("pt-BR")}`
        )
        .join("\n");

      await notifyOwner({
        title: `🔴 ${pagamentosAtrasados.length} Pagamento(s) Atrasado(s)`,
        content: `Total atrasado: R$ ${totalAtrasado.toFixed(2)}\n\n${mensagem}`,
      });

      console.log(`[Notifications] Enviadas ${pagamentosAtrasados.length} notificações de pagamentos atrasados`);
    }
  } catch (error) {
    console.error("[Notifications] Erro ao verificar pagamentos atrasados:", error);
  }
}

/**
 * Executa todas as verificações de notificação
 */
export async function executarVerificacoesNotificacoes() {
  console.log("[Notifications] Iniciando verificações de notificações...");
  await verificarContratosProximosVencimento();
  await verificarPagamentosAtrasados();
  console.log("[Notifications] Verificações concluídas");
}

/**
 * Agenda as verificações de notificação para rodar periodicamente
 * Executa a cada 6 horas
 */
export function agendarVerificacoesNotificacoes() {
  // Executar imediatamente na inicialização
  executarVerificacoesNotificacoes().catch((error) => {
    console.error("[Notifications] Erro na execução inicial:", error);
  });

  // Agendar para rodar a cada 6 horas
  const intervalo = 6 * 60 * 60 * 1000; // 6 horas em ms
  setInterval(() => {
    executarVerificacoesNotificacoes().catch((error) => {
      console.error("[Notifications] Erro na execução agendada:", error);
    });
  }, intervalo);

  console.log("[Notifications] Verificações agendadas para rodar a cada 6 horas");
}
