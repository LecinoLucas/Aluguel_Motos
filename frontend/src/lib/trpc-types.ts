import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../backend/src/routers";

type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;

export type LocadorListItem = RouterOutputs["locadores"]["list"][number];
export type ClienteListItem = RouterOutputs["clientes"]["list"][number];
export type MotoListItem = RouterOutputs["motos"]["list"][number];
export type ContratoListItem = RouterOutputs["contratos"]["list"][number];
export type PagamentoListItem = RouterOutputs["pagamentos"]["list"][number];
export type ManutencaoListItem = RouterOutputs["manutencoes"]["list"][number];
export type ContratoProximoVencimentoItem = RouterOutputs["dashboard"]["contratosProximosVencimento"][number];
export type PagamentoAtrasadoItem = RouterOutputs["dashboard"]["pagamentosAtrasados"][number];

export type MotosListInput = RouterInputs["motos"]["list"];
export type ContratosListInput = RouterInputs["contratos"]["list"];
export type PagamentosListInput = RouterInputs["pagamentos"]["list"];
export type MotoStatusInput = NonNullable<RouterInputs["motos"]["update"]["data"]["status"]>;
export type PagamentoStatusInput = NonNullable<RouterInputs["pagamentos"]["update"]["data"]["status"]>;