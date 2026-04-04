import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../../moto-rental-backend/server/routers";

export const trpc = createTRPCReact<AppRouter>();
