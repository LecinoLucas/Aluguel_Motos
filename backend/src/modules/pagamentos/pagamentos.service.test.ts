import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../contratos/contratos.service", () => ({
  getContratoById: vi.fn(),
}));

vi.mock("../motos/motos.repository", () => ({
  getMotoById: vi.fn(),
}));

vi.mock("./pagamentos.repository", () => ({
  createPagamento: vi.fn(),
  deletePagamento: vi.fn(),
  getPagamentoById: vi.fn(),
  getPagamentoByManutencaoId: vi.fn(),
  getPagamentosByContrato: vi.fn(),
  getPagamentosByPeriodo: vi.fn(),
  listPagamentos: vi.fn(),
  updatePagamento: vi.fn(),
}));

import * as contratosService from "../contratos/contratos.service";
import * as motosRepository from "../motos/motos.repository";
import * as pagamentosRepository from "./pagamentos.repository";
import { createPagamento, getPagamentoById, updatePagamento } from "./pagamentos.service";

describe("pagamentos.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cria pagamento apenas para contrato existente", async () => {
    const data = new Date("2024-02-01");
    vi.mocked(contratosService.getContratoById).mockResolvedValue({ id: 12, motoId: 3 } as never);
    vi.mocked(motosRepository.getMotoById).mockResolvedValue({ id: 3 } as never);

    await expect(
      createPagamento({
        contratoId: 12,
        tipo: "receber",
        valor: 450.75,
        data,
        status: "pendente",
      }),
    ).resolves.toEqual({ success: true });

    expect(contratosService.getContratoById).toHaveBeenCalledWith(12);
    expect(pagamentosRepository.createPagamento).toHaveBeenCalledWith({
      contratoId: 12,
      motoId: 3,
      manutencaoId: undefined,
      tipo: "receber",
      origem: "manual",
      descricao: null,
      valor: "450.75",
      data,
      status: "pendente",
    });
  });

  it("retorna erro quando pagamento nao existe", async () => {
    vi.mocked(pagamentosRepository.getPagamentoById).mockResolvedValue(undefined);

    await expect(getPagamentoById(7)).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Pagamento não encontrado",
    } satisfies Partial<TRPCError>);
  });

  it("atualiza pagamento existente", async () => {
    vi.mocked(pagamentosRepository.getPagamentoById).mockResolvedValue({ id: 7, contratoId: 12, motoId: 3 } as never);
    vi.mocked(contratosService.getContratoById).mockResolvedValue({ id: 12, motoId: 3 } as never);
    vi.mocked(motosRepository.getMotoById).mockResolvedValue({ id: 3 } as never);

    await expect(updatePagamento(7, { status: "pago", valor: "500.00", contratoId: 12 })).resolves.toEqual({ success: true });

    expect(pagamentosRepository.updatePagamento).toHaveBeenCalledWith(7, {
      contratoId: 12,
      motoId: 3,
      status: "pago",
      valor: "500.00",
    });
  });
});
