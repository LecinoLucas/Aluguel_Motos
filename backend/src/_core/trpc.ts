import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { logServerError, normalizeServerError } from "./errorHandling";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;

const errorHandlingMiddleware = t.middleware(async (opts) => {
  try {
    return await opts.next();
  } catch (error) {
    logServerError(
      {
        path: opts.path,
        type: opts.type,
        userId: opts.ctx.user?.id,
      },
      error,
    );

    throw normalizeServerError(error);
  }
});

const baseProcedure = t.procedure.use(errorHandlingMiddleware);

export const publicProcedure = baseProcedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = baseProcedure.use(requireUser);

export const adminProcedure = baseProcedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
