# AGENTS.md — TechStock Inventario

Private inventory, sales, and cash-flow tracker for a small tech resale business. All UI copy is in **Spanish** (non-technical end user).

## Commands

| Task | Command |
|------|---------|
| Run API server | `pnpm --filter @workspace/api-server run dev` |
| Run frontend | `pnpm --filter @workspace/techstock run dev` |
| Typecheck all | `pnpm run typecheck` |
| Build all | `pnpm run build` |
| Regenerate API hooks + Zod schemas | `pnpm --filter @workspace/api-spec run codegen` |
| Push DB schema changes | `pnpm --filter @workspace/db run push` |

Build order: libs first (`pnpm run typecheck:libs` runs `tsc --build` on `lib/db`, `lib/api-client-react`, `lib/api-zod`), then artifacts.

## Package manager

pnpm 9.15.4 with workspaces. Root `.npmrc`: `shamefully-hoist=true`, `auto-install-peers=false`.

`pnpm-workspace.yaml` enforces a **1-day minimum release age** on npm packages (supply-chain defense). Do not disable. Packages by trusted orgs can be added to `minimumReleaseAgeExclude`.

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
api/                          # Vercel deployment output (api/index.mjs)
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

- **Date columns** (`equipos.fechaCompra`/`fechaVenta`, `movimientos_caja.fecha`, `pagos_cuotas.fecha`) are Drizzle `date` with `mode: "string"`. Convert zod-coerced `Date` inputs with `toDateOnlyString()` from `artifacts/api-server/src/lib/dates.ts` — never pass raw `Date` objects to DB.
- **Numeric/money columns** are Postgres `numeric`, returned as **strings** by Drizzle. Use `String(...)` on write and `Number(...)` on read/aggregation. See `normalizeEquipo()` in `artifacts/api-server/src/routes/equipos.ts` for the pattern.
- Cash `egreso` is only created at purchase time; later cost edits do **not** retroactively adjust the ledger (accepted MVP simplification).

## Codegen flow

`openapi.yaml` → Orval (`lib/api-spec/orval.config.ts`) → generates:
- `lib/api-client-react/src/generated/` — React Query hooks with custom fetcher
- `lib/api-zod/src/generated/` — Zod schemas + TypeScript types

After editing `openapi.yaml`, always run `pnpm --filter @workspace/api-spec run codegen`.

## Vercel deployment

`vercel.json` runs `node artifacts/api-server/build-vercel.mjs` then builds the frontend. API routes are rewritten to `api/index.mjs`. Env vars needed: `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`.

## Auth

Clerk (cookie-based on web). Server wiring: `artifacts/api-server/src/app.ts` + `artifacts/api-server/src/middlewares/{clerkProxyMiddleware,requireAuth}.ts`.

## Frontend

React + Vite. Path aliases: `@` → `src/`, `@assets` → `attached_assets/`. Dev server proxies `/api` to `localhost:3000`. UI components use Radix UI + Tailwind CSS v4 + shadcn patterns.

## Post-merge hook

`scripts/post-merge.sh` runs `pnpm install --frozen-lockfile && pnpm --filter db push`. Ensure DB is reachable after pulling schema changes.
