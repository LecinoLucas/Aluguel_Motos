import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../contratos/contratos.service", () => ({
  getContratoById: vi.fn(),
}));

vi.mock("../motos/motos.repository", () => ({
  getMotoById: vi.fn(),
}));

vi.mock("./multas.repository", () => ({
  createMulta: vi.fn(),
  deleteMulta: vi.fn(),
  getMultaById: vi.fn(),
  getMultasByContrato: vi.fn(),
  listMultas: vi.fn(),
  updateMulta: vi.fn(),
}));

import * as contratosService from "../contratos/contratos.service";
import * as motosRepository from "../motos/motos.repository";
import * as multasRepository from "./multas.repository";
import { createMulta, getMultaById, updateMulta } from "./multas.service";

describe("multas.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cria multa vinculada ao contrato e moto correta", async () => {
    const data = new Date("2024-06-10");
    vi.mocked(contratosService.getContratoById).mockResolvedValue({ id: 9, motoId: 5 } as never);
    vi.mocked(motosRepository.getMotoById).mockResolvedValue({ id: 5 } as never);

    await expect(
      createMulta({
        contratoId: 9,
        tipo: "multa",
        responsavel: "Joao da Silva",
        descricao: "Avanço de sinal",
        data,
        valor: 195.23,
        status: "pendente",
      }),
    ).resolves.toEqual({ success: true });

    expect(multasRepository.createMulta).toHaveBeenCalledWith({
      contratoId: 9,
      motoId: 5,
      tipo: "multa",
      responsavel: "Joao da Silva",
      descricao: "Avanço de sinal",
      data,
      valor: "195.23",
      status: "pendente",
      observacao: null,
    });
  });

  it("rejeita quando a moto informada nao corresponde ao contrato", async () => {
    vi.mocked(contratosService.getContratoById).mockResolvedValue({ id: 9, motoId: 5 } as never);

    await expect(
      createMulta({
        contratoId: 9,
        motoId: 7,
        tipo: "prejuizo",
        responsavel: "Joao da Silva",
        descricao: "Retrovisor quebrado",
        data: new Date("2024-06-11"),
        valor: 89.9,
        status: "pendente",
      }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "A moto informada não corresponde ao contrato selecionado.",
    } satisfies Partial<TRPCError>);
  });

  it("atualiza status da ocorrencia existente", async () => {
    vi.mocked(multasRepository.getMultaById).mockResolvedValue({
      id: 4,
      contratoId: 8,
      motoId: 3,
    } as never);
    vi.mocked(contratosService.getContratoById).mockResolvedValue({ id: 8, motoId: 3 } as never);
    vi.mocked(motosRepository.getMotoById).mockResolvedValue({ id: 3 } as never);

    await expect(updateMulta(4, { status: "descontado_caucao" })).resolves.toEqual({ success: true });

    expect(multasRepository.updateMulta).toHaveBeenCalledWith(
      4,
      expect.objectContaining({
        contratoId: 8,
        motoId: 3,
        status: "descontado_caucao",
      }),
    );
  });

  it("retorna erro quando ocorrencia nao existe", async () => {
    vi.mocked(multasRepository.getMultaById).mockResolvedValue(undefined);

    await expect(getMultaById(44)).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Ocorrência não encontrada",
    } satisfies Partial<TRPCError>);
  });
});
