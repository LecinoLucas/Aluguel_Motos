import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../motos/motos.repository", () => ({
  getMotoById: vi.fn(),
}));

vi.mock("../contratos/contratos.service", () => ({
  getContratoById: vi.fn(),
}));

vi.mock("../pagamentos/pagamentos.service", () => ({
  createPagamento: vi.fn(),
  deletePagamento: vi.fn(),
  getPagamentoByManutencaoId: vi.fn(),
  updatePagamento: vi.fn(),
}));

vi.mock("./manutencoes.repository", () => ({
  createManutencao: vi.fn(),
  deleteManutencao: vi.fn(),
  getManutencaoById: vi.fn(),
  getManutencoesByMoto: vi.fn(),
  listManutencoes: vi.fn(),
  updateManutencao: vi.fn(),
}));

import * as motosRepository from "../motos/motos.repository";
import * as contratosService from "../contratos/contratos.service";
import * as pagamentosService from "../pagamentos/pagamentos.service";
import * as manutencoesRepository from "./manutencoes.repository";
import { createManutencao, getManutencaoById } from "./manutencoes.service";

describe("manutencoes.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejeita criacao quando moto nao existe", async () => {
    vi.mocked(motosRepository.getMotoById).mockResolvedValue(undefined);

    await expect(
      createManutencao({
        motoId: 4,
        peca: "Filtro de óleo",
        tipo: "preventiva",
        data: new Date("2024-03-10"),
        custo: 320,
        kmAtual: 15200,
        intervaloDiasPrevisto: 30,
        descricao: "Troca de oleo",
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Moto não encontrada",
    } satisfies Partial<TRPCError>);

    expect(manutencoesRepository.createManutencao).not.toHaveBeenCalled();
  });

  it("cria manutencao sem alterar disponibilidade da moto", async () => {
    const data = new Date("2024-03-10");
    vi.mocked(motosRepository.getMotoById).mockResolvedValue({ id: 4, status: "disponivel" } as never);
    vi.mocked(manutencoesRepository.createManutencao).mockResolvedValue({ id: 1 } as never);
    vi.mocked(contratosService.getContratoById).mockResolvedValue({ id: 7, motoId: 4 } as never);

    await expect(
      createManutencao({
        contratoId: 7,
        motoId: 4,
        peca: "Filtro de óleo",
        tipo: "preventiva",
        data,
        custo: 320.5,
        kmAtual: 15200,
        intervaloDiasPrevisto: 30,
        descricao: "Troca de oleo",
      }),
    ).resolves.toEqual({ success: true });

    expect(manutencoesRepository.createManutencao).toHaveBeenCalledWith({
      contratoId: 7,
      motoId: 4,
      peca: "Filtro de óleo",
      tipo: "preventiva",
      data,
      custo: "320.5",
      kmAtual: 15200,
      intervaloDiasPrevisto: 30,
      descricao: "Troca de oleo",
    });
    expect(pagamentosService.createPagamento).toHaveBeenCalledWith({
      contratoId: 7,
      motoId: 4,
      manutencaoId: 1,
      tipo: "pagar",
      origem: "manutencao",
      descricao: "preventiva • Filtro de óleo • Troca de oleo",
      valor: 320.5,
      data,
      status: "pendente",
    });
  });

  it("rejeita criacao quando contrato nao pertence a moto", async () => {
    vi.mocked(contratosService.getContratoById).mockResolvedValue({ id: 10, motoId: 99 } as never);

    await expect(
      createManutencao({
        contratoId: 10,
        motoId: 4,
        peca: "Retrovisor",
        tipo: "corretiva",
        data: new Date("2024-03-10"),
        custo: 120,
        descricao: "Troca",
      }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "A moto informada não corresponde ao contrato selecionado.",
    } satisfies Partial<TRPCError>);
  });

  it("retorna erro quando manutencao nao existe", async () => {
    vi.mocked(manutencoesRepository.getManutencaoById).mockResolvedValue(undefined);

    await expect(getManutencaoById(33)).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Manutenção não encontrada",
    } satisfies Partial<TRPCError>);
  });
});
