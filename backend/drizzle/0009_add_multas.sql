CREATE TABLE IF NOT EXISTS "multas" (
  "id" serial PRIMARY KEY NOT NULL,
  "contrato_id" integer NOT NULL,
  "moto_id" integer NOT NULL,
  "tipo" varchar(20) DEFAULT 'multa' NOT NULL,
  "responsavel" varchar(160) NOT NULL,
  "descricao" text NOT NULL,
  "data" date NOT NULL,
  "valor" numeric(10, 2) DEFAULT '0' NOT NULL,
  "status" varchar(24) DEFAULT 'pendente' NOT NULL,
  "observacao" text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "multas" ADD CONSTRAINT "multas_contrato_id_contratos_id_fk" FOREIGN KEY ("contrato_id") REFERENCES "public"."contratos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "multas" ADD CONSTRAINT "multas_moto_id_motos_id_fk" FOREIGN KEY ("moto_id") REFERENCES "public"."motos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
