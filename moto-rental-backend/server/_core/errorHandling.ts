import { TRPCError } from "@trpc/server";

export const INTERNAL_SERVER_ERROR_MESSAGE = "Erro interno do servidor. Tente novamente.";

interface ServerErrorContext {
  path: string;
  type: string;
  userId?: string | number;
}

export function logServerError(context: ServerErrorContext, error: unknown) {
  console.error("[tRPC Server Error]", {
    path: context.path,
    type: context.type,
    userId: context.userId ?? null,
  }, error);
}

export function normalizeServerError(error: unknown) {
  if (error instanceof TRPCError) {
    return error;
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: INTERNAL_SERVER_ERROR_MESSAGE,
    cause: error instanceof Error ? error : undefined,
  });
}
