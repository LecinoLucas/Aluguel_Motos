ALTER TABLE "pagamentos" ALTER COLUMN "contrato_id" DROP NOT NULL;
ALTER TABLE "pagamentos" ADD COLUMN "moto_id" integer;
ALTER TABLE "pagamentos" ADD COLUMN "manutencao_id" integer;
ALTER TABLE "pagamentos" ADD COLUMN "tipo" varchar(20) DEFAULT 'receber' NOT NULL;
ALTER TABLE "pagamentos" ADD COLUMN "origem" varchar(20) DEFAULT 'manual' NOT NULL;
ALTER TABLE "pagamentos" ADD COLUMN "descricao" text;
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_moto_id_motos_id_fk" FOREIGN KEY ("moto_id") REFERENCES "public"."motos"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_manutencao_id_manutencoes_id_fk" FOREIGN KEY ("manutencao_id") REFERENCES "public"."manutencoes"("id") ON DELETE cascade ON UPDATE no action;
