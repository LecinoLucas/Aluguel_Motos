import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../motos/motos.repository", () => ({
  getMotoById: vi.fn(),
  updateMoto: vi.fn(),
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

  it("cria manutencao e atualiza status da moto", async () => {
    const data = new Date("2024-03-10");
    vi.mocked(motosRepository.getMotoById).mockResolvedValue({ id: 4, status: "disponivel" } as never);

    await expect(
      createManutencao({
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
      motoId: 4,
      peca: "Filtro de óleo",
      tipo: "preventiva",
      data,
      custo: "320.5",
      kmAtual: 15200,
      intervaloDiasPrevisto: 30,
      descricao: "Troca de oleo",
    });
    expect(motosRepository.updateMoto).toHaveBeenCalledWith(4, { status: "manutencao" });
  });

  it("retorna erro quando manutencao nao existe", async () => {
    vi.mocked(manutencoesRepository.getManutencaoById).mockResolvedValue(undefined);

    await expect(getManutencaoById(33)).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Manutenção não encontrada",
    } satisfies Partial<TRPCError>);
  });
});
