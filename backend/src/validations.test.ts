import { describe, it, expect } from "vitest";
import {
  validarCPF,
  validarCNH,
  motoDisponivel,
  validarPeriodoContrato,
  calcularDiasAluguel,
  calcularValorTotal,
  calcularMultaAtraso,
  contratoProximoVencimento,
  pagamentoAtrasado,
} from "./validations";

describe("Validações de Negócio", () => {
  describe("validarCPF", () => {
    it("deve validar CPF válido", () => {
      expect(validarCPF("11144477735")).toBe(true);
    });

    it("deve rejeitar CPF inválido", () => {
      expect(validarCPF("11111111111")).toBe(false);
    });

    it("deve rejeitar CPF com comprimento incorreto", () => {
      expect(validarCPF("123")).toBe(false);
    });

    it("deve aceitar CPF com formatação", () => {
      expect(validarCPF("111.444.777-35")).toBe(true);
    });
  });

  describe("validarCNH", () => {
    it("deve validar CNH válida", () => {
      expect(validarCNH("12345678901")).toBe(true);
    });

    it("deve rejeitar CNH com comprimento incorreto", () => {
      expect(validarCNH("123456789")).toBe(false);
    });

    it("deve rejeitar CNH com caracteres não numéricos", () => {
      expect(validarCNH("1234567890A")).toBe(false);
    });
  });

  describe("motoDisponivel", () => {
    it("deve retornar true para status disponível", () => {
      expect(motoDisponivel("disponivel")).toBe(true);
    });

    it("deve retornar false para status alugada", () => {
      expect(motoDisponivel("alugada")).toBe(false);
    });

    it("deve retornar false para status manutenção", () => {
      expect(motoDisponivel("manutencao")).toBe(false);
    });
  });

  describe("validarPeriodoContrato", () => {
    it("deve validar período com data fim posterior", () => {
      const inicio = new Date("2024-01-01");
      const fim = new Date("2024-01-10");
      expect(validarPeriodoContrato(inicio, fim)).toBe(true);
    });

    it("deve rejeitar período com data fim anterior", () => {
      const inicio = new Date("2024-01-10");
      const fim = new Date("2024-01-01");
      expect(validarPeriodoContrato(inicio, fim)).toBe(false);
    });

    it("deve rejeitar período com datas iguais", () => {
      const data = new Date("2024-01-01");
      expect(validarPeriodoContrato(data, data)).toBe(false);
    });
  });

  describe("calcularDiasAluguel", () => {
    it("deve calcular corretamente dias de aluguel", () => {
      const inicio = new Date("2024-01-01");
      const fim = new Date("2024-01-11");
      expect(calcularDiasAluguel(inicio, fim)).toBe(10);
    });

    it("deve retornar 1 dia para período de um dia", () => {
      const inicio = new Date("2024-01-01");
      const fim = new Date("2024-01-02");
      expect(calcularDiasAluguel(inicio, fim)).toBe(1);
    });
  });

  describe("calcularValorTotal", () => {
    it("deve calcular valor total corretamente", () => {
      const inicio = new Date("2024-01-01");
      const fim = new Date("2024-01-11");
      const valorDiario = 100;
      expect(calcularValorTotal(valorDiario, inicio, fim)).toBe(1000);
    });

    it("deve calcular valor total com valor diário decimal", () => {
      const inicio = new Date("2024-01-01");
      const fim = new Date("2024-01-06");
      const valorDiario = 50.5;
      expect(calcularValorTotal(valorDiario, inicio, fim)).toBe(252.5);
    });
  });

  describe("calcularMultaAtraso", () => {
    it("deve calcular multa por atraso corretamente", () => {
      const valorDiario = 100;
      const diasAtraso = 5;
      const multa = calcularMultaAtraso(valorDiario, diasAtraso);
      expect(multa).toBe(50); // 100 * 5 * 0.1 = 50
    });

    it("deve calcular multa com valor diário decimal", () => {
      const valorDiario = 50.5;
      const diasAtraso = 2;
      const multa = calcularMultaAtraso(valorDiario, diasAtraso);
      expect(multa).toBeCloseTo(10.1, 2); // 50.5 * 2 * 0.1 = 10.1
    });
  });

  describe("contratoProximoVencimento", () => {
    it("deve retornar true para contrato vencendo em 2 dias", () => {
      const hoje = new Date();
      const dataFim = new Date(hoje.getTime() + 2 * 24 * 60 * 60 * 1000);
      expect(contratoProximoVencimento(dataFim)).toBe(true);
    });

    it("deve retornar false para contrato vencendo em 4 dias", () => {
      const hoje = new Date();
      const dataFim = new Date(hoje.getTime() + 4 * 24 * 60 * 60 * 1000);
      expect(contratoProximoVencimento(dataFim)).toBe(false);
    });

    it("deve retornar false para contrato já vencido", () => {
      const hoje = new Date();
      const dataFim = new Date(hoje.getTime() - 1 * 24 * 60 * 60 * 1000);
      expect(contratoProximoVencimento(dataFim)).toBe(false);
    });
  });

  describe("pagamentoAtrasado", () => {
    it("deve retornar true para pagamento com data passada", () => {
      const hoje = new Date();
      const dataPagamento = new Date(hoje.getTime() - 1 * 24 * 60 * 60 * 1000);
      expect(pagamentoAtrasado(dataPagamento)).toBe(true);
    });

    it("deve retornar false para pagamento com data futura", () => {
      const hoje = new Date();
      const dataPagamento = new Date(hoje.getTime() + 1 * 24 * 60 * 60 * 1000);
      expect(pagamentoAtrasado(dataPagamento)).toBe(false);
    });

    it("deve retornar false para pagamento com data de hoje", () => {
      const hoje = new Date();
      expect(pagamentoAtrasado(hoje)).toBe(false);
    });
  });
});
