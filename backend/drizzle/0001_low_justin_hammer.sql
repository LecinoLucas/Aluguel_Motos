CREATE TABLE `clientes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(150) NOT NULL,
	`cpf` varchar(14) NOT NULL,
	`cnh` varchar(12) NOT NULL,
	`email` varchar(320),
	`telefone` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientes_id` PRIMARY KEY(`id`),
	CONSTRAINT `clientes_cpf_unique` UNIQUE(`cpf`),
	CONSTRAINT `clientes_cnh_unique` UNIQUE(`cnh`)
);
--> statement-breakpoint
CREATE TABLE `contratos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cliente_id` int NOT NULL,
	`moto_id` int NOT NULL,
	`data_inicio` date NOT NULL,
	`data_fim` date NOT NULL,
	`valor_diario` decimal(10,2) NOT NULL,
	`status` enum('ativo','encerrado','cancelado') NOT NULL DEFAULT 'ativo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contratos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `manutencoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`moto_id` int NOT NULL,
	`tipo` varchar(100) NOT NULL,
	`data` date NOT NULL,
	`custo` decimal(10,2) NOT NULL,
	`descricao` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `manutencoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `motos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`modelo` varchar(100) NOT NULL,
	`placa` varchar(10) NOT NULL,
	`ano` int NOT NULL,
	`status` enum('disponivel','alugada','manutencao') NOT NULL DEFAULT 'disponivel',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `motos_id` PRIMARY KEY(`id`),
	CONSTRAINT `motos_placa_unique` UNIQUE(`placa`)
);
--> statement-breakpoint
CREATE TABLE `notificacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipo` varchar(50) NOT NULL,
	`contrato_id` int,
	`pagamento_id` int,
	`mensagem` text NOT NULL,
	`enviada` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notificacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pagamentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contrato_id` int NOT NULL,
	`valor` decimal(10,2) NOT NULL,
	`data` date NOT NULL,
	`status` enum('pendente','pago','atrasado') NOT NULL DEFAULT 'pendente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pagamentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `contratos` ADD CONSTRAINT `contratos_cliente_id_clientes_id_fk` FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contratos` ADD CONSTRAINT `contratos_moto_id_motos_id_fk` FOREIGN KEY (`moto_id`) REFERENCES `motos`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `manutencoes` ADD CONSTRAINT `manutencoes_moto_id_motos_id_fk` FOREIGN KEY (`moto_id`) REFERENCES `motos`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_contrato_id_contratos_id_fk` FOREIGN KEY (`contrato_id`) REFERENCES `contratos`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_pagamento_id_pagamentos_id_fk` FOREIGN KEY (`pagamento_id`) REFERENCES `pagamentos`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pagamentos` ADD CONSTRAINT `pagamentos_contrato_id_contratos_id_fk` FOREIGN KEY (`contrato_id`) REFERENCES `contratos`(`id`) ON DELETE cascade ON UPDATE no action;