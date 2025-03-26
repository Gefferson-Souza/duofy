# Sistema de Gerenciamento de Pedidos - Duofy

API RESTful para gerenciamento e processamento assíncrono de pedidos, desenvolvida com NestJS, TypeScript, PostgreSQL, MongoDB e RabbitMQ.

## Arquitetura do Sistema

O sistema é construído com uma arquitetura modular seguindo os princípios do NestJS, utilizando:

- **PostgreSQL**: Armazenamento de dados estruturados (pedidos, usuários)
- **MongoDB**: Armazenamento de logs e dados não estruturados
- **RabbitMQ**: Processamento assíncrono de pedidos
- **JWT**: Autenticação e autorização
- **Swagger**: Documentação da API

### Fluxo Principal

1. Usuário se registra e obtém um token JWT
2. Usuário cria um pedido através da API
3. Sistema salva o pedido no PostgreSQL
4. Sistema envia uma mensagem para a fila RabbitMQ
5. Serviço de processamento assíncrono consome a mensagem
6. Pedido é processado e seu status é atualizado
7. Logs são registrados no MongoDB em cada etapa

## Características

- Autenticação JWT com diferentes níveis de acesso
- Gerenciamento completo de pedidos com PostgreSQL
- Registros de logs detalhados no MongoDB
- Processamento assíncrono usando RabbitMQ
- Agendamento de tarefas recorrentes (limpeza de pedidos pendentes, relatórios diários)
- Swagger para documentação completa da API
- Containerização com Docker e Docker Compose
- Testes automatizados

## Pré-requisitos

- Docker e Docker Compose (para execução com contêineres)
- Node.js 16+ (para desenvolvimento local)
- NPM ou Yarn
- PostgreSQL 13+
- MongoDB 4+
- RabbitMQ 3+

## Instalação com Docker

1. Clone o repositório:
```bash
git clone https://github.com/Gefferson-Souza/duofy.git
cd projeto-duofy
```

2. Inicie os serviços com Docker Compose:
```bash
docker-compose up -d
```

3. A aplicação estará disponível em:
   - API: http://localhost:3000/api
   - Documentação Swagger: http://localhost:3000/docs
   - Admin do RabbitMQ: http://localhost:15672 (usuário: guest, senha: guest)

## Desenvolvimento Local (sem Docker)

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente (crie um arquivo .env):
```properties
PORT=3000
NODE_ENV=development
JWT_SECRET=sua_chave_secreta_super_segura_para_jwt
JWT_EXPIRES_IN=1d
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=123456
POSTGRES_DB=duofy
MONGODB_URI=mongodb://127.0.0.1:27017/duofy
RABBITMQ_URL=amqp://localhost:5672
```

3. Inicie a aplicação:
```bash
npm run start:dev
```

## Estrutura do Projeto

```
src/
├── app.module.ts              # Módulo principal da aplicação
├── main.ts                    # Ponto de entrada da aplicação
├── modules/
│   ├── auth/                  # Módulo de autenticação
│   │   ├── controllers/       # Controladores de autenticação
│   │   ├── dto/               # Objetos de transferência de dados
│   │   ├── entities/          # Entidades de usuário
│   │   ├── guards/            # Guardas de autenticação
│   │   ├── strategies/        # Estratégias de autenticação (JWT, Local)
│   │   └── auth.service.ts    # Serviços de autenticação
│   ├── orders/                # Módulo de gerenciamento de pedidos
│   │   ├── controllers/       # Controladores de pedidos
│   │   ├── dto/               # Objetos de transferência de dados
│   │   ├── entities/          # Entidades de pedidos
│   │   └── orders.service.ts  # Serviços de pedidos
│   ├── processing/            # Módulo de processamento assíncrono
│   │   ├── controllers/       # Controladores de processamento
│   │   └── processing.service.ts # Serviços de processamento
│   ├── logs/                  # Módulo de logs
│   │   ├── schemas/           # Schemas do MongoDB
│   │   └── logs.service.ts    # Serviços de logs
│   └── reports/               # Módulo de relatórios
│       ├── controllers/       # Controladores de relatórios
│       └── reports.service.ts # Serviços de relatórios
```

## API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login e obter token JWT
- `GET /api/auth/profile` - Visualizar perfil do usuário autenticado

### Pedidos
- `POST /api/orders` - Criar novo pedido
- `GET /api/orders` - Listar todos os pedidos (requer autenticação)
- `GET /api/orders/:id` - Visualizar detalhes de um pedido (requer autenticação)

### Processamento
- `POST /api/processing/:id/process` - Processar um pedido manualmente (requer autenticação)

### Relatórios
- `GET /api/reports/daily` - Gerar relatório diário (requer autenticação)
- `GET /api/reports/range` - Gerar relatório para um período (requer autenticação)

## Testes

```bash
# testes unitários
npm run test

# testes e2e
npm run test:e2e

# cobertura de testes
npm run test:cov
```

## Decisões Técnicas

### Armazenamento Híbrido
Utilizamos PostgreSQL para dados estruturados (pedidos, usuários) e MongoDB para dados não estruturados (logs, histórico de processamento). Esta abordagem híbrida permite aproveitar os pontos fortes de cada banco de dados.

### Processamento Assíncrono
O uso do RabbitMQ para processamento assíncrono permite desacoplar a criação de pedidos do seu processamento, melhorando a escalabilidade e resiliência do sistema.

### Agendamento de Tarefas
Implementamos tarefas agendadas para:
1. Limpeza de pedidos pendentes antigos
2. Geração automática de relatórios diários

### Segurança
Autenticação JWT com diferentes níveis de acesso e senhas criptografadas com bcrypt.

## Escalabilidade e Produção

O sistema foi projetado considerando boas práticas para ambientes de produção:

1. **Containerização**: Docker e Docker Compose para facilitar a implantação
2. **Variáveis de Ambiente**: Configuração via variáveis de ambiente
3. **Logs**: Sistema de logs abrangente para monitoramento
4. **Tratamento de Erros**: Tratamento adequado de exceções
5. **Documentação**: API documentada com Swagger
