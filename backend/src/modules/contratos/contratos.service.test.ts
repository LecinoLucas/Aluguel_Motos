import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../validations", () => ({
  calcularValorTotal: vi.fn(),
  validarPeriodoContrato: vi.fn(),
}));

vi.mock("../motos/motos.repository", () => ({
  getMotoById: vi.fn(),
  updateMoto: vi.fn(),
}));

vi.mock("../clientes/clientes.repository", () => ({
  getClienteById: vi.fn(),
}));

vi.mock("../locadores/locadores.repository", () => ({
  getLocadoresByIds: vi.fn(),
}));

vi.mock("./contratos.repository", () => ({
  createContrato: vi.fn(),
  deleteContrato: vi.fn(),
  getContratoById: vi.fn(),
  getContratosByLocatario: vi.fn(),
  getContratosByMoto: vi.fn(),
  listContratos: vi.fn(),
  setContratoLocadores: vi.fn(),
  updateContrato: vi.fn(),
}));

vi.mock("../pagamentos/pagamentos.repository", () => ({
  createPagamento: vi.fn(),
  deletePagamento: vi.fn(),
  getPagamentosByContrato: vi.fn(),
  updatePagamento: vi.fn(),
}));

import * as validations from "../../validations";
import * as clientesRepository from "../clientes/clientes.repository";
import * as locadoresRepository from "../locadores/locadores.repository";
import * as motosRepository from "../motos/motos.repository";
import * as pagamentosRepository from "../pagamentos/pagamentos.repository";
import * as contratosRepository from "./contratos.repository";
import { createContrato, deleteContrato, getContratoById, updateContrato } from "./contratos.service";

