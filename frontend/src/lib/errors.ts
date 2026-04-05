import { TRPCClientError } from "@trpc/client";

export const INTERNAL_SERVER_ERROR_MESSAGE = "Erro interno do servidor. Tente novamente.";

export interface ErrorDetails {
  message: string;
  details: string[];
  fieldErrors: Record<string, string>;
}

export function logClientError(context: string, error: unknown) {
  console.error(`[${context}]`, error);
}

function uniqueMessages(messages: string[]) {
  return Array.from(new Set(messages.map((message) => message.trim()).filter(Boolean)));
}

function readStringCandidate(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function extractFieldErrorsFromRecord(value: unknown) {
  if (!value || typeof value !== "object") return {} as Record<string, string>;

  const fieldErrors: Record<string, string> = {};
  for (const [field, message] of Object.entries(value as Record<string, unknown>)) {
    if (typeof message === "string" && message.trim()) {
      fieldErrors[field] = message.trim();
      continue;
    }

    if (Array.isArray(message)) {
      const firstMessage = message.find(
        (item): item is string => typeof item === "string" && item.trim().length > 0,
      );
      if (firstMessage) fieldErrors[field] = firstMessage.trim();
    }
  }

  return fieldErrors;
}

function extractFieldErrorsFromIssues(value: unknown) {
  if (!Array.isArray(value)) return {} as Record<string, string>;

  const fieldErrors: Record<string, string> = {};
  for (const issue of value) {
    if (!issue || typeof issue !== "object") continue;
    const maybeIssue = issue as { message?: unknown; path?: unknown };
    const path = Array.isArray(maybeIssue.path) ? maybeIssue.path[0] : null;
    const message = readStringCandidate(maybeIssue.message);

    if (typeof path === "string" && message && !fieldErrors[path]) {
      fieldErrors[path] = message;
    }
  }

  return fieldErrors;
}

function mapKnownMessage(message: string): Partial<ErrorDetails> {
  const lower = message.toLowerCase();

  if (lower.includes("duplicate key") || lower.includes("unique constraint")) {
    if (lower.includes("locadores") && lower.includes("cpf")) {
      return {
        message: "Já existe um locador com este CPF.",
        details: ["Use outro CPF ou edite o cadastro existente."],
        fieldErrors: { cpf: "Este CPF já está cadastrado para outro locador." },
      };
    }

    if (lower.includes("clientes") && lower.includes("cpf")) {
      return {
        message: "Já existe um locatário com este CPF.",
        details: ["Use outro CPF ou edite o cadastro existente."],
        fieldErrors: { cpf: "Este CPF já está cadastrado para outro locatário." },
      };
    }

    if (lower.includes("clientes") && lower.includes("cnh")) {
      return {
        message: "Já existe um locatário com esta CNH.",
        details: ["A CNH precisa ser única para cada locatário."],
        fieldErrors: { cnh: "Esta CNH já está cadastrada para outro locatário." },
      };
    }

    if (lower.includes("motos") && lower.includes("placa")) {
      return {
        message: "Já existe um veículo com esta placa.",
        details: ["Confira a placa informada ou edite o cadastro do veículo existente."],
        fieldErrors: { placa: "Esta placa já está cadastrada." },
      };
    }

    if (lower.includes("tipos_manutencao") && lower.includes("nome")) {
      return {
        message: "Já existe um tipo de manutenção com este nome.",
        details: ["Use outro nome ou ajuste o tipo já cadastrado."],
        fieldErrors: { nome: "Este tipo de manutenção já está cadastrado." },
      };
    }

    if (lower.includes("pecas") && lower.includes("nome")) {
      return {
        message: "Já existe uma peça com este nome.",
        details: ["Use outro nome ou ajuste a peça já cadastrada."],
        fieldErrors: { nome: "Esta peça já está cadastrada." },
      };
    }
  }

  if (
    lower.includes("foreign key") ||
    lower.includes("is still referenced") ||
    (lower.includes("contrato") && lower.includes("delete"))
  ) {
    return {
      message: "Este cadastro está vinculado a um contrato e não pode ser removido agora.",
      details: ["Remova o vínculo no contrato antes de excluir este registro."],
    };
  }

  if (lower.includes("failed query") && lower.includes("does not exist")) {
    return {
      message: "O banco local está desatualizado para esta tela.",
      details: ["Atualize o schema do banco e reinicie o backend antes de continuar."],
    };
  }

  if (lower.includes("failed query")) {
    return {
      message: "Não foi possível consultar o banco agora.",
      details: ["Verifique se o backend está rodando e se o banco local está íntegro."],
    };
  }

  return {};
}

export function getErrorDetails(error: unknown, fallbackMessage: string): ErrorDetails {
  const candidates: string[] = [];

  if (error instanceof Error && error.message) {
    candidates.push(error.message);
  }

  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      message?: unknown;
      data?: { zodError?: { fieldErrors?: unknown } };
      shape?: { data?: { zodError?: { fieldErrors?: unknown } } };
      cause?: { issues?: unknown };
    };

    const directMessage = readStringCandidate(maybeError.message);
    if (directMessage) candidates.push(directMessage);
  }

  const rawMessage = uniqueMessages(candidates)[0] ?? fallbackMessage;
  const known = mapKnownMessage(rawMessage);

  const trpcFieldErrors =
    error instanceof TRPCClientError
      ? {
          ...extractFieldErrorsFromRecord((error as any).data?.zodError?.fieldErrors),
          ...extractFieldErrorsFromRecord((error as any).shape?.data?.zodError?.fieldErrors),
          ...extractFieldErrorsFromIssues((error as any).cause?.issues),
        }
      : {};

  const genericFieldErrors =
    typeof error === "object" && error !== null
      ? {
          ...extractFieldErrorsFromRecord((error as any).data?.zodError?.fieldErrors),
          ...extractFieldErrorsFromRecord((error as any).shape?.data?.zodError?.fieldErrors),
          ...extractFieldErrorsFromIssues((error as any).cause?.issues),
        }
      : {};

  const fieldErrors = {
    ...genericFieldErrors,
    ...trpcFieldErrors,
    ...(known.fieldErrors ?? {}),
  };

  const details = uniqueMessages([
    ...(known.details ?? []),
    ...Object.values(fieldErrors),
  ]);

  return {
    message: known.message ?? rawMessage ?? fallbackMessage,
    details,
    fieldErrors,
  };
}

export function extractErrorMessage(error: unknown, fallbackMessage: string) {
  return getErrorDetails(error, fallbackMessage).message || INTERNAL_SERVER_ERROR_MESSAGE;
}

export function getErrorMessage(error: unknown, fallbackMessage: string) {
  logClientError(fallbackMessage, error);
  return extractErrorMessage(error, fallbackMessage);
}
