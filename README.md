<div align="center">

# 💇‍♀️ Gabbeuty

### Sistema de Gestão para Profissionais de Beleza

[![CI](https://github.com/Lukas-Rodrigo/gabbeuty/workflows/CI/badge.svg)](https://github.com/Lukas-Rodrigo/gabbeuty/actions)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://whatsapp.com/)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)

[Funcionalidades](#-funcionalidades) •
[Arquitetura](#-arquitetura) •
[Instalação](#-instalação) •
[Documentação](#-documentação-da-api) •
[Testes](#-testes) •
[Tecnologias](#-tecnologias)

</div>

---

## 📖 Sobre o Projeto

**Gabbeuty** é uma plataforma completa de gestão para profissionais autônomos de beleza (cabeleireiros, barbeiros, manicures, etc.). O sistema oferece controle total sobre agendamentos, clientes, serviços e integração com WhatsApp para notificações automáticas.

### ✨ Diferenciais

- 🏗️ **Arquitetura DDD (Domain-Driven Design)** - Código limpo e escalável
- 🎯 **Clean Architecture** - Separação clara de responsabilidades
- 📱 **Integração WhatsApp** - Notificações automáticas via Baileys
- 📊 **Dashboard de Métricas** - Insights sobre seu negócio
- 🔐 **Autenticação JWT** - Segurança robusta
- 📝 **Documentação Swagger** - API totalmente documentada
- ✅ **100% Testado** - 71 testes unitários + 55 testes E2E

---

## 🚀 Funcionalidades

### 👤 Gestão de Autenticação

- ✅ Registro de novos profissionais
- ✅ Login com JWT (Access Token + Refresh Token)
- ✅ Renovação automática de tokens
- ✅ Logout seguro

### 👥 Gestão de Clientes

- ✅ Cadastro completo de clientes
- ✅ Histórico de atendimentos
- ✅ Observações personalizadas
- ✅ Controle de contatos (telefone + perfil)
- ✅ Soft delete (exclusão lógica)

### 💼 Gestão de Serviços

- ✅ Cadastro de serviços oferecidos
- ✅ Definição de preços e duração
- ✅ Histórico de serviços prestados
- ✅ Filtros por data e período

### 📅 Gestão de Agendamentos

- ✅ Criação de agendamentos com múltiplos serviços
- ✅ Status: Pendente, Confirmado, Cancelado, Concluído
- ✅ Notificações automáticas via WhatsApp
- ✅ Métricas de agendamentos por status
- ✅ Cálculo automático de faturamento
- ✅ Validação de datas e horários

### 📱 Integração WhatsApp

- ✅ Conexão via QR Code
- ✅ Notificações de agendamentos criados
- ✅ Notificações de confirmação
- ✅ Notificações de cancelamento
- ✅ Gestão de sessões (conectar/desconectar)

### 📊 Relatórios e Métricas

- ✅ Total de agendamentos por status
- ✅ Faturamento por período
- ✅ Métricas de performance
- ✅ Filtros por data customizados

---

## 🏗️ Arquitetura

O projeto segue os princípios de **Clean Architecture** e **Domain-Driven Design (DDD)**, garantindo código testável, manutenível e escalável.

### 📂 Estrutura de Pastas

```
src/
├── _shared/                    # Código compartilhado
│   ├── entities/              # Entidades base (Entity, AggregateRoot)
│   ├── value-objects/         # Value Objects (UniqueEntityID)
│   ├── errors/                # Erros de domínio
│   ├── event/                 # Sistema de Domain Events
│   ├── filters/               # Exception filters globais
│   ├── repositories/          # Interfaces de repositórios
│   └── docs/                  # Documentação Swagger
│
├── modules/
│   ├── auth/                  # Módulo de Autenticação
│   │   ├── domain/           # Entidades, providers, repositórios
│   │   ├── application/      # Use Cases (casos de uso)
│   │   └── infra/            # Controllers, DTOs, database, JWT
│   │
│   ├── gabbeuty-crm/         # Módulo CRM (Clientes, Serviços, Agendamentos)
│   │   ├── domain/           # Entidades, eventos, value objects
│   │   │   ├── entities/     # Appointment, Client, BusinessService
│   │   │   ├── events/       # Domain Events (Created, Confirmed, etc)
│   │   │   ├── repositories/ # Interfaces dos repositórios
│   │   │   └── services/     # Serviços de domínio
│   │   ├── application/      # Use Cases (create, fetch, update, delete)
│   │   │   └── handlers/     # Event Handlers (WhatsApp notifications)
│   │   └── infra/            # Controllers, DTOs, Prisma, Queue
│   │
│   └── whatsapp/             # Módulo WhatsApp
│       ├── domain/           # Entidades (WhatsAppSession)
│       ├── application/      # Use Cases (connect, send, disconnect)
│       └── infra/            # Controllers, Baileys provider, Queue
│
├── infra/                     # Infraestrutura global
│   ├── database/             # Prisma provider
│   └── queue/                # Bull queue config
│
├── app.module.ts             # Módulo raiz
├── main.ts                   # Bootstrap da aplicação
└── env.ts                    # Validação de variáveis de ambiente
```

### 🎯 Camadas da Arquitetura

#### 1️⃣ **Domain Layer (Domínio)**

- **Entities**: Lógica de negócio pura (Appointment, Client, BusinessService)
- **Value Objects**: Objetos imutáveis (AppointmentStatus, PhoneNumber)
- **Domain Events**: Eventos de domínio (AppointmentCreated, AppointmentConfirmed)
- **Repositories Interfaces**: Contratos para acesso a dados
- **Domain Services**: Lógica complexa que não pertence a uma entidade

#### 2️⃣ **Application Layer (Aplicação)**

- **Use Cases**: Casos de uso da aplicação (CreateAppointment, FetchClients)
- **Event Handlers**: Manipuladores de eventos de domínio
- **DTOs**: Data Transfer Objects para comunicação entre camadas

#### 3️⃣ **Infrastructure Layer (Infraestrutura)**

- **Controllers**: Endpoints HTTP (REST API)
- **Database**: Implementação Prisma dos repositórios
- **Queue**: Sistema de filas Bull/Redis
- **Providers**: Implementações concretas (Hash, JWT, WhatsApp)

### 🔄 Fluxo de Dados

```
HTTP Request → Controller → Use Case → Domain Entity → Repository → Database
                                ↓
                          Domain Event → Event Handler → Queue → WhatsApp Provider
```

### 🎪 Domain Events

O sistema utiliza **Domain Events** para comunicação entre módulos:

```typescript
// Fluxo de Eventos
AppointmentCreated → WhatsApp Notification (Novo agendamento)
AppointmentConfirmed → WhatsApp Notification (Confirmação)
AppointmentCanceled → WhatsApp Notification (Cancelamento)
AppointmentPatched → WhatsApp Notification (Alteração)
```

---

## 🛠️ Tecnologias

### Backend Core

- **[NestJS](https://nestjs.com/)** - Framework Node.js progressivo
- **[TypeScript](https://www.typescriptlang.org/)** - JavaScript tipado
- **[Prisma](https://www.prisma.io/)** - ORM moderno para TypeScript
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional

### Autenticação & Segurança

- **[Passport JWT](https://www.passportjs.org/)** - Estratégia JWT
- **[bcrypt](https://github.com/kelektiv/node.bcrypt.js)** - Hash de senhas
- **[class-validator](https://github.com/typestack/class-validator)** - Validação de DTOs
- **[class-transformer](https://github.com/typestack/class-transformer)** - Transformação de dados

### WhatsApp Integration

- **[Whaileys](https://github.com/whiskeysockets/baileys)** - Biblioteca WhatsApp Web
- **[qrcode](https://github.com/soldair/node-qrcode)** - Geração de QR Codes

### Queue & Background Jobs

- **[Bull](https://github.com/OptimalBits/bull)** - Sistema de filas robusto
- **[Bull Board](https://github.com/felixmosh/bull-board)** - Dashboard visual para filas

### Documentação

- **[@nestjs/swagger](https://docs.nestjs.com/openapi/introduction)** - OpenAPI/Swagger
- Documentação interativa em `/api/docs`

### Testes

- **[Vitest](https://vitest.dev/)** - Framework de testes moderno
- **[Supertest](https://github.com/visionmedia/supertest)** - Testes HTTP
- **[@faker-js/faker](https://fakerjs.dev/)** - Geração de dados fake

### Utilitários

- **[Zod](https://zod.dev/)** - Validação de schemas TypeScript
- **[date-fns](https://date-fns.org/)** - Manipulação de datas
- **[Pino](https://getpino.io/)** - Logger de alta performance

---

## 📦 Instalação

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Redis (para filas Bull)
- npm ou yarn

### 1️⃣ Clone o repositório

```bash
git clone https://github.com/Lukas-Rodrigo/gabbeuty.git
cd gabbeuty
```

### 2️⃣ Instale as dependências

```bash
npm install
```

### 3️⃣ Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/gabbeuty?schema=public"

# Server
PORT=3333
NODE_ENV=development

# JWT
JWT_PRIVATE_KEY="sua-chave-privada-base64"
JWT_PUBLIC_KEY="sua-chave-publica-base64"
```

#### Gerando chaves JWT

```bash
# Gerar par de chaves RSA
openssl genrsa -out private.key 2048
openssl rsa -in private.key -pubout -out public.key

# Converter para Base64
cat private.key | base64 -w 0
cat public.key | base64 -w 0
```

### 4️⃣ Execute as migrations do Prisma

```bash
npx prisma migrate dev
```

### 5️⃣ (Opcional) Gere o Prisma Client

```bash
npx prisma generate
```

### 6️⃣ Inicie o servidor de desenvolvimento

```bash
npm run start:dev
```

O servidor estará rodando em `http://localhost:3333` 🚀

---

## 📚 Documentação da API

A documentação completa da API está disponível via **Swagger UI**:

🔗 **http://localhost:3333/api/docs**

### Principais Endpoints

#### 🔐 Autenticação

```http
POST   /auth/register        # Registrar novo profissional
POST   /auth/login           # Login (retorna access + refresh token)
POST   /auth/refresh         # Renovar access token
POST   /auth/logout          # Logout (invalida refresh token)
```

#### 👥 Clientes

```http
POST   /clients              # Criar novo cliente
GET    /clients              # Listar clientes (com paginação)
PATCH  /clients/:id          # Atualizar cliente
DELETE /clients/:id          # Deletar cliente (soft delete)
```

#### 💼 Serviços

```http
POST   /business-services           # Criar novo serviço
GET    /business-services           # Listar serviços
PATCH  /business-services/:id       # Atualizar serviço
DELETE /business-services/:id       # Deletar serviço
```

#### 📅 Agendamentos

```http
POST   /appointments                # Criar agendamento
GET    /appointments                # Listar agendamentos
PATCH  /appointments/:id            # Atualizar agendamento
GET    /appointments/status         # Contar por status
GET    /appointments/metrics        # Métricas de performance
GET    /appointments/invoicing      # Faturamento por período
```

#### 📱 WhatsApp

```http
POST   /whatsapp                    # Criar sessão WhatsApp
POST   /whatsapp/disconnect         # Desconectar sessão
```

### Autenticação

Todos os endpoints (exceto `/auth/register` e `/auth/login`) requerem autenticação via **Bearer Token**:

```bash
curl -X GET http://localhost:3333/clients \
  -H "Authorization: Bearer seu-access-token"
```

---

## 🧪 Testes

O projeto possui cobertura completa de testes:

### Executar testes unitários

```bash
npm run test
```

**Resultado**: 71 testes unitários ✅

### Executar testes E2E

```bash
npm run test:e2e
```

**Resultado**: 55 testes E2E ✅

### Executar testes com coverage

```bash
npm run test:cov
```

### Executar testes em modo watch

```bash
npm run test:watch
```

### Estrutura de Testes

```
test/
├── e2e/                           # Testes End-to-End
│   ├── auth-module/              # Testes de autenticação
│   ├── gabbeuty-crm-module/      # Testes de CRM
│   ├── whatsapp-module/          # Testes de WhatsApp
│   └── _helpers/                 # Helpers para testes
│
├── factories/                     # Factories para criação de dados
│   ├── make-appointment.ts
│   ├── make-client.ts
│   └── make-user.ts
│
└── repositories/                  # Repositórios in-memory
    ├── in-memory-appointments-repository.ts
    ├── in-memory-clients-repository.ts
    └── in-memory-business-services-repository.ts
```

---

## 🗄️ Banco de Dados

### Schema Prisma

```prisma
// Usuários (Profissionais)
model User {
  id            String         @id
  name          String
  email         String         @unique
  passwordHash  String
  createdAt     DateTime       @default(now())
}

// Clientes
model Client {
  id             String        @id @default(uuid())
  name           String
  phoneNumber    String
  observation    String?
  profileUrl     String?
  professionalId String
  createdAt      DateTime      @default(now())
  deletedAt      DateTime?
}

// Serviços
model BusinessService {
  id             String        @id @default(uuid())
  name           String
  price          Decimal
  duration       Int           @default(60)
  professionalId String
  createdAt      DateTime      @default(now())
  deletedAt      DateTime?
}

// Agendamentos
model Appointment {
  id             String               @id @default(uuid())
  title          String
  date           DateTime
  status         AppointmentStatus
  clientId       String
  professionalId String
  createdAt      DateTime             @default(now())
}

// Sessões WhatsApp
model WhatsappSession {
  id             String         @id @default(uuid())
  userId         String         @unique
  phoneNumber    String?
  status         SessionStatus  @default(DISCONNECTED)
  retryCount     Int            @default(0)
  maxRetries     Int            @default(3)
  lastActivity   DateTime       @default(now())
  connectedAt    DateTime?
  disconnectedAt DateTime?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
}
```

### Executar Prisma Studio (Interface Visual)

```bash
npx prisma studio
```

---

## 📊 Scripts Disponíveis

```json
{
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:prod": "node dist/main",
  "build": "nest build",
  "test": "vitest run",
  "test:watch": "vitest --watch",
  "test:cov": "vitest run --coverage",
  "test:e2e": "vitest run --config ./vitest.config.e2e.ts",
  "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
  "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\""
}
```

---

## 🔐 Segurança

### Implementações de Segurança

- ✅ **JWT com RSA-256** - Tokens assinados com chave privada
- ✅ **Bcrypt** - Hash seguro de senhas (custo 10)
- ✅ **Refresh Token** - Tokens de curta duração + renovação
- ✅ **Validation Pipe** - Validação automática de DTOs
- ✅ **Guards** - Proteção de rotas com JWT Strategy
- ✅ **Exception Filters** - Tratamento global de erros
- ✅ **CORS** - Configurado para produção

### Recomendações de Produção

```typescript
// Habilitar CORS
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
});

// Rate limiting
import rateLimit from 'express-rate-limit';
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requisições
  }),
);

// Helmet (headers de segurança)
import helmet from 'helmet';
app.use(helmet());
```

---

## 🚢 Deploy

### Variáveis de Ambiente (Produção)

```env
DATABASE_URL="postgresql://..."
PORT=3333
NODE_ENV=production
JWT_PRIVATE_KEY="..."
JWT_PUBLIC_KEY="..."
REDIS_URL="redis://..."
```

### Build para Produção

```bash
npm run build
npm run start:prod
```

### Docker (Em breve)

```dockerfile
# Dockerfile em desenvolvimento
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, siga estas etapas:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Padrões de Commit

```
Add: Nova funcionalidade
Fix: Correção de bug
Refactor: Refatoração de código
Docs: Documentação
Test: Adição de testes
Style: Formatação
Perf: Melhorias de performance
```

---

## 📝 Roadmap

### ✅ Implementado

- [x] Autenticação JWT completa
- [x] CRUD de Clientes
- [x] CRUD de Serviços
- [x] CRUD de Agendamentos
- [x] Integração WhatsApp
- [x] Domain Events
- [x] Sistema de Filas
- [x] Documentação Swagger
- [x] Testes Unitários e E2E

### 🔜 Próximas Features

- [ ] Dashboard administrativo
- [ ] Relatórios PDF
- [ ] Notificações por e-mail
- [ ] Lembretes automáticos (1 dia antes)
- [ ] Histórico de conversas WhatsApp
- [ ] Calendário visual de agendamentos
- [ ] Integração com Google Calendar
- [ ] Multi-idioma (i18n)
- [ ] Upload de fotos de clientes
- [ ] Sistema de comissões
- [ ] Integração com pagamentos (Stripe/PayPal)

---

## 👨‍💻 Autor

**Lucas Teixeira**

- GitHub: [@Lukas-Rodrigo](https://github.com/Lukas-Rodrigo)
- LinkedIn: [Lucas Teixeira](https://linkedin.com/in/seu-perfil)

---

## 🙏 Agradecimentos

- [NestJS](https://nestjs.com/) - Framework incrível
- [Prisma](https://www.prisma.io/) - ORM moderno
- [Baileys](https://github.com/whiskeysockets/baileys) - WhatsApp Web API
- Comunidade Open Source

---

<div align="center">

**⭐ Se este projeto foi útil, considere dar uma estrela!**

**Feito com ❤️ e TypeScript**

</div>
