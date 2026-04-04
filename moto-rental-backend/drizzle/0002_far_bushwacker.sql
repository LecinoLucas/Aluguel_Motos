ALTER TABLE `contratos` MODIFY COLUMN `valor_diario` decimal(10,2) NOT NULL DEFAULT '0';--> statement-breakpoint
ALTER TABLE `manutencoes` MODIFY COLUMN `custo` decimal(10,2) NOT NULL DEFAULT '0';--> statement-breakpoint
ALTER TABLE `pagamentos` MODIFY COLUMN `valor` decimal(10,2) NOT NULL DEFAULT '0';