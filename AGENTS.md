# AGENTS.md — TechStock Inventario

Private inventory, sales, and cash-flow tracker for a small tech resale business. All UI copy is in **Spanish** (non-technical end user).

## Commands

| Task | Command |
|------|---------|
| Run API server | `pnpm --filter @workspace/api-server run dev` (port 3000) |
| Run frontend | `pnpm --filter @workspace/techstock run dev` (port 5173, proxies `/api` → 3000) |
| Typecheck all | `pnpm run typecheck` |
| Build all | `pnpm run build` |
| Regenerate API hooks + Zod schemas | `pnpm --filter @workspace/api-spec run codegen` |
| Push DB schema to Neon | `pnpm --filter @workspace/db run push` (needs reachable `DATABASE_URL`) |
| Seed local SQLite | `node ../../scripts/seed-local.mjs` **from `artifacts/api-server` cwd** (see gotcha below) |
| Migrate Neon → local SQLite | `tsx ../../scripts/migrate-neon.mjs` **from `artifacts/api-server` cwd** (needs reachable `DATABASE_URL`; replaces local data — a `.bak` backup is created first; stop the API server before running) |

Build order: libs first (`pnpm run typecheck:libs` runs `tsc --build` on `lib/db`, `lib/api-client-react`, `lib/api-zod`), then artifacts.

There are **no automated tests**; verification is typecheck + manual HTTP checks (see Auth section for expected 401/200 behavior).

## Package manager

pnpm 10 with workspaces. Root `.npmrc`: `shamefully-hoist=true`, `auto-install-peers=false`.

`pnpm-workspace.yaml` enforces a **1440-minute minimum release age** on npm packages (supply-chain defense). Do not disable. Packages by trusted orgs can go into `minimumReleaseAgeExclude`.

## Workspace layout

```
lib/                          # Shared libraries (composite tsconfig)
  db/                         # Drizzle ORM + schema (@workspace/db)
  api-spec/                   # OpenAPI 3.1 contract (@workspace/api-spec)
  api-client-react/           # Generated React Query hooks (@workspace/api-client-react)
  api-zod/                    # Generated Zod schemas (@workspace/api-zod)
artifacts/                    # Deployable apps
  api-server/                 # Express 5 API (@workspace/api-server)
  techstock/                  # React + Vite frontend (@workspace/techstock)
  mockup-sandbox/             # Design sandbox
scripts/                      # Utility scripts (@workspace/scripts)
api/                          # Vercel build output (gitignored)
```

## Source of truth

- **API shape**: `lib/api-spec/openapi.yaml` — title **must** stay `"Api"` or Orval import paths break.
- **DB schema**: `lib/db/src/schema/{equipos,proveedores,movimientosCaja,pagosCuotas}.ts`
- **API routes**: `artifacts/api-server/src/routes/{equipos,proveedores,movimientosCaja,analytics,health}.ts`

## Data model

Four tables: `equipos` (inventory items with lifecycle `estado`: en_stock/reservado/vendido), `proveedores` (suppliers), `movimientos_caja` (cash ledger), `pagos_cuotas` (installment payments).

Capital formula: `capitalTotal = cajaActual (cash ledger balance) + valorInventario (sum of costoTotal for en_stock/reservado items)`.

Cash ledger side effects: create = egreso, venta = ingreso, reactivar = removes the ingreso. These live in the equipos route handlers.

## Critical gotchas

