import {
  date,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 16 }).default("user").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
  lastSignedIn: timestamp("lastSignedIn", { mode: "date" }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de Motos
 */
export const motos = pgTable("motos", {
  id: serial("id").primaryKey(),
  marca: varchar("marca", { length: 80 }),
  modelo: varchar("modelo", { length: 100 }).notNull(),
  placa: varchar("placa", { length: 10 }).notNull().unique(),
  ano: integer("ano").notNull(),
  anoModelo: integer("ano_modelo"),
  cor: varchar("cor", { length: 40 }),
  chassi: varchar("chassi", { length: 17 }),
  renavam: varchar("renavam", { length: 11 }),
  status: varchar("status", { length: 20 }).default("disponivel").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export type Moto = typeof motos.$inferSelect;
export type InsertMoto = typeof motos.$inferInsert;

/**
 * Tabela de Clientes
 */
export const clientes = pgTable("clientes", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 150 }).notNull(),
  cpf: varchar("cpf", { length: 14 }).notNull().unique(),
  cnh: varchar("cnh", { length: 12 }).notNull().unique(),
  rg: varchar("rg", { length: 20 }),
  orgaoEmissor: varchar("orgao_emissor", { length: 30 }),
  nacionalidade: varchar("nacionalidade", { length: 60 }),
  estadoCivil: varchar("estado_civil", { length: 60 }),
  endereco: text("endereco"),
  cidade: varchar("cidade", { length: 120 }),
  estado: varchar("estado", { length: 80 }),
  cep: varchar("cep", { length: 10 }),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 20 }),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export type Cliente = typeof clientes.$inferSelect;
export type InsertCliente = typeof clientes.$inferInsert;

/**
 * Tabela de Locadores
 */
export const locadores = pgTable("locadores", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 150 }).notNull(),
  cpf: varchar("cpf", { length: 14 }).notNull().unique(),
  rg: varchar("rg", { length: 20 }),
  orgaoEmissor: varchar("orgao_emissor", { length: 30 }),
  nacionalidade: varchar("nacionalidade", { length: 60 }),
  estadoCivil: varchar("estado_civil", { length: 60 }),
  endereco: text("endereco"),
  cidade: varchar("cidade", { length: 120 }),
  estado: varchar("estado", { length: 80 }),
  cep: varchar("cep", { length: 10 }),
  telefone: varchar("telefone", { length: 20 }),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export type Locador = typeof locadores.$inferSelect;
export type InsertLocador = typeof locadores.$inferInsert;

/**
 * Tabela de Tipos de Manutenção
 */
export const tiposManutencao = pgTable("tipos_manutencao", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 120 }).notNull().unique(),
  descricao: text("descricao"),
  intervaloDiasPadrao: integer("intervalo_dias_padrao"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export type TipoManutencao = typeof tiposManutencao.$inferSelect;
export type InsertTipoManutencao = typeof tiposManutencao.$inferInsert;

/**
 * Tabela de Contratos
 */
export const contratos = pgTable("contratos", {
  id: serial("id").primaryKey(),
  clienteId: integer("cliente_id")
    .notNull()
    .references(() => clientes.id, { onDelete: "restrict" }),
  motoId: integer("moto_id")
    .notNull()
    .references(() => motos.id, { onDelete: "restrict" }),
  dataInicio: date("data_inicio", { mode: "date" }).notNull(),
  dataFim: date("data_fim", { mode: "date" }).notNull(),
  valorDiario: numeric("valor_diario", { precision: 10, scale: 2 }).notNull().default("0"),
  status: varchar("status", { length: 20 }).default("ativo").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export type Contrato = typeof contratos.$inferSelect;
export type InsertContrato = typeof contratos.$inferInsert;

/**
 * Tabela de Manutenções
 */
export const manutencoes = pgTable("manutencoes", {
  id: serial("id").primaryKey(),
  motoId: integer("moto_id")
    .notNull()
    .references(() => motos.id, { onDelete: "cascade" }),
  peca: varchar("peca", { length: 120 }),
  tipo: varchar("tipo", { length: 100 }).notNull(),
  data: date("data", { mode: "date" }).notNull(),
  custo: numeric("custo", { precision: 10, scale: 2 }).notNull().default("0"),
  kmAtual: integer("km_atual"),
  intervaloDiasPrevisto: integer("intervalo_dias_previsto"),
  descricao: text("descricao"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export type Manutencao = typeof manutencoes.$inferSelect;
export type InsertManutencao = typeof manutencoes.$inferInsert;

/**
 * Tabela de Pagamentos
 */
export const pagamentos = pgTable("pagamentos", {
  id: serial("id").primaryKey(),
  contratoId: integer("contrato_id")
    .notNull()
    .references(() => contratos.id, { onDelete: "cascade" }),
  valor: numeric("valor", { precision: 10, scale: 2 }).notNull().default("0"),
  data: date("data", { mode: "date" }).notNull(),
  status: varchar("status", { length: 20 }).default("pendente").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export type Pagamento = typeof pagamentos.$inferSelect;
export type InsertPagamento = typeof pagamentos.$inferInsert;

/**
 * Tabela de Notificações
 */
export const notificacoes = pgTable("notificacoes", {
  id: serial("id").primaryKey(),
  tipo: varchar("tipo", { length: 50 }).notNull(), // "contrato_vencimento", "pagamento_atrasado"
  contratoId: integer("contrato_id").references(() => contratos.id, {
    onDelete: "cascade",
  }),
  pagamentoId: integer("pagamento_id").references(() => pagamentos.id, {
    onDelete: "cascade",
  }),
  mensagem: text("mensagem").notNull(),
  enviada: timestamp("enviada", { mode: "date" }).defaultNow().notNull(),
});

export type Notificacao = typeof notificacoes.$inferSelect;
export type InsertNotificacao = typeof notificacoes.$inferInsert;

/**
 * Relações
 */
export const clientesRelations = relations(clientes, ({ many }) => ({
  contratos: many(contratos),
}));

export const motosRelations = relations(motos, ({ many }) => ({
  contratos: many(contratos),
  manutencoes: many(manutencoes),
}));

export const contratosRelations = relations(contratos, ({ one, many }) => ({
  cliente: one(clientes, {
    fields: [contratos.clienteId],
    references: [clientes.id],
  }),
  moto: one(motos, {
    fields: [contratos.motoId],
    references: [motos.id],
  }),
  pagamentos: many(pagamentos),
  notificacoes: many(notificacoes),
}));

export const manutencaosRelations = relations(manutencoes, ({ one }) => ({
  moto: one(motos, {
    fields: [manutencoes.motoId],
    references: [motos.id],
  }),
}));

export const pagamentosRelations = relations(pagamentos, ({ one }) => ({
  contrato: one(contratos, {
    fields: [pagamentos.contratoId],
    references: [contratos.id],
  }),
  notificacoes: one(notificacoes, {
    fields: [pagamentos.id],
    references: [notificacoes.pagamentoId],
  }),
}));

export const notificacoesRelations = relations(notificacoes, ({ one }) => ({
  contrato: one(contratos, {
    fields: [notificacoes.contratoId],
    references: [contratos.id],
  }),
  pagamento: one(pagamentos, {
    fields: [notificacoes.pagamentoId],
    references: [pagamentos.id],
  }),
}));
