# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Template NestJS Clean Architecture** is a starter backend: NestJS 11 + Fastify + Prisma/PostgreSQL organized in Clean Architecture layers, with JWT/bcrypt building blocks and Swagger docs. It ships with a single example entity, **User**, with full CRUD — use it as the reference pattern when adding new modules.

## Development Commands

### Start the app
- **Development** (hot reload): `npm run start:dev`
- **Debug mode**: `npm run start:debug`
- **Production build**: `npm run build`
- **Run built app**: `npm run start:prod`

### Testing
- **Run all tests**: `npm run test`
- **Watch mode**: `npm run test:watch`
- **Coverage report**: `npm run test:cov`
- **Run a single test**: `npm run test -- <pattern>` (e.g., `npm run test -- create-user`)

### Database
- **Generate Prisma client**: `npx prisma generate`
- **Create a migration (dev)**: `npx prisma migrate dev --name <name>`
- **Deploy migrations**: `npx prisma migrate deploy`
- **Push schema to DB** (no migration history): `npx prisma db push`

### Code quality
- **Lint + fix**: `npm run lint`
- **Format code**: `npm run format`

### Swagger
- **Export `swagger.json`**: `npm run swagger:generate` (git-ignored; needs a reachable `DATABASE_URL` because the app boots fully)

### Docker
- **Start API + PostgreSQL**: `docker compose up -d --build`
  - API runs on port 3000, PostgreSQL on 5432
  - The container entrypoint runs `prisma migrate deploy` before starting

## Architecture Overview

Four layers, dependencies pointing inwards (`presentation → application → domain`; `infrastructure` implements `domain` interfaces):

```
src/
├── domain/           # Entities, repository interfaces, pagination types (no framework deps)
├── application/      # Use cases and DTOs (business logic orchestration)
├── infrastructure/   # Prisma/database, auth services (JWT, bcrypt), repository implementations
└── presentation/     # Controllers, guards, decorators, middlewares, Swagger config
```

### Core flow
**HTTP Request** → **Controller** → **Use Case** → **Repository (interface)** → **Prisma** → **Response**

