ALTER TABLE "manutencoes"
ADD COLUMN IF NOT EXISTS "contrato_id" integer;

DO $$ BEGIN
 ALTER TABLE "manutencoes" ADD CONSTRAINT "manutencoes_contrato_id_contratos_id_fk" FOREIGN KEY ("contrato_id") REFERENCES "public"."contratos"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