describe("contratos.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejeita criacao quando cliente nao existe", async () => {
    vi.mocked(locadoresRepository.getLocadoresByIds).mockResolvedValue([{ id: 9 }] as never);
    vi.mocked(clientesRepository.getClienteById).mockResolvedValue(undefined);

    await expect(
      createContrato({
        locadorIds: [9],
        locatarioId: 1,
        motoId: 2,
        dataInicio: new Date("2024-01-01"),
        dataFim: new Date("2024-01-10"),
        valorSemanal: 120,
        diasAposFim: 0,
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND", message: "Locatário não encontrado" } satisfies Partial<TRPCError>);

    expect(motosRepository.getMotoById).not.toHaveBeenCalled();
    expect(contratosRepository.createContrato).not.toHaveBeenCalled();
  });

  it("rejeita criacao quando moto nao esta disponivel", async () => {
    vi.mocked(locadoresRepository.getLocadoresByIds).mockResolvedValue([{ id: 9 }] as never);
    vi.mocked(clientesRepository.getClienteById).mockResolvedValue({ id: 1 } as never);
    vi.mocked(motosRepository.getMotoById).mockResolvedValue({ id: 2, status: "alugada" } as never);
    vi.mocked(contratosRepository.getContratosByMoto).mockResolvedValue([
      { id: 10, motoId: 2, dataFim: "2999-01-10", status: "ativo" },
    ] as never);
    await expect(
      createContrato({
        locadorIds: [9],
        locatarioId: 1,
        motoId: 2,
        dataInicio: new Date("2024-01-01"),
        dataFim: new Date("2024-01-10"),
        valorSemanal: 120,
        diasAposFim: 0,
      }),
    ).rejects.toMatchObject({
      code: "CONFLICT",
      message: "Moto não está disponível para aluguel",
    } satisfies Partial<TRPCError>);

    expect(contratosRepository.createContrato).not.toHaveBeenCalled();
    expect(motosRepository.updateMoto).not.toHaveBeenCalled();
  });

  it("cria contrato e bloqueia a moto quando os dados sao validos", async () => {
    const dataInicio = new Date("2024-01-01");
    const dataFim = new Date("2024-01-10");

    vi.mocked(locadoresRepository.getLocadoresByIds).mockResolvedValue([{ id: 9 }, { id: 10 }] as never);
    vi.mocked(clientesRepository.getClienteById).mockResolvedValue({ id: 1 } as never);
    vi.mocked(motosRepository.getMotoById).mockResolvedValue({ id: 2, status: "disponivel" } as never);
    vi.mocked(contratosRepository.getContratosByMoto).mockResolvedValue([] as never);
    vi.mocked(validations.validarPeriodoContrato).mockReturnValue(true);
    vi.mocked(contratosRepository.createContrato).mockResolvedValue({ id: 77 } as never);
    vi.mocked(pagamentosRepository.getPagamentosByContrato).mockResolvedValue([] as never);

    await expect(
      createContrato({
        locadorIds: [9, 10],
        locatarioId: 1,
        motoId: 2,
        dataInicio,
        dataFim,
        valorSemanal: 199.9,
        diasAposFim: 3,
      }),
    ).resolves.toEqual({ success: true, contratoId: 77 });

    expect(contratosRepository.createContrato).toHaveBeenCalledWith(
      expect.objectContaining({
        locatarioId: 1,
        motoId: 2,
        dataInicio,
        dataFim,
        valorSemanal: "199.9",
        diasAposFim: 3,
        documentoSnapshot: expect.objectContaining({
          termos: expect.objectContaining({
            valorSemanal: "199,90",
          }),
        }),
        status: "ativo",
      }),
    );
    expect(contratosRepository.setContratoLocadores).toHaveBeenCalledWith(77, [9, 10]);
    expect(pagamentosRepository.createPagamento).toHaveBeenNthCalledWith(1, {
      contratoId: 77,
      motoId: 2,
      tipo: "receber",
      origem: "contrato",
      descricao: "Cobrança semanal do contrato",
      valor: "199.9",
      data: new Date("2024-01-10T00:00:00.000Z"),
      status: "pendente",
    });
    expect(pagamentosRepository.createPagamento).toHaveBeenNthCalledWith(2, {
      contratoId: 77,
      motoId: 2,
      tipo: "receber",
      origem: "contrato",
      descricao: "Cobrança semanal do contrato",
      valor: "199.9",
      data: new Date("2024-01-13T00:00:00.000Z"),
      status: "pendente",
    });
    expect(motosRepository.updateMoto).toHaveBeenCalledWith(2, { status: "alugada" });
  });

  it("destrava moto com status antigo antes de criar um novo contrato", async () => {
    const dataInicio = new Date("2024-02-01");
    const dataFim = new Date("2024-02-08");

    vi.mocked(locadoresRepository.getLocadoresByIds).mockResolvedValue([{ id: 9 }] as never);
    vi.mocked(clientesRepository.getClienteById).mockResolvedValue({ id: 1 } as never);
    vi.mocked(motosRepository.getMotoById).mockResolvedValue({ id: 9, status: "alugada" } as never);
    vi.mocked(contratosRepository.getContratosByMoto).mockResolvedValue([] as never);
    vi.mocked(validations.validarPeriodoContrato).mockReturnValue(true);
    vi.mocked(contratosRepository.createContrato).mockResolvedValue({ id: 88 } as never);
    vi.mocked(pagamentosRepository.getPagamentosByContrato).mockResolvedValue([] as never);

    await expect(
      createContrato({
        locadorIds: [9],
        locatarioId: 1,
        motoId: 9,
        dataInicio,
        dataFim,
        valorSemanal: 250,
        diasAposFim: 1,
      }),
    ).resolves.toEqual({ success: true, contratoId: 88 });

    expect(motosRepository.updateMoto).toHaveBeenNthCalledWith(1, 9, { status: "disponivel" });
    expect(motosRepository.updateMoto).toHaveBeenNthCalledWith(2, 9, { status: "alugada" });
  });

  it("permite contrato mesmo com status antigo de manutencao quando nao ha bloqueio manual", async () => {
    const dataInicio = new Date("2024-03-01");
    const dataFim = new Date("2024-03-10");

    vi.mocked(locadoresRepository.getLocadoresByIds).mockResolvedValue([{ id: 9 }] as never);
    vi.mocked(clientesRepository.getClienteById).mockResolvedValue({ id: 1 } as never);
    vi.mocked(motosRepository.getMotoById).mockResolvedValue({
      id: 11,
      status: "manutencao",
      disponibilidadeManual: "automatico",
    } as never);
    vi.mocked(contratosRepository.getContratosByMoto).mockResolvedValue([] as never);
    vi.mocked(validations.validarPeriodoContrato).mockReturnValue(true);
    vi.mocked(contratosRepository.createContrato).mockResolvedValue({ id: 90 } as never);
    vi.mocked(pagamentosRepository.getPagamentosByContrato).mockResolvedValue([] as never);

    await expect(
      createContrato({
        locadorIds: [9],
        locatarioId: 1,
        motoId: 11,
        dataInicio,
        dataFim,
        valorSemanal: 350,
        diasAposFim: 0,
      }),
    ).resolves.toEqual({ success: true, contratoId: 90 });
  });

  it("bloqueia contrato quando a disponibilidade manual esta travada", async () => {
    vi.mocked(locadoresRepository.getLocadoresByIds).mockResolvedValue([{ id: 9 }] as never);
    vi.mocked(clientesRepository.getClienteById).mockResolvedValue({ id: 1 } as never);
    vi.mocked(motosRepository.getMotoById).mockResolvedValue({
      id: 12,
      status: "disponivel",
      disponibilidadeManual: "indisponivel",
    } as never);
    vi.mocked(contratosRepository.getContratosByMoto).mockResolvedValue([] as never);

    await expect(
      createContrato({
        locadorIds: [9],
        locatarioId: 1,
        motoId: 12,
        dataInicio: new Date("2024-04-01"),
        dataFim: new Date("2024-04-08"),
        valorSemanal: 200,
        diasAposFim: 0,
      }),
    ).rejects.toMatchObject({
      code: "CONFLICT",
      message: "Moto não está disponível para aluguel",
    } satisfies Partial<TRPCError>);
  });

  it("rejeita criacao quando algum locador nao existe", async () => {
    vi.mocked(locadoresRepository.getLocadoresByIds).mockResolvedValue([{ id: 9 }] as never);

    await expect(
      createContrato({
        locadorIds: [9, 10],
        locatarioId: 1,
        motoId: 2,
        dataInicio: new Date("2024-04-01"),
        dataFim: new Date("2024-04-08"),
        valorSemanal: 200,
        diasAposFim: 0,
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Um ou mais locadores não foram encontrados",
    } satisfies Partial<TRPCError>);
  });

  it("libera a moto ao deletar um contrato sem outros bloqueios", async () => {
    vi.mocked(contratosRepository.getContratoById).mockResolvedValue({ id: 5, motoId: 3 } as never);
    vi.mocked(motosRepository.getMotoById).mockResolvedValue({ id: 3, status: "alugada" } as never);
    vi.mocked(contratosRepository.getContratosByMoto).mockResolvedValue([] as never);

    await expect(deleteContrato(5)).resolves.toEqual({ success: true });

    expect(contratosRepository.deleteContrato).toHaveBeenCalledWith(5);
    expect(motosRepository.updateMoto).toHaveBeenCalledWith(3, { status: "disponivel" });
  });

  it("recalcula a disponibilidade da moto ao encerrar contrato", async () => {
    vi.mocked(contratosRepository.getContratoById).mockResolvedValue({
      id: 6,
      locadorIds: [9],
      locatarioId: 2,
      motoId: 4,
      dataInicio: new Date("2024-05-01"),
      dataFim: new Date("2024-05-08"),
      valorSemanal: "250",
      diasAposFim: 0,
      status: "ativo",
      createdAt: new Date("2024-05-01"),
    } as never);
    vi.mocked(clientesRepository.getClienteById).mockResolvedValue({ id: 2 } as never);
    vi.mocked(locadoresRepository.getLocadoresByIds).mockResolvedValue([{ id: 9 }] as never);
    vi.mocked(motosRepository.getMotoById).mockResolvedValue({ id: 4, status: "alugada" } as never);
    vi.mocked(contratosRepository.getContratosByMoto).mockResolvedValue([] as never);
    vi.mocked(validations.validarPeriodoContrato).mockReturnValue(true);
    vi.mocked(pagamentosRepository.getPagamentosByContrato).mockResolvedValue([
      { id: 101, contratoId: 6, valor: "250", data: new Date("2024-05-08"), status: "pago" },
      { id: 102, contratoId: 6, valor: "250", data: new Date("2024-05-15"), status: "pendente" },
      { id: 103, contratoId: 6, valor: "250", data: new Date("2024-05-22"), status: "pendente" },
    ] as never);

    await expect(updateContrato(6, { status: "encerrado" })).resolves.toEqual({ success: true });

    expect(contratosRepository.updateContrato).toHaveBeenCalledWith(
      6,
      expect.objectContaining({ status: "encerrado" }),
    );
    expect(pagamentosRepository.updatePagamento).not.toHaveBeenCalled();
    expect(pagamentosRepository.deletePagamento).toHaveBeenCalledWith(102);
    expect(pagamentosRepository.deletePagamento).toHaveBeenCalledWith(103);
    expect(motosRepository.updateMoto).toHaveBeenCalledWith(4, { status: "disponivel" });
  });

  it("remove cobrancas semanais futuras ao encerrar antes da data final", async () => {
    vi.mocked(contratosRepository.getContratoById).mockResolvedValue({
      id: 7,
      locadorIds: [9],
      locatarioId: 2,
      motoId: 4,
      dataInicio: new Date("2024-05-01"),
      dataFim: new Date("2024-05-20"),
      valorSemanal: "250",
      diasAposFim: 0,
      status: "ativo",
      createdAt: new Date("2024-05-01"),
    } as never);
    vi.mocked(clientesRepository.getClienteById).mockResolvedValue({ id: 2 } as never);
    vi.mocked(locadoresRepository.getLocadoresByIds).mockResolvedValue([{ id: 9 }] as never);
    vi.mocked(motosRepository.getMotoById).mockResolvedValue({ id: 4, status: "alugada" } as never);
    vi.mocked(contratosRepository.getContratosByMoto).mockResolvedValue([] as never);
    vi.mocked(validations.validarPeriodoContrato).mockReturnValue(true);
    vi.mocked(pagamentosRepository.getPagamentosByContrato).mockResolvedValue([
      { id: 201, contratoId: 7, valor: "250", data: new Date("2024-05-07"), status: "pago" },
      { id: 202, contratoId: 7, valor: "250", data: new Date("2024-05-14"), status: "pendente" },
      { id: 203, contratoId: 7, valor: "250", data: new Date("2024-05-21"), status: "pendente" },
    ] as never);

    await expect(
      updateContrato(7, { status: "encerrado", dataFim: new Date("2024-05-10") }),
    ).resolves.toEqual({ success: true });

    expect(pagamentosRepository.updatePagamento).toHaveBeenCalledWith(
      202,
      expect.objectContaining({
        valor: "250",
        data: new Date("2024-05-10T00:00:00.000Z"),
        status: "pendente",
      }),
    );
    expect(pagamentosRepository.deletePagamento).toHaveBeenCalledWith(203);
  });

  it("retorna erro quando contrato nao existe", async () => {
    vi.mocked(contratosRepository.getContratoById).mockResolvedValue(undefined);

    await expect(getContratoById(99)).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Contrato não encontrado",
    } satisfies Partial<TRPCError>);
  });
});