### Key infrastructure
- **Framework**: NestJS 11 with the **Fastify** adapter (not Express) — affects plugin registration; middlewares receive raw Node `IncomingMessage`/`ServerResponse`
- **Database**: Prisma 5 + PostgreSQL (`PrismaService` extends `PrismaClient`, connects on module init)
- **Auth building blocks**: `HashService` (bcrypt), `JwtTokenService`, `JwtStrategy` (Passport) in `infrastructure/auth`. There is **no login endpoint** in the template yet.
- **Validation**: class-validator + class-transformer, global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`) in `main.ts`
- **Docs**: `@nestjs/swagger` with the Nest CLI plugin enabled (`nest-cli.json`), served at `/api/docs`

## Domain Model

- **User**: `id` (uuid), `name`, `last_name`, `username` (unique), `email` (unique), `password_hash`, `created_at`, `updated_at`. Table `users`. The hash is never returned — responses go through `toUserResponse` (`application/use-cases/users/user-response.mapper.ts`).

### Users module (reference implementation)
| Layer | File |
|---|---|
| Entity | `src/domain/entities/users/user.entity.ts` |
| Repository interface | `src/domain/repositories/users/user.repository.ts` |
| Repository impl | `src/infrastructure/repositories/users/user.repository.ts` |
| DTOs | `src/application/dto/users/user.dto.ts` |
| Use cases | `src/application/use-cases/users/` — `CreateUserUseCase`, `ListUserUseCase`, `GetUserByIdUseCase`, `UpdateUserUseCase`, `DeleteUserUseCase` |
| Controller | `src/presentation/controllers/users/user.controller.ts` |

Endpoints: `POST /users`, `GET /users?limit=&offset=&search=`, `GET /users/:id`, `PATCH /users/:id`, `DELETE /users/:id` (204). Username/email collisions → `409`; unknown id → `404`; `:id` is validated with `ParseUUIDPipe`.

## Configuration

Copy `.env.example` → `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/clean_arch_db"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRATION="7d"          # seconds, or <n>[smhd]
NODE_ENV="development"
PORT=3000
CORS_ORIGIN="*"              # "*" or comma-separated origins
```

`JWT_SECRET` falls back to `'secret'` if unset — always set it outside local development.

## Guards and Decorators

- **`@Public()`** (`presentation/decorators/public.decorator.ts`) — marks a route as skipping JWT auth
- **`JwtAuthGuard`** — validates the JWT, honoring `@Public()`. **Not registered globally by default**: the template's user endpoints are open. To protect the whole API, add `{ provide: APP_GUARD, useClass: JwtAuthGuard }` to `providers` in `app.module.ts` (the commented hint is there), and add a login use case first or nobody can obtain a token.
- **`JwtGuard`** — plain `AuthGuard('jwt')` for per-route `@UseGuards(JwtGuard)`

## Error Handling

Throw Nest HTTP exceptions from use cases; the default exception filter formats them:
`BadRequestException` → 400 (validation errors come as an array), `UnauthorizedException` → 401, `ForbiddenException` → 403, `NotFoundException` → 404, `ConflictException` → 409. User-facing messages are in Portuguese.

## Conventions

- **Repository DI**: interfaces live in `domain/repositories`; tokens (e.g. `IUserRepositoryToken`) are exported from `infrastructure/database/database.module.ts`; use cases inject with `@Inject(Token)` and `import type` for the interface (required by `isolatedModules` + `emitDecoratorMetadata`)
- **Use cases**: one class per file, `<operation>.use-case.ts`, single public `execute()` method; exported through the `index.ts` barrels
- **Naming**: DB/entity fields are `snake_case` (`last_name`, `created_at`); files are kebab-case
- **Swagger**: put `@ApiProperty`/`@ApiPropertyOptional` (with `example`) on DTO fields and `@ApiTags`/`@ApiOperation`/`@Api*Response` on controllers. Title/version live in `presentation/swagger/swagger.config.ts`, shared by `main.ts` and `tools/generate-swagger.ts`
- **Tests**: Jest, files alongside source as `src/**/*.spec.ts`; unit-test use cases with a hand-mocked repository (see `create-user.use-case.spec.ts`)
- **Formatting**: Prettier (single quotes, trailing commas); ESLint with type-checked `typescript-eslint` — keep `npm run lint` clean

## Common workflows

### Adding a new entity (follow the Users module)
1. Add the model to `prisma/schema.prisma`, then `npx prisma migrate dev --name <name>`
2. Entity in `src/domain/entities/<entity>/<entity>.entity.ts` and export it from `entities/index.ts`
3. Repository interface in `src/domain/repositories/<entity>/<entity>.repository.ts`
4. Implementation in `src/infrastructure/repositories/<entity>/<entity>.repository.ts`; export it from `repositories/index.ts`
5. Register it in `DatabaseModule` with a new `I<Entity>RepositoryToken` (provide + export)
6. DTOs in `src/application/dto/<entity>/`, use cases in `src/application/use-cases/<entity>/` (+ barrel exports)
7. Controller in `src/presentation/controllers/<entity>/`; export it from `controllers/index.ts`
8. Register the controller and use cases in `app.module.ts`

### Running locally
1. `npm install`
2. `cp .env.example .env` (adjust `DATABASE_URL`)
3. `npx prisma generate`
4. `npx prisma migrate deploy`
5. `npm run start:dev`
6. Visit http://localhost:3000/api/docs

## Claude Code setup (`.claude/`)

Installed from [`blencorp/claude-code-kit`](https://github.com/blencorp/claude-code-kit) and then pruned: the kit targets other stacks (Express, React/MUI, monorepos), so anything that contradicted this template's architecture was removed. **Do not reinstall the full kit over it** — that would bring back skills telling Claude to use Express patterns, `routes → controllers → services → repositories`, or a static `PrismaService.main`, none of which apply here.

**Kept**
- `agents/` — generic workflow agents: `auto-error-resolver`, `code-refactor-master`, `documentation-architect`, `plan-reviewer`, `principal-engineer`, `refactor-planner`, `web-research-specialist`
- `commands/` — `/plan`, `/dev-docs`, `/dev-docs-update`
- `hooks/` — wired in `settings.json`: `skill-activation-prompt` (UserPromptSubmit; suggests agents/skills from `skills/skill-rules.json`) and `post-tool-use-tracker` (PostToolUse; tracks edited files in `.claude/tsc-cache/`, git-ignored). Needs `jq`; hook dependencies are installed in `.claude/hooks/node_modules` (git-ignored)
- `skills/` — intentionally **empty**; only `skill-rules.json` remains (no skill entries, agent triggers only). Add project-specific skills here, matching this repo's layers

**Removed as misaligned** (don't re-add): skills `express`, `nodejs`, `prisma`, `skill-developer`; agents `auth-route-tester`, `auth-route-debugger`, `code-architecture-reviewer`; commands `/test-route`, `/route-research-for-testing`, `/build-and-fix`, `/code-review` (also shadowed the built-in `/code-review`); the `auto-accept` edit/write permissions in `settings.json`

**Known leftovers**: `hooks/tsc-check.sh`, `hooks/stop-build-check-enhanced.sh` and `hooks/trigger-build-resolver.sh` are not wired in `settings.json` and hardcode a monorepo service list (`email`, `form`, `frontend`, ...) — they would need adapting before being enabled. `principal-engineer` triggers on very common words (`create`, `fix`, `build`, ...) and is only a suggestion.

## Known constraints

- **npm install**: the lockfile pins versions that match the original `requisicao-produtos-api`. A fresh resolve without it hits a peer-dependency conflict (`@nestjs/platform-fastify` wants `@fastify/static@^10`, `@nestjs/swagger` allows `^8 || ^9 || ^10`) — keep `package-lock.json`, or bump `@fastify/static` to `^10` if upgrading Nest
- **Prisma 5 postinstall**: run `npx prisma generate` manually if `npm install` skipped lifecycle scripts
- **Fastify trailing slashes**: routes are stricter than with Express
