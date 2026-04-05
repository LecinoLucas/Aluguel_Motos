# Sistema de Gestão de Aluguel de Motos

Um sistema completo e elegante para gerenciar aluguel de motos, com funcionalidades de CRUD para motos, clientes, contratos, manutenções e pagamentos. Inclui dashboard com métricas, validações de negócio e notificações automáticas.

## 🚀 Funcionalidades Principais

### Gestão de Motos
- Cadastrar, listar, editar e deletar motos
- Filtrar motos por status (disponível, alugada, em manutenção)
- Atualizar status da moto automaticamente

### Gestão de Clientes
- Cadastrar clientes com validação de CPF e CNH
- Listar e buscar clientes por nome ou CPF
- Bloquear exclusão de clientes com contratos ativos
- Gerenciar informações de contato

### Gestão de Contratos
- Criar contratos vinculando cliente e moto
- Validar disponibilidade da moto
- Calcular valor total baseado em dias de aluguel
- Filtrar contratos por status (ativo, encerrado, cancelado)
- Atualizar e encerrar contratos

### Gestão de Manutenções
- Registrar manutenções de motos
- Atualizar status da moto automaticamente para "em manutenção"
- Visualizar histórico de manutenções
- Calcular custo total de manutenções

### Gestão de Pagamentos
- Registrar pagamentos vinculados a contratos
- Marcar pagamentos como pago, pendente ou atrasado
- Filtrar pagamentos por status
- Calcular receita total

### Dashboard Administrativo
- Cards com métricas em tempo real
- Gráficos de receita mensal
- Alertas de contratos próximos do vencimento
- Alertas de pagamentos atrasados

### Notificações Automáticas
- Verificação automática de contratos próximos do vencimento (3 dias antes)
- Alertas de pagamentos atrasados
- Notificações enviadas ao proprietário a cada 6 horas

## 📋 Requisitos

- Node.js 22+
- npm ou pnpm
- PostgreSQL 14+

## 🔧 Instalação

### 1. Clonar o repositório
```bash
git clone <repository-url>
cd moto-rental-system
```

### 2. Instalar dependências
```bash
pnpm install
```

### 3. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/moto_rental
NODE_ENV=development
PORT=3000
```

### 4. Executar migrations
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### 5. Iniciar o servidor
```bash
pnpm dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 📱 Como Usar

### Autenticação
1. Acesse a página inicial
2. Clique em "Entrar" para autenticar via OAuth
3. Após autenticação, você terá acesso ao dashboard

### Fluxo Principal

#### 1. Cadastrar Motos
- Acesse "Motos" no menu lateral
- Clique em "Nova Moto"
- Preencha modelo, placa e ano
- Clique em "Criar Moto"

#### 2. Cadastrar Clientes
- Acesse "Clientes" no menu lateral
- Clique em "Novo Cliente"
- Preencha nome, CPF, CNH, email e telefone
- Clique em "Criar Cliente"

#### 3. Criar Contrato
- Acesse "Contratos" no menu lateral
- Clique em "Novo Contrato"
- Selecione cliente e moto
- Defina período (data início e fim)
- Defina valor diário
- Clique em "Criar Contrato"
- A moto será automaticamente marcada como "alugada"

#### 4. Registrar Manutenção
- Acesse "Manutenções" no menu lateral
- Clique em "Registrar Manutenção"
- Selecione a moto
- Preencha tipo, data e custo
- Clique em "Registrar"
- A moto será automaticamente marcada como "em manutenção"

#### 5. Registrar Pagamento
- Acesse "Pagamentos" no menu lateral
- Clique em "Registrar Pagamento"
- Selecione o contrato
- Preencha valor, data e status
- Clique em "Registrar"

#### 6. Visualizar Dashboard
- Acesse "Dashboard" no menu lateral
- Visualize métricas em tempo real
- Veja gráficos de receita mensal
- Receba alertas de contratos próximos do vencimento
- Receba alertas de pagamentos atrasados

## 🔐 Validações de Negócio

### Motos
- Não é permitido alugar uma moto que está em manutenção
- Status é atualizado automaticamente ao criar contratos/manutenções

### Clientes
- CPF e CNH são validados no cadastro
- Não é permitido deletar cliente com contratos ativos

### Contratos
- Data de fim deve ser posterior à data de início
- Moto deve estar disponível para alugar
- Valor total é calculado automaticamente (dias × valor diário)

### Pagamentos
- Multa por atraso é calculada automaticamente (10% do valor diário por dia atrasado)
- Pagamentos podem ser marcados como pago, pendente ou atrasado

## 🧪 Testes

Executar testes unitários:
```bash
pnpm test
```

Os testes cobrem:
- Validações de CPF e CNH
- Cálculos de dias de aluguel
- Cálculos de multas por atraso
- Validação de períodos de contrato
- Verificação de contratos próximos do vencimento
- Verificação de pagamentos atrasados

## 📊 Arquitetura

### Backend
- **Framework**: Express.js + tRPC
- **ORM**: Drizzle ORM
- **Banco de Dados**: PostgreSQL
- **Validação**: Zod
- **Autenticação**: OAuth (Manus)

### Frontend
- **Framework**: React 19
- **Linguagem**: TypeScript
- **Styling**: Tailwind CSS 4
- **Formulários**: React Hook Form + Zod
- **Gráficos**: Recharts
- **UI Components**: shadcn/ui

### Estrutura de Pastas
```
├── src/
│   ├── db.ts                 # Query helpers
│   ├── routers.ts            # tRPC routes
│   ├── validations.ts        # Business validations
│   ├── notifications.ts      # Automatic notifications
│   └── _core/               # Framework core
├── drizzle/
│   ├── schema.ts            # Database schema
│   ├── 0000_*.sql           # SQL migrations na raiz do Drizzle
│   └── meta/                # Snapshots e journal do Drizzle
├── shared/
│   └── ...                  # Tipos e constantes compartilhadas
└── package.json
```

## 🔄 Fluxo de Notificações

O sistema verifica automaticamente a cada 6 horas:

1. **Contratos próximos do vencimento**: Contratos que vencem nos próximos 3 dias
2. **Pagamentos atrasados**: Pagamentos com data passada e status pendente

Notificações são enviadas ao proprietário via sistema interno de notificações.

## 🚨 Tratamento de Erros

O sistema fornece mensagens de erro claras para:
- Validação de formulários (CPF, CNH, datas, valores)
- Regras de negócio (moto em manutenção, cliente com contrato ativo)
- Operações de banco de dados

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação técnica ou entre em contato com o time de desenvolvimento.

## 📄 Licença

MIT

## 🎨 Design

O sistema utiliza um design elegante e moderno com:
- Paleta de cores profissional
- Componentes reutilizáveis
- Responsividade completa
- Acessibilidade
- Estados de loading, erro e vazio
- Animações suaves

## 🔐 Segurança

- Autenticação via OAuth
- Validação de entrada em todos os formulários
- Proteção contra SQL injection via ORM
- Senhas armazenadas com hash seguro
- CORS configurado corretamente
