# Developer guide

## Conventions

- **TypeScript strict mode** everywhere — `any` is disallowed by ESLint (`@typescript-eslint/no-explicit-any: error`) on both workspaces.
- **Commits** follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`), enforced by commitlint via a `commit-msg` git hook.
- **Pre-commit** runs `lint-staged` (ESLint + Prettier on staged files) via Husky.
- No `console.log` left in committed code (`no-console` ESLint rule, `warn`/`error` allowed).

## Backend: adding a new resource

Follow the existing layering (see [ARCHITECTURE.md](ARCHITECTURE.md)). Example: adding a `Tag` resource.

1. **Model** — `src/models/Tag.model.ts`: Mongoose schema + `ITag` interface.
2. **Repository** — `src/repositories/tag.repository.ts`: raw Mongoose queries only, no business rules.
3. **Service** — `src/services/tag.service.ts`: permission checks, orchestration, calls the repository.
4. **Validator** — `src/validators/tag.validator.ts`: Zod schemas for `body`/`params`/`query`.
5. **Controller** — `src/controllers/tag.controller.ts`: thin `asyncHandler`-wrapped functions that call the service and return an `ApiResponse`.
6. **Route** — `src/routes/tag.routes.ts`: wire `requireAuth`, `validate(schema)`, controller. Mount it in `src/routes/index.ts`.
7. **Tests** — add an integration test under `tests/integration/` using `supertest` against `createApp()`.

## Frontend: adding a new feature

1. **Type** — add/extend the shape in `src/types/index.ts`.
2. **Service** — `src/services/<resource>.service.ts`: one function per endpoint, typed with `ApiEnvelope<T>`.
3. **Hook** — `src/hooks/use<Resource>.ts`: wrap the service in TanStack Query `useQuery`/`useMutation`. Components should never call `apiClient` directly.
4. **Component/page** — build the UI from `components/ui/*` primitives; keep feature-specific components under `components/<feature>/` or `pages/<area>/`.
5. **Route** — register lazy-loaded pages in `src/App.tsx`.

## Real-time features

New Socket.IO events should be added to `server/src/constants/socketEvents.ts` first (the single source of truth for event names), then wired in `server/src/socket/index.ts` (server) and a hook such as `useNoteCollaboration` (client). Keep payloads small and JSON-serializable.

## Running tests

```bash
# backend (spins up an in-memory MongoDB automatically)
npm run test -w server

# frontend (jsdom + Testing Library)
npm run test -w client
```

## Code review checklist

- [ ] No `any`, no unused exports, no leftover `console.log`
- [ ] New endpoints validated with Zod and permission-checked in the service layer
- [ ] New UI states cover loading / empty / error, not just the happy path
- [ ] Socket event names added to `socketEvents.ts` rather than hardcoded strings
- [ ] Tests added for new business logic
