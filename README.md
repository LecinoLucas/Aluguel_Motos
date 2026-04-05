## Estrutura

```text
aluguel/
	backend/
		src/       API, regras de negócio, módulos e testes
		drizzle/   schema e migrações
		shared/    código compartilhado com o frontend
	frontend/
		src/       aplicação React
		public/    arquivos estáticos
		index.html
	package.json
	run-dev.sh
```

## Comandos da raiz

- `npm run dev`: sobe backend e frontend juntos
- `npm run dev:full`: reinicia portas e sobe backend e frontend
- `npm run dev:backend`: sobe só o backend
- `npm run dev:frontend`: sobe só o frontend
- `npm run check`: roda typecheck de backend e frontend
- `npm run test`: roda os testes do backend
- `npm run build`: gera build de backend e frontend

## Organização

- `backend/src/` concentra entrada do servidor, core, módulos e testes
- `frontend/src/` concentra páginas, features, hooks, componentes e integrações
- `frontend/public/` concentra assets estáticos servidos pelo Vite
- a raiz fica responsável só por orquestração e scripts compartilhados
