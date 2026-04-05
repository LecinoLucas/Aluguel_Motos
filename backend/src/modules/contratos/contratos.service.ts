import { TRPCError } from "@trpc/server";
import * as validations from "../../validations";
import * as motosRepository from "../motos/motos.repository";
import * as clientesRepository from "../clientes/clientes.repository";
import * as locadoresRepository from "../locadores/locadores.repository";
import * as pagamentosRepository from "../pagamentos/pagamentos.repository";
import { buildContratoDocumentoSnapshot } from "./contrato-documento";
import * as contratosRepository from "./contratos.repository";

function addDays(date: Date, days: number) {
  const next = startOfDay(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function calcularQuantidadeSemanas(dataInicio: Date, dataFim: Date) {
  const inicio = startOfDay(dataInicio);
  const fim = startOfDay(dataFim);
  const dias = Math.max(1, Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)));
  return Math.max(1, Math.ceil(dias / 7));
}

function isContratoVencido(contrato: { dataFim: string | Date; status: string }) {
  if (contrato.status === "encerrado") return true;
  if (contrato.status === "cancelado") return false;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataFim = new Date(contrato.dataFim);
  dataFim.setHours(0, 0, 0, 0);

  return dataFim < hoje;
}

function contratoBloqueiaMoto(contrato: { dataFim: string | Date; status: string }) {
  if (contrato.status === "cancelado") return false;
  return !isContratoVencido(contrato);
}

function motoPodeReceberContrato(
  moto: { status: string; disponibilidadeManual?: string | null },
  possuiContratoBloqueando: boolean,
) {
  if (possuiContratoBloqueando) {
    return false;
  }

  if (moto.disponibilidadeManual === "indisponivel") {
    return false;
  }

  if (moto.disponibilidadeManual === "disponivel") {
    return true;
  }

  return true;
}

async function sincronizarStatusMoto(
  moto: { id: number; status: string },
  possuiContratoBloqueando?: boolean,
) {
  const bloqueadaPorContrato =
    possuiContratoBloqueando ?? (await contratosRepository.getContratosByMoto(moto.id)).some(contratoBloqueiaMoto);
  const statusAtualizado = bloqueadaPorContrato ? "alugada" : "disponivel";

  if (moto.status !== statusAtualizado) {
    await motosRepository.updateMoto(moto.id, { status: statusAtualizado });
  }

  return {
    ...moto,
    status: statusAtualizado,
  };
}

function gerarParcelasSemanais(input: {
  dataInicio: Date;
  dataFim: Date;
  valorSemanal: number;
  diasAposFim: number;
}) {
  const dataFimContrato = startOfDay(input.dataFim);
  const semanas = calcularQuantidadeSemanas(input.dataInicio, dataFimContrato);

  return Array.from({ length: semanas }, (_, index) => {
    const periodoInicio = addDays(startOfDay(input.dataInicio), index * 7);
    const periodoFimTentativo = addDays(periodoInicio, 6);
    const periodoFim = periodoFimTentativo > dataFimContrato ? dataFimContrato : periodoFimTentativo;

    return {
      valor: input.valorSemanal.toString(),
      data: addDays(periodoFim, input.diasAposFim),
      status: "pendente" as const,
    };
  });
}

async function sincronizarPagamentosSemanaisDoContrato(input: {
  contratoId: number;
  motoId: number;
  dataInicio: Date;
  dataFim: Date;
  valorSemanal: number;
  diasAposFim: number;
  status: "ativo" | "encerrado" | "cancelado";
}) {
  const pagamentos = await pagamentosRepository.getPagamentosByContrato(input.contratoId);
  const pagamentosOrdenados = [...pagamentos].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime() || a.id - b.id,
  );
  const pagamentosPagos = pagamentosOrdenados.filter((pagamento) => pagamento.status === "pago");
  const pagamentosEmAberto = pagamentosOrdenados.filter((pagamento) => pagamento.status !== "pago");
  const parcelas = input.status === "cancelado"
    ? []
    : gerarParcelasSemanais({
        dataInicio: input.dataInicio,
        dataFim: input.dataFim,
        valorSemanal: input.valorSemanal,
        diasAposFim: input.diasAposFim,
      });
  const parcelasEmAberto = parcelas.slice(pagamentosPagos.length);
  const quantidadeParaAtualizar = Math.min(pagamentosEmAberto.length, parcelasEmAberto.length);

  await Promise.all(
    pagamentosEmAberto.slice(0, quantidadeParaAtualizar).map((pagamento, index) =>
      pagamentosRepository.updatePagamento(pagamento.id, {
        contratoId: input.contratoId,
        motoId: input.motoId,
        tipo: "receber",
        origem: "contrato",
        descricao: "Cobrança semanal do contrato",
        valor: parcelasEmAberto[index].valor,
        data: parcelasEmAberto[index].data,
        status: "pendente",
      } as any),
    ),
  );

  await Promise.all(
    pagamentosEmAberto.slice(quantidadeParaAtualizar).map((pagamento) => pagamentosRepository.deletePagamento(pagamento.id)),
  );

  await Promise.all(
    parcelasEmAberto.slice(quantidadeParaAtualizar).map((parcela) =>
      pagamentosRepository.createPagamento({
        contratoId: input.contratoId,
        motoId: input.motoId,
        tipo: "receber",
        origem: "contrato",
        descricao: "Cobrança semanal do contrato",
        valor: parcela.valor,
        data: parcela.data,
        status: parcela.status,
      } as any),
    ),
  );
}

export async function createContrato(input: {
  locadorIds: number[];
  locatarioId: number;
  motoId: number;
  dataInicio: Date;
  dataFim: Date;
  valorSemanal: number;
  diasAposFim: number;
}) {
  const locadorIds = Array.from(new Set(input.locadorIds));
  const locadores = await locadoresRepository.getLocadoresByIds(locadorIds);
  if (locadores.length !== locadorIds.length) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Um ou mais locadores não foram encontrados",
    });
  }

  const locatario = await clientesRepository.getClienteById(input.locatarioId);
  if (!locatario) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Locatário não encontrado",
    });
  }

  const moto = await motosRepository.getMotoById(input.motoId);
  if (!moto) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Moto não encontrada",
    });
  }

  const contratosDaMoto = await contratosRepository.getContratosByMoto(input.motoId);
  const possuiContratoBloqueando = contratosDaMoto.some(contratoBloqueiaMoto);
  const motoSincronizada = await sincronizarStatusMoto(moto, possuiContratoBloqueando);

  if (!motoPodeReceberContrato(motoSincronizada, possuiContratoBloqueando)) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Moto não está disponível para aluguel",
    });
  }

  if (!validations.validarPeriodoContrato(input.dataInicio, input.dataFim)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Data de fim deve ser posterior à data de início",
    });
  }

  const contrato = await contratosRepository.createContrato({
    locatarioId: input.locatarioId,
    motoId: input.motoId,
    dataInicio: input.dataInicio,
    dataFim: input.dataFim,
    valorSemanal: input.valorSemanal.toString(),
    diasAposFim: input.diasAposFim,
    documentoSnapshot: buildContratoDocumentoSnapshot({
      locadores,
      locatario,
      moto,
      dataInicio: input.dataInicio,
      dataFim: input.dataFim,
      valorSemanal: input.valorSemanal,
      dataContrato: new Date(),
    }),
    status: "ativo",
  } as any);
  await contratosRepository.setContratoLocadores(contrato.id, locadorIds);

  await sincronizarPagamentosSemanaisDoContrato({
    contratoId: contrato.id,
    motoId: input.motoId,
    dataInicio: input.dataInicio,
    dataFim: input.dataFim,
    valorSemanal: input.valorSemanal,
    diasAposFim: input.diasAposFim,
    status: "ativo",
  });

  await motosRepository.updateMoto(input.motoId, { status: "alugada" });

  return { success: true, contratoId: contrato.id } as const;
}

export async function listContratos(status?: string) {
  return contratosRepository.listContratos(status);
}

