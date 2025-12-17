# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### 🔜 Em Desenvolvimento

- Dashboard administrativo
- Relatórios em PDF
- Notificações por email
- Sistema de lembretes automáticos

---

## [0.1.0] - 2025-12-17

### ✨ Adicionado

#### Core Features

- **Autenticação JWT Completa**
  - Sistema de registro de usuários (profissionais)
  - Login com access token e refresh token
  - Renovação automática de tokens
  - Logout seguro com invalidação de tokens

- **Gestão de Clientes**
  - CRUD completo de clientes
  - Sistema de paginação
  - Filtros por data
  - Soft delete (exclusão lógica)
  - Campos: nome, telefone, observações, foto de perfil

- **Gestão de Serviços**
  - CRUD completo de serviços de beleza
  - Definição de preço e duração
  - Associação com profissionais
  - Histórico de serviços prestados
  - Soft delete

- **Gestão de Agendamentos**
  - Criação de agendamentos com múltiplos serviços
  - Status: Pendente, Confirmado, Cancelado, Concluído
  - Validação de datas (não permite datas passadas)
  - Cálculo automático de duração total
  - Cálculo automático de valor total
  - Associação com cliente e profissional

- **Integração WhatsApp**
  - Conexão via QR Code usando Baileys
  - Gestão de sessões (conectar/desconectar)
  - Sistema de retry automático
  - Status de conexão em tempo real
  - Envio de mensagens automáticas

- **Sistema de Notificações**
  - Notificação automática de novo agendamento
  - Notificação de confirmação de agendamento
  - Notificação de cancelamento
  - Notificação de alteração de agendamento
  - Fila de processamento com Bull/Redis

#### Métricas e Relatórios

- Contagem de agendamentos por status
- Métricas de performance (taxa de confirmação, cancelamento)
- Cálculo de faturamento por período
- Filtros customizados por data

#### Arquitetura

- **Clean Architecture** implementada
- **Domain-Driven Design (DDD)** aplicado
- **Domain Events** para comunicação entre módulos
- **Repository Pattern** com Prisma
- **Use Cases** bem definidos
- **Aggregate Roots** e **Entities**
- **Value Objects** imutáveis

#### Infraestrutura

- Sistema de filas com Bull
- Dashboard Bull Board para monitoramento
- Global Exception Filters
- Validation Pipes automáticos
- JWT Strategy com Passport
- Hash de senhas com bcrypt

#### Documentação

- **Swagger/OpenAPI** completo
  - Todos os 20 endpoints documentados
  - Exemplos de request/response
  - Schemas de validação
  - Tags organizadas por módulo
- Documentação do Swagger em `/api/docs`
- 5 guias de documentação criados
- README completo
- Guia de contribuição (CONTRIBUTING.md)

#### Testes

- **71 testes unitários** implementados
  - Testes de Use Cases
  - Testes de Entidades
  - Repositórios in-memory
- **55 testes E2E** implementados
  - Testes de integração completos
  - Testes de autenticação
  - Testes de CRUD
  - Testes de WhatsApp
- Cobertura de código
- Factories para geração de dados de teste
- Helpers para testes E2E

#### Database

- Schema Prisma completo
- Migrations configuradas
- 6 models principais:
  - User (profissionais)
  - Client (clientes)
  - BusinessService (serviços)
  - Appointment (agendamentos)
  - AppointmentService (relacionamento N:N)
  - WhatsappSession (sessões WhatsApp)
  - RefreshToken (tokens de renovação)
- Indexes otimizados
- Soft delete implementado

### 🛠️ Tecnologias Utilizadas

#### Backend

- NestJS 11.x
- TypeScript 5.7
- Node.js 18+
- Prisma 7.x
- PostgreSQL 14+

#### Autenticação

- Passport JWT
- bcrypt 6.x
- JSON Web Tokens

#### WhatsApp

- Whaileys (Baileys) 6.x
- QRCode generation

#### Queue

- Bull 4.x
- Bull Board 6.x
- Redis

#### Testes

- Vitest 4.x
- Supertest 7.x
- Faker.js 10.x

#### Documentação

- Swagger/OpenAPI 3.0
- @nestjs/swagger 11.x

#### Validação

- class-validator
- class-transformer
- Zod

### 📝 Commits Iniciais

- Add: Estrutura inicial do projeto com NestJS
- Add: Configuração do Prisma e PostgreSQL
- Add: Módulo de autenticação com JWT
- Add: Módulo de clientes (CRM)
- Add: Módulo de serviços (Business Services)
- Add: Módulo de agendamentos (Appointments)
- Add: Integração WhatsApp com Baileys
- Add: Sistema de Domain Events
- Add: Sistema de filas com Bull
- Add: Documentação completa com Swagger
- Add: 71 testes unitários
- Add: 55 testes E2E
- Docs: README completo e profissional
- Docs: Guia de contribuição
- Docs: Arquivo .env.example

### 🔧 Configurações

- ESLint configurado
- Prettier configurado
- Vitest configurado (unit + E2E)
- Prisma configurado
- Swagger configurado
- Global filters configurados
- Validation pipes configurados

### 📦 Estrutura de Pastas

```
src/
├── _shared/           # Código compartilhado
├── modules/
│   ├── auth/         # Autenticação
│   ├── gabbeuty-crm/ # CRM (Clientes, Serviços, Agendamentos)
│   └── whatsapp/     # Integração WhatsApp
├── infra/            # Infraestrutura (Database, Queue)
├── app.module.ts     # Módulo principal
└── main.ts          # Bootstrap
```

---

## Tipos de Mudanças

- ✨ **Added** - Nova funcionalidade
- 🔧 **Changed** - Mudança em funcionalidade existente
- 🗑️ **Deprecated** - Funcionalidade que será removida
- ❌ **Removed** - Funcionalidade removida
- 🐛 **Fixed** - Correção de bug
- 🔒 **Security** - Vulnerabilidade corrigida

---

[Unreleased]: https://github.com/Lukas-Rodrigo/gabbeuty/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Lukas-Rodrigo/gabbeuty/releases/tag/v0.1.0
