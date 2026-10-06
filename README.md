# template-nestjs-cleanarch

Template NestJS (Fastify + Prisma + PostgreSQL) com Clean Architecture, Swagger e configuração do Claude Code (`CLAUDE.md`).

Inclui uma entidade de exemplo — **User** (`name`, `last_name`, `username`, `email`, senha) — com CRUD completo.

## Como rodar

```bash
npm install
cp .env.example .env        # ajuste DATABASE_URL
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

- API: http://localhost:3000
- Swagger: http://localhost:3000/api/docs
- Health: http://localhost:3000/api/health

Com Docker: `docker compose up -d --build` (API + PostgreSQL).

## Estrutura

```
src/
├── domain/           # entidades e interfaces de repositório
├── application/      # use cases e DTOs
├── infrastructure/   # Prisma, auth (JWT/bcrypt), repositórios
└── presentation/     # controllers, guards, decorators, swagger
```

Veja o `CLAUDE.md` para convenções e o passo a passo de como adicionar uma nova entidade.
