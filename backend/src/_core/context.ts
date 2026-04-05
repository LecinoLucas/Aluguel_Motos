import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

let devBypassUserCache: User | null = null;

async function getDevBypassUser(): Promise<User> {
  if (devBypassUserCache) return devBypassUserCache;

  const now = new Date();
  const openId = ENV.ownerOpenId || "local-dev-admin";

  try {
    await db.upsertUser({
      openId,
      name: "Administrador Local",
      email: "dev@localhost",
      loginMethod: "dev-bypass",
      role: "admin",
      lastSignedIn: now,
    });

    const persistedUser = await db.getUserByOpenId(openId);
    if (persistedUser) {
      devBypassUserCache = persistedUser;
      return persistedUser;
    }
  } catch (error) {
    console.warn("[Auth] Falha ao sincronizar usuario de desenvolvimento:", error);
  }

  const fallbackUser: User = {
    id: 0,
    openId,
    email: "dev@localhost",
    name: "Administrador Local",
    loginMethod: "dev-bypass",
    role: "admin",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };
  devBypassUserCache = fallbackUser;
  return fallbackUser;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  if (ENV.devAuthBypass) {
    user = await getDevBypassUser();
  } else {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (error) {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