- **DB path is cwd-relative**: `lib/db/src/index.ts` opens `join(process.cwd(), "data", "techstock.db")`. The API runs from `artifacts/api-server`, so its DB is `artifacts/api-server/data/techstock.db` — a **different file** than the root `data/techstock.db`. Run the server and the seed script from `artifacts/api-server`, or you will read/write the wrong database.
- **Runtime DB is SQLite via `sql.js` only** — everywhere, including production. `DATABASE_URL`/Neon is read only by `lib/db/drizzle.config.ts` (`db run push`) and `scripts/migrate-neon.mjs`. On Vercel serverless, sql.js filesystem writes are **ephemeral** — deployed data does not persist. The local `artifacts/api-server/data/techstock.db` is the single source of truth and has no automated backup.
- **Migrate script needs `tsx` and hits Neon over HTTPS**: `scripts/migrate-neon.mjs` imports `@workspace/db` (a `.ts` package that Node can't load directly — directory import `./schema`), so it must run with `tsx`. It reads Neon through the SQL-over-HTTP endpoint (`POST https://<host>/sql` + `neon-connection-string` header), which works even on networks that block Postgres TCP 5432. The script **replaces** local data (FK-safe wipe, explicit IDs preserved) and writes a `.bak` of the previous DB file.
- **`.env` files are NOT gitignored** and are untracked: `artifacts/api-server/.env` (holds `CLERK_SECRET_KEY`) and `artifacts/techstock/.env.local` (`VITE_CLERK_PUBLISHABLE_KEY`). Never `git add .` them; never commit secrets. `data/` dirs are also untracked.
- **Date columns** (`equipos.fechaCompra`/`fechaVenta`, `movimientos_caja.fecha`, `pagos_cuotas.fecha`) are Drizzle `date` with `mode: "string"`. Convert zod-coerced `Date` inputs with `toDateOnlyString()` from `artifacts/api-server/src/lib/dates.ts` — never pass raw `Date` objects to DB.
- **Numeric/money columns** are Postgres `numeric`, returned as **strings** by Drizzle. Use `String(...)` on write and `Number(...)` on read/aggregation. See `normalizeEquipo()` in `artifacts/api-server/src/routes/equipos.ts` for the pattern.
- Cash `egreso` is only created at purchase time; later cost edits do **not** retroactively adjust the ledger (accepted MVP simplification).

## Codegen flow

`openapi.yaml` → Orval (`lib/api-spec/orval.config.ts`) → generates:
- `lib/api-client-react/src/generated/` — React Query hooks with custom fetcher
- `lib/api-zod/src/generated/` — Zod schemas + TypeScript types

After editing `openapi.yaml`, always run `pnpm --filter @workspace/api-spec run codegen`.

## Vercel deployment

`vercel.json` runs `node artifacts/api-server/build-vercel.mjs` (esbuild `src/vercel.ts` → `api/index.js`) then builds the frontend. API routes are rewritten to `/api/index.js`. Env vars needed: `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`. Because the runtime DB is sql.js SQLite (ephemeral on serverless), treat Vercel as a demo/CI surface, not the source of truth for data.

## Auth (Clerk)

- **API is fail-closed**: `artifacts/api-server/src/app.ts` throws at startup if `CLERK_SECRET_KEY` is missing. Never remove that guard.
- `requireAuth` (`artifacts/api-server/src/middlewares/requireAuth.ts`) checks `getAuth(req).userId` and returns **401 JSON**. Do **not** switch to Clerk's deprecated `requireAuth()` factory — it 302-redirects (broken for APIs) and is removed in the next major.
- `clerkMiddleware` is wrapped in `app.ts` so a **malformed token returns 401, not 500** (Clerk's SDK crashes on base64-decode of bad JWTs; the wrapper converts it).
- `clerkProxyMiddleware` (`/api/__clerk`) is a no-op outside `NODE_ENV=production`; it proxies Clerk's Frontend API through the app's domain in production only.
- **Frontend must attach the token**: `ClerkAuthBridge` in `artifacts/techstock/src/App.tsx` wires `useAuth().getToken()` into `setAuthTokenGetter` (`@workspace/api-client-react`). Without it, cross-origin dev calls (5173 → 3000) arrive with no auth header and get 401.
- **Frontend and API must use the SAME Clerk instance.** `artifacts/techstock/.env.local` (`VITE_CLERK_PUBLISHABLE_KEY`) and `artifacts/api-server/.env` (`CLERK_SECRET_KEY`) must share the same instance id (the part before `$` in `pk_test_...`/`sk_test_...`). A mismatch produces silent 401s. Current canonical instance: `sweeeping-elk-94` (don't "fix" it to a different one). Changing env vars requires **restarting the frontend dev server** (Vite reads env only at startup).
- Sign-ups are **restricted** (Clerk dashboard → Restrictions). The frontend has no `/sign-up` route. User onboarding is via **invitations** (Clerk dashboard → Users → Invitations; CLI: `npx clerk@latest api invitations -d '{"email_address":"..."}'`), valid 1–365 days via `expires_in_days`. Auth configuration (social connections, restricted mode) lives in **dashboard.clerk.com**, not in code.

## Frontend

React + Vite. Path aliases: `@` → `src/`, `@assets` → `attached_assets/`. Dev server proxies `/api` to `localhost:3000`; `main.tsx` also calls `setBaseUrl('http://localhost:3000')` in DEV (production uses same-origin `/api`). UI components use Radix UI + Tailwind CSS v4 + shadcn patterns. `index.css` declares `cssLayerName: "clerk"` for Clerk component styling.

## Workflow

- Main working branch is **`desarrollo`** (not `main`). Push commits there.
- Commit messages follow conventional-commit style (`feat:`, `fix:`, `chore:`) in Spanish.
- Only stage intended files; `.env` files and `data/` must stay out of commits.

## Post-merge hook

`scripts/post-merge.sh` runs `pnpm install --frozen-lockfile && pnpm --filter @workspace/db run push`. The push targets Neon and needs a reachable `DATABASE_URL` (the corporate network at some locations blocks external Postgres with ETIMEDOUT).
