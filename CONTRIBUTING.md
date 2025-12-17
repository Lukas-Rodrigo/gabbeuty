# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o **Gabbeuty**! Este documento fornece diretrizes para contribuir com o projeto.

## 📋 Índice

- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Padrões de Código](#padrões-de-código)
- [Padrões de Commit](#padrões-de-commit)
- [Pull Request](#pull-request)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Melhorias](#sugerir-melhorias)

---

## 🚀 Como Contribuir

### 1. Fork o Repositório

Clique no botão "Fork" no canto superior direito do repositório.

### 2. Clone seu Fork

```bash
git clone https://github.com/seu-usuario/gabbeuty.git
cd gabbeuty
```

### 3. Adicione o Repositório Original como Remote

```bash
git remote add upstream https://github.com/Lukas-Rodrigo/gabbeuty.git
```

### 4. Crie uma Branch

```bash
git checkout -b feature/minha-feature
# ou
git checkout -b fix/meu-bug-fix
```

### 5. Faça suas Alterações

Implemente sua feature ou correção seguindo os [padrões de código](#padrões-de-código).

### 6. Execute os Testes

```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Verificar lint
npm run lint
```

### 7. Commit suas Alterações

```bash
git add .
git commit -m "Add: Nova funcionalidade X"
```

### 8. Push para seu Fork

```bash
git push origin feature/minha-feature
```

### 9. Abra um Pull Request

Vá para o repositório original e clique em "New Pull Request".

---

## 🛠️ Configuração do Ambiente

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Redis (opcional, para filas)
- Git

### Instalação

```bash
# Instalar dependências
npm install

# Copiar .env.example
cp .env.example .env

# Configurar variáveis de ambiente no .env

# Executar migrations
npx prisma migrate dev

# Iniciar servidor de desenvolvimento
npm run start:dev
```

---

## 📝 Padrões de Código

### Arquitetura

O projeto segue **Clean Architecture** e **Domain-Driven Design (DDD)**:

```
src/
├── modules/
│   └── [module-name]/
│       ├── domain/           # Entidades, eventos, repositórios
│       ├── application/      # Use cases, handlers
│       └── infra/            # Controllers, DTOs, database
```

### Estrutura de Arquivos

#### Entidades (Domain)

```typescript
// src/modules/module-name/domain/entities/example.entity.ts
import { Entity } from '@/_shared/entities/base-entity.entity';

export interface ExampleProps {
  name: string;
  // ...
}

export class Example extends Entity<ExampleProps> {
  static create(props: ExampleProps, id?: string) {
    return new Example(props, id);
  }

  // Getters
  get name() {
    return this.props.name;
  }

  // Business logic methods
  updateName(name: string) {
    this.props.name = name;
  }
}
```

#### Use Cases (Application)

```typescript
// src/modules/module-name/application/use-cases/create-example.use-case.ts
import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/_shared/either';

export interface CreateExampleRequest {
  name: string;
}

type CreateExampleResponse = Either<Error, { example: Example }>;

@Injectable()
export class CreateExampleUseCase {
  constructor(private exampleRepository: ExampleRepository) {}

  async execute(request: CreateExampleRequest): Promise<CreateExampleResponse> {
    // Implementation
  }
}
```

#### Controllers (Infrastructure)

```typescript
// src/modules/module-name/infra/http/controllers/example.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Examples')
@Controller('examples')
export class ExampleController {
  constructor(private createExampleUseCase: CreateExampleUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Create a new example' })
  async create(@Body() body: CreateExampleDto) {
    const result = await this.createExampleUseCase.execute(body);

    if (result.isLeft()) {
      throw mapDomainErrorToHttpException(result.value);
    }

    return result.value;
  }
}
```

### Testes

#### Testes Unitários

```typescript
// src/modules/module-name/application/use-cases/create-example.use-case.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';

describe('[Unit] CreateExampleUseCase', () => {
  let sut: CreateExampleUseCase;
  let repository: InMemoryExampleRepository;

  beforeEach(() => {
    repository = new InMemoryExampleRepository();
    sut = new CreateExampleUseCase(repository);
  });

  it('should create an example successfully', async () => {
    const result = await sut.execute({ name: 'Test' });

    expect(result.isRight()).toBe(true);
  });
});
```

#### Testes E2E

```typescript
// test/e2e/module-name/create-example.e2e-spec.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

describe('Create Example (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Setup
  });

  afterAll(async () => {
    // Cleanup
  });

  it('[POST] /examples', async () => {
    const response = await request(app.getHttpServer())
      .post('/examples')
      .send({ name: 'Test' })
      .expect(201);

    expect(response.body).toHaveProperty('id');
  });
});
```

### Naming Conventions

- **Arquivos**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Interfaces**: `PascalCase` (prefixo `I` opcional)
- **Variáveis/Funções**: `camelCase`
- **Constantes**: `UPPER_SNAKE_CASE`

### Formatação

```bash
# Verificar formatação
npm run lint

# Corrigir automaticamente
npm run lint --fix

# Formatar com Prettier
npm run format
```

---

## 📝 Padrões de Commit

Usamos **Conventional Commits** para mensagens de commit:

### Formato

```
<type>: <description>

[optional body]

[optional footer]
```

### Tipos

- **Add**: Nova funcionalidade
- **Fix**: Correção de bug
- **Refactor**: Refatoração de código
- **Docs**: Alterações na documentação
- **Test**: Adição ou alteração de testes
- **Style**: Formatação, ponto e vírgula, etc
- **Perf**: Melhorias de performance
- **Chore**: Atualização de dependências, configuração, etc

### Exemplos

```bash
# Nova funcionalidade
git commit -m "Add: Sistema de notificações por email"

# Correção de bug
git commit -m "Fix: Validação de data em agendamentos"

# Refatoração
git commit -m "Refactor: Simplificar lógica de cálculo de faturamento"

# Documentação
git commit -m "Docs: Adicionar exemplos de uso da API"

# Testes
git commit -m "Test: Adicionar testes para CreateAppointmentUseCase"

# Performance
git commit -m "Perf: Otimizar query de busca de clientes"
```

---

## 🔃 Pull Request

### Checklist

Antes de abrir um PR, certifique-se de que:

- [ ] ✅ O código segue os padrões do projeto
- [ ] ✅ Todos os testes passam (`npm run test` e `npm run test:e2e`)
- [ ] ✅ Novos testes foram adicionados para novas funcionalidades
- [ ] ✅ O lint passa sem erros (`npm run lint`)
- [ ] ✅ A documentação foi atualizada (se necessário)
- [ ] ✅ O commit segue os padrões de mensagem
- [ ] ✅ Não há conflitos com a branch `main`

### Template de PR

```markdown
## Descrição

Breve descrição das alterações realizadas.

## Tipo de Mudança

- [ ] 🐛 Bug fix (mudança que corrige um problema)
- [ ] ✨ Nova feature (mudança que adiciona funcionalidade)
- [ ] 💥 Breaking change (mudança que quebra compatibilidade)
- [ ] 📝 Documentação
- [ ] ♻️ Refatoração

## Como Testar

1. Passo 1
2. Passo 2
3. ...

## Screenshots (se aplicável)

## Checklist

- [ ] Meu código segue os padrões do projeto
- [ ] Revisei meu próprio código
- [ ] Comentei em partes complexas do código
- [ ] Atualizei a documentação
- [ ] Minhas mudanças não geram novos warnings
- [ ] Adicionei testes que provam que meu fix funciona
- [ ] Testes unitários e E2E passam localmente
```

---

## 🐛 Reportar Bugs

### Antes de Reportar

1. Verifique se o bug já foi reportado nas [Issues](https://github.com/Lukas-Rodrigo/gabbeuty/issues)
2. Certifique-se de que você está usando a última versão
3. Colete informações sobre o bug

### Template de Bug Report

```markdown
**Descrição do Bug**
Uma descrição clara e concisa do bug.

**Como Reproduzir**
Passos para reproduzir o comportamento:

1. Vá para '...'
2. Clique em '....'
3. Role para baixo até '....'
4. Veja o erro

**Comportamento Esperado**
Descrição clara do que você esperava que acontecesse.

**Screenshots**
Se aplicável, adicione screenshots para ajudar a explicar o problema.

**Ambiente**

- OS: [e.g. macOS, Windows, Linux]
- Node.js version: [e.g. 18.0.0]
- PostgreSQL version: [e.g. 14.0]

**Informações Adicionais**
Qualquer outra informação relevante sobre o problema.
```

---

## 💡 Sugerir Melhorias

### Template de Feature Request

```markdown
**A feature está relacionada a um problema? Descreva.**
Uma descrição clara do problema. Ex: Sempre fico frustrado quando [...]

**Descreva a solução que você gostaria**
Uma descrição clara do que você quer que aconteça.

**Descreva alternativas consideradas**
Descrição de soluções ou features alternativas que você considerou.

**Contexto Adicional**
Qualquer outro contexto ou screenshots sobre a feature request.
```

---

## 📚 Recursos Úteis

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

## 💬 Comunicação

- **Issues**: Para bugs e feature requests
- **Discussions**: Para perguntas gerais e discussões
- **Email**: [seu-email@exemplo.com]

---

## 🙏 Obrigado!

Suas contribuições tornam o **Gabbeuty** melhor para todos! 🚀

---

<div align="center">

**Feito com ❤️ pela comunidade**

</div>
