import {
  date,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export interface ContratoDocumentoLocadorSnapshot {
  nome: string;
  nacionalidade: string;
  estadoCivil: string;
  cpf: string;
  rg: string;
  orgaoEmissor: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
}

export interface ContratoDocumentoLocatarioSnapshot {
  nome: string;
  nacionalidade: string;
  estadoCivil: string;
  cpf: string;
  rg: string;
  orgaoEmissor: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  cnh: string;
}

export interface ContratoDocumentoVeiculoSnapshot {
  marca: string;
  modelo: string;
  ano: string;
  cor: string;
  placa: string;
  chassi: string;
  renavam: string;
}

export interface ContratoDocumentoTermosSnapshot {
  localContrato: string;
  dataContrato: string;
  dataInicio: string;
  dataFim: string;
  valorSemanal: string;
  valorCaucao: string;
  formaPagamento: string;
  kmHodometro: string;
}

export interface ContratoDocumentoSnapshot {
  locadores: ContratoDocumentoLocadorSnapshot[];
  locatario: ContratoDocumentoLocatarioSnapshot;
  veiculo: ContratoDocumentoVeiculoSnapshot;
  termos: ContratoDocumentoTermosSnapshot;
}

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
  disponibilidadeManual: varchar("disponibilidade_manual", { length: 20 }).default("automatico").notNull(),
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
 * Tabela de Peças
 */
export const pecas = pgTable("pecas", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 120 }).notNull().unique(),
  descricao: text("descricao"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export type Peca = typeof pecas.$inferSelect;
export type InsertPeca = typeof pecas.$inferInsert;

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
  locatarioId: integer("locatario_id")
    .notNull()
    .references(() => clientes.id, { onDelete: "restrict" }),
  motoId: integer("moto_id")
    .notNull()
    .references(() => motos.id, { onDelete: "restrict" }),
  dataInicio: date("data_inicio", { mode: "date" }).notNull(),
  dataFim: date("data_fim", { mode: "date" }).notNull(),
  valorSemanal: numeric("valor_semanal", { precision: 10, scale: 2 }).notNull().default("0"),
  diasAposFim: integer("dias_apos_fim").notNull().default(0),
  documentoSnapshot: jsonb("documento_snapshot").$type<ContratoDocumentoSnapshot | null>(),
  status: varchar("status", { length: 20 }).default("ativo").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export type Contrato = typeof contratos.$inferSelect;
export type InsertContrato = typeof contratos.$inferInsert;

export const contratosLocadores = pgTable(
  "contratos_locadores",
  {
    contratoId: integer("contrato_id")
      .notNull()
      .references(() => contratos.id, { onDelete: "cascade" }),
    locadorId: integer("locador_id")
      .notNull()
      .references(() => locadores.id, { onDelete: "restrict" }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.contratoId, table.locadorId] }),
  }),
);

export type ContratoLocador = typeof contratosLocadores.$inferSelect;
export type InsertContratoLocador = typeof contratosLocadores.$inferInsert;

/**
 * Tabela de Manutenções
 */
export const manutencoes = pgTable("manutencoes", {
  id: serial("id").primaryKey(),
  contratoId: integer("contrato_id").references(() => contratos.id, { onDelete: "set null" }),
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
  contratoId: integer("contrato_id").references(() => contratos.id, { onDelete: "cascade" }),
  motoId: integer("moto_id").references(() => motos.id, { onDelete: "cascade" }),
  manutencaoId: integer("manutencao_id").references(() => manutencoes.id, { onDelete: "cascade" }),
  tipo: varchar("tipo", { length: 20 }).default("receber").notNull(),
  origem: varchar("origem", { length: 20 }).default("manual").notNull(),
  descricao: text("descricao"),
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
 * Tabela de Multas e Prejuízos
 */
export const multas = pgTable("multas", {
  id: serial("id").primaryKey(),
  contratoId: integer("contrato_id")
    .notNull()
    .references(() => contratos.id, { onDelete: "cascade" }),
  motoId: integer("moto_id")
    .notNull()
    .references(() => motos.id, { onDelete: "cascade" }),
  tipo: varchar("tipo", { length: 20 }).default("multa").notNull(),
  responsavel: varchar("responsavel", { length: 160 }).notNull(),
  descricao: text("descricao").notNull(),
  data: date("data", { mode: "date" }).notNull(),
  valor: numeric("valor", { precision: 10, scale: 2 }).notNull().default("0"),
  status: varchar("status", { length: 24 }).default("pendente").notNull(),
  observacao: text("observacao"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export type Multa = typeof multas.$inferSelect;
export type InsertMulta = typeof multas.$inferInsert;

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
  multas: many(multas),
}));

export const locadoresRelations = relations(locadores, ({ many }) => ({
  contratosLocadores: many(contratosLocadores),
}));

export const contratosRelations = relations(contratos, ({ one, many }) => ({
  locatario: one(clientes, {
    fields: [contratos.locatarioId],
    references: [clientes.id],
  }),
  moto: one(motos, {
    fields: [contratos.motoId],
    references: [motos.id],
  }),
  contratosLocadores: many(contratosLocadores),
  manutencoes: many(manutencoes),
  pagamentos: many(pagamentos),
  multas: many(multas),
  notificacoes: many(notificacoes),
}));

export const contratosLocadoresRelations = relations(contratosLocadores, ({ one }) => ({
  contrato: one(contratos, {
    fields: [contratosLocadores.contratoId],
    references: [contratos.id],
  }),
  locador: one(locadores, {
    fields: [contratosLocadores.locadorId],
    references: [locadores.id],
  }),
}));

export const manutencaosRelations = relations(manutencoes, ({ one }) => ({
  contrato: one(contratos, {
    fields: [manutencoes.contratoId],
    references: [contratos.id],
  }),
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

export const multasRelations = relations(multas, ({ one }) => ({
  contrato: one(contratos, {
    fields: [multas.contratoId],
    references: [contratos.id],
  }),
  moto: one(motos, {
    fields: [multas.motoId],
    references: [motos.id],
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