export async function getContratoById(id: number) {
  const contrato = await contratosRepository.getContratoById(id);
  if (!contrato) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Contrato não encontrado",
    });
  }
  return contrato;
}

export async function updateContrato(
  id: number,
  data: {
    locadorIds?: number[];
    locatarioId?: number;
    motoId?: number;
    dataInicio?: Date;
    dataFim?: Date;
    valorSemanal?: number;
    diasAposFim?: number;
    status?: "ativo" | "encerrado" | "cancelado";
  },
) {
  const contrato = await getContratoById(id);
  const proxLocatarioId = data.locatarioId ?? contrato.locatarioId;
  const proxMotoId = data.motoId ?? contrato.motoId;
  const proxDataInicio = data.dataInicio ?? new Date(contrato.dataInicio);
  const proxDataFim = data.dataFim ?? new Date(contrato.dataFim);
  const proxValorSemanal = data.valorSemanal ?? Number(contrato.valorSemanal);
  const proxDiasAposFim = data.diasAposFim ?? contrato.diasAposFim;
  const proxStatus = (data.status ?? contrato.status) as "ativo" | "encerrado" | "cancelado";

  if (!validations.validarPeriodoContrato(proxDataInicio, proxDataFim)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Data de fim deve ser posterior à data de início",
    });
  }

  const locatario = await clientesRepository.getClienteById(proxLocatarioId);
  if (!locatario) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Locatário não encontrado",
    });
  }

  let locadorIds = contrato.locadorIds;
  if (data.locadorIds) {
    locadorIds = Array.from(new Set(data.locadorIds));
  }

  const locadores = await locadoresRepository.getLocadoresByIds(locadorIds);
  if (locadores.length !== locadorIds.length) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Um ou mais locadores não foram encontrados",
    });
  }

  const motoAtual = await motosRepository.getMotoById(contrato.motoId);
  const proximaMoto = await motosRepository.getMotoById(proxMotoId);
  if (!proximaMoto) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Moto não encontrada",
    });
  }

  const contratosDaMoto = await contratosRepository.getContratosByMoto(proxMotoId);
  const possuiContratoBloqueando = contratosDaMoto
    .filter((item) => item.id !== contrato.id)
    .some(contratoBloqueiaMoto);
  const motoSincronizada = await sincronizarStatusMoto(proximaMoto, possuiContratoBloqueando);

  if (!motoPodeReceberContrato(motoSincronizada, possuiContratoBloqueando)) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Moto não está disponível para este contrato",
    });
  }

  await contratosRepository.updateContrato(id, {
    locatarioId: proxLocatarioId,
    motoId: proxMotoId,
    dataInicio: proxDataInicio,
    dataFim: proxDataFim,
    valorSemanal: proxValorSemanal.toString(),
    diasAposFim: proxDiasAposFim,
    documentoSnapshot: buildContratoDocumentoSnapshot({
      locadores,
      locatario,
      moto: proximaMoto,
      dataInicio: proxDataInicio,
      dataFim: proxDataFim,
      valorSemanal: proxValorSemanal,
      dataContrato: contrato.createdAt ?? new Date(),
      previousSnapshot: contrato.documentoSnapshot,
    }),
    status: proxStatus,
  } as any);

  await contratosRepository.setContratoLocadores(id, locadorIds);

  await sincronizarPagamentosSemanaisDoContrato({
    contratoId: id,
    motoId: proxMotoId,
    dataInicio: proxDataInicio,
    dataFim: proxDataFim,
    valorSemanal: proxValorSemanal,
    diasAposFim: proxDiasAposFim,
    status: proxStatus,
  });

  if (motoAtual && motoAtual.id !== proxMotoId) {
    await sincronizarStatusMoto(motoAtual);
  }

  await sincronizarStatusMoto(proximaMoto);

  if (proxStatus === "cancelado" || proxStatus === "encerrado") {
    const motoAtualizada = await motosRepository.getMotoById(proxMotoId);
    if (motoAtualizada) {
      await sincronizarStatusMoto(motoAtualizada);
    }
  }

  return { success: true } as const;
}

export async function renewContrato(
  id: number,
  data: {
    locadorIds: number[];
    dataInicio: Date;
    dataFim: Date;
    valorSemanal: number;
    diasAposFim: number;
  },
) {
  const contratoAtual = await getContratoById(id);
  const locadorIds = Array.from(new Set(data.locadorIds));

  const locadores = await locadoresRepository.getLocadoresByIds(locadorIds);
  if (locadores.length !== locadorIds.length) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Um ou mais locadores não foram encontrados",
    });
  }

  if (!isContratoVencido(contratoAtual)) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "O contrato só pode ser renovado depois do vencimento.",
    });
  }

  if (contratoAtual.status === "cancelado") {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Contratos cancelados não podem ser renovados.",
    });
  }

  if (!validations.validarPeriodoContrato(data.dataInicio, data.dataFim)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Data de fim deve ser posterior à data de início",
    });
  }

  const dataFimAtual = new Date(contratoAtual.dataFim);
  dataFimAtual.setHours(0, 0, 0, 0);
  const novaDataInicio = new Date(data.dataInicio);
  novaDataInicio.setHours(0, 0, 0, 0);

  if (novaDataInicio <= dataFimAtual) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "A renovação deve começar após o fim do contrato atual.",
    });
  }

  const moto = await motosRepository.getMotoById(contratoAtual.motoId);
  if (!moto) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Moto não encontrada",
    });
  }

  const locatario = await clientesRepository.getClienteById(contratoAtual.locatarioId);
  if (!locatario) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Locatário não encontrado",
    });
  }

  const contratosDaMoto = await contratosRepository.getContratosByMoto(contratoAtual.motoId);
  const possuiContratoBloqueando = contratosDaMoto
    .filter((contrato) => contrato.id !== contratoAtual.id)
    .some(contratoBloqueiaMoto);
  const motoSincronizada = await sincronizarStatusMoto(moto, possuiContratoBloqueando);

  if (!motoPodeReceberContrato(motoSincronizada, possuiContratoBloqueando)) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "A moto não está disponível para renovação agora.",
    });
  }

  await contratosRepository.updateContrato(id, { status: "encerrado" } as any);

  const novoContrato = await contratosRepository.createContrato({
    locatarioId: contratoAtual.locatarioId,
    motoId: contratoAtual.motoId,
    dataInicio: data.dataInicio,
    dataFim: data.dataFim,
    valorSemanal: data.valorSemanal.toString(),
    diasAposFim: data.diasAposFim,
    documentoSnapshot: buildContratoDocumentoSnapshot({
      locadores,
      locatario,
      moto,
      dataInicio: data.dataInicio,
      dataFim: data.dataFim,
      valorSemanal: data.valorSemanal,
      dataContrato: new Date(),
      previousSnapshot: contratoAtual.documentoSnapshot,
    }),
    status: "ativo",
  } as any);
  await contratosRepository.setContratoLocadores(novoContrato.id, locadorIds);

  await sincronizarPagamentosSemanaisDoContrato({
    contratoId: novoContrato.id,
    motoId: contratoAtual.motoId,
    dataInicio: data.dataInicio,
    dataFim: data.dataFim,
    valorSemanal: data.valorSemanal,
    diasAposFim: data.diasAposFim,
    status: "ativo",
  });

  await motosRepository.updateMoto(contratoAtual.motoId, { status: "alugada" });

  return { success: true, contratoId: novoContrato.id } as const;
}

export async function deleteContrato(id: number) {
  const contrato = await getContratoById(id);
  await contratosRepository.deleteContrato(id);
  const moto = await motosRepository.getMotoById(contrato.motoId);
  if (moto) {
    await sincronizarStatusMoto(moto);
  }
  return { success: true } as const;
}

export async function getContratosByLocatario(locatarioId: number) {
  return contratosRepository.getContratosByLocatario(locatarioId);
}

export async function getContratosByMoto(motoId: number) {
  return contratosRepository.getContratosByMoto(motoId);
}
