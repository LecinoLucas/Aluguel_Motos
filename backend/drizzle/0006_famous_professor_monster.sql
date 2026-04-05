CREATE TABLE "contratos_locadores" (
	"contrato_id" integer NOT NULL,
	"locador_id" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "contratos_locadores_contrato_id_locador_id_pk" PRIMARY KEY("contrato_id","locador_id")
);
--> statement-breakpoint
ALTER TABLE "contratos_locadores" ADD CONSTRAINT "contratos_locadores_contrato_id_contratos_id_fk" FOREIGN KEY ("contrato_id") REFERENCES "public"."contratos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contratos_locadores" ADD CONSTRAINT "contratos_locadores_locador_id_locadores_id_fk" FOREIGN KEY ("locador_id") REFERENCES "public"."locadores"("id") ON DELETE restrict ON UPDATE no action;