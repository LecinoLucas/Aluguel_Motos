CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" varchar(16) DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clientes" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(150) NOT NULL,
	"cpf" varchar(14) NOT NULL,
	"cnh" varchar(12) NOT NULL,
	"rg" varchar(20),
	"orgao_emissor" varchar(30),
	"nacionalidade" varchar(60),
	"estado_civil" varchar(60),
	"endereco" text,
	"cidade" varchar(120),
	"estado" varchar(80),
	"cep" varchar(10),
	"email" varchar(320),
	"telefone" varchar(20),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "clientes_cpf_unique" UNIQUE("cpf"),
	CONSTRAINT "clientes_cnh_unique" UNIQUE("cnh")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "locadores" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(150) NOT NULL,
	"cpf" varchar(14) NOT NULL,
	"rg" varchar(20),
	"orgao_emissor" varchar(30),
	"nacionalidade" varchar(60),
	"estado_civil" varchar(60),
	"endereco" text,
	"cidade" varchar(120),
	"estado" varchar(80),
	"cep" varchar(10),
	"telefone" varchar(20),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "locadores_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "motos" (
	"id" serial PRIMARY KEY NOT NULL,
	"marca" varchar(80),
	"modelo" varchar(100) NOT NULL,
	"placa" varchar(10) NOT NULL,
	"ano" integer NOT NULL,
	"ano_modelo" integer,
	"cor" varchar(40),
	"chassi" varchar(17),
	"renavam" varchar(11),
	"status" varchar(20) DEFAULT 'disponivel' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "motos_placa_unique" UNIQUE("placa")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pecas" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(120) NOT NULL,
	"descricao" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pecas_nome_unique" UNIQUE("nome")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tipos_manutencao" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(120) NOT NULL,
	"descricao" text,
	"intervalo_dias_padrao" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tipos_manutencao_nome_unique" UNIQUE("nome")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contratos" (
	"id" serial PRIMARY KEY NOT NULL,
	"locatario_id" integer NOT NULL,
	"moto_id" integer NOT NULL,
	"data_inicio" date NOT NULL,
	"data_fim" date NOT NULL,
	"valor_semanal" numeric(10, 2) DEFAULT '0' NOT NULL,
	"status" varchar(20) DEFAULT 'ativo' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "contratos_locatario_id_clientes_id_fk" FOREIGN KEY ("locatario_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
	CONSTRAINT "contratos_moto_id_motos_id_fk" FOREIGN KEY ("moto_id") REFERENCES "motos"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "manutencoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"moto_id" integer NOT NULL,
	"peca" varchar(120),
	"tipo" varchar(100) NOT NULL,
	"data" date NOT NULL,
	"custo" numeric(10, 2) DEFAULT '0' NOT NULL,
	"km_atual" integer,
	"intervalo_dias_previsto" integer,
	"descricao" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "manutencoes_moto_id_motos_id_fk" FOREIGN KEY ("moto_id") REFERENCES "motos"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pagamentos" (
	"id" serial PRIMARY KEY NOT NULL,
	"contrato_id" integer NOT NULL,
	"valor" numeric(10, 2) DEFAULT '0' NOT NULL,
	"data" date NOT NULL,
	"status" varchar(20) DEFAULT 'pendente' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pagamentos_contrato_id_contratos_id_fk" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notificacoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"tipo" varchar(50) NOT NULL,
	"contrato_id" integer,
	"pagamento_id" integer,
	"mensagem" text NOT NULL,
	"enviada" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notificacoes_contrato_id_contratos_id_fk" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
	CONSTRAINT "notificacoes_pagamento_id_pagamentos_id_fk" FOREIGN KEY ("pagamento_id") REFERENCES "pagamentos"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);
