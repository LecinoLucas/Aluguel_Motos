import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../validations", () => ({
  motoDisponivel: vi.fn(),
  validarPeriodoContrato: vi.fn(),
}));

vi.mock("../motos/motos.repository", () => ({
  getMotoById: vi.fn(),
  updateMoto: vi.fn(),
}));

vi.mock("../clientes/clientes.repository", () => ({
  getClienteById: vi.fn(),
}));

vi.mock("./contratos.repository", () => ({
  createContrato: vi.fn(),
  deleteContrato: vi.fn(),
  getContratoById: vi.fn(),
  getContratosByCliente: vi.fn(),
  getContratosByMoto: vi.fn(),
  listContratos: vi.fn(),
  updateContrato: vi.fn(),
}));

import * as validations from "../../validations";
import * as clientesRepository from "../clientes/clientes.repository";
import * as motosRepository from "../motos/motos.repository";
import * as contratosRepository from "./contratos.repository";
import { createContrato, getContratoById } from "./contratos.service";

describe("contratos.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejeita criacao quando cliente nao existe", async () => {
    vi.mocked(clientesRepository.getClienteById).mockResolvedValue(undefined);

    await expect(
      createContrato({
        clienteId: 1,
        motoId: 2,
        dataInicio: new Date("2024-01-01"),
        dataFim: new Date("2024-01-10"),
        valorDiario: 120,
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND", message: "Cliente não encontrado" } satisfies Partial<TRPCError>);

    expect(motosRepository.getMotoById).not.toHaveBeenCalled();
    expect(contratosRepository.createContrato).not.toHaveBeenCalled();
  });

  it("rejeita criacao quando moto nao esta disponivel", async () => {
    vi.mocked(clientesRepository.getClienteById).mockResolvedValue({ id: 1 } as never);
    vi.mocked(motosRepository.getMotoById).mockResolvedValue({ id: 2, status: "alugada" } as never);
    vi.mocked(validations.motoDisponivel).mockReturnValue(false);

    await expect(
      createContrato({
        clienteId: 1,
        motoId: 2,
        dataInicio: new Date("2024-01-01"),
        dataFim: new Date("2024-01-10"),
        valorDiario: 120,
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

    vi.mocked(clientesRepository.getClienteById).mockResolvedValue({ id: 1 } as never);
    vi.mocked(motosRepository.getMotoById).mockResolvedValue({ id: 2, status: "disponivel" } as never);
    vi.mocked(validations.motoDisponivel).mockReturnValue(true);
    vi.mocked(validations.validarPeriodoContrato).mockReturnValue(true);

    await expect(
      createContrato({
        clienteId: 1,
        motoId: 2,
        dataInicio,
        dataFim,
        valorDiario: 199.9,
      }),
    ).resolves.toEqual({ success: true });

    expect(contratosRepository.createContrato).toHaveBeenCalledWith({
      clienteId: 1,
      motoId: 2,
      dataInicio,
      dataFim,
      valorDiario: "199.9",
      status: "ativo",
    });
    expect(motosRepository.updateMoto).toHaveBeenCalledWith(2, { status: "alugada" });
  });

  it("retorna erro quando contrato nao existe", async () => {
    vi.mocked(contratosRepository.getContratoById).mockResolvedValue(undefined);

    await expect(getContratoById(99)).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Contrato não encontrado",
    } satisfies Partial<TRPCError>);
  });
});