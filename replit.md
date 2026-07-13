# TechStock Inventario

Private inventory, sales, and cash-flow tracker for a small home-based tech resale business, replacing a manual Excel workflow.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/techstock run dev` — run the web frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env/secrets: `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (artifact `api-server`)
- Web frontend: React + Vite (artifact `techstock`, previewPath `/`)
- Auth: Clerk (Replit-managed, cookie-based on web)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec) → `@workspace/api-client-react` (hooks), `@workspace/api-zod` (schemas)

## Where things live

- OpenAPI contract (source of truth for API shape): `lib/api-spec/openapi.yaml`
- DB schema: `lib/db/src/schema/{proveedores,equipos,movimientosCaja}.ts`
- API routes: `artifacts/api-server/src/routes/{proveedores,equipos,movimientosCaja,analytics}.ts`
- Cash-ledger side effects (auto-created entries) live in the equipos route handlers (create = egreso, venta = ingreso, reactivar = removes the ingreso)
- Clerk server wiring: `artifacts/api-server/src/app.ts` + `artifacts/api-server/src/middlewares/{clerkProxyMiddleware,requireAuth}.ts`

## Architecture decisions

- Three tables model the business: `equipos` (inventory items with a lifecycle `estado`: en_stock/reservado/vendido), `proveedores` (suppliers), `movimientos_caja` (cash ledger).
- Capital dashboard: `capitalTotal = cajaActual (cash ledger balance) + valorInventario (sum of costoTotal for en_stock/reservado items)`.
- Sale/undo-sale use dedicated `PATCH /equipos/:id/venta` and `PATCH /equipos/:id/reactivar` endpoints (rather than overloading the generic update) so the cash-ledger side effects stay explicit.
- Cash `egreso` is only created at purchase time; later edits to an item's cost do not retroactively adjust the ledger (accepted MVP simplification).
- Recommendations (`/analytics/recomendaciones`) group historical sold items by categoría/marca/modelo and compute average margins to suggest a max purchase price and a Spanish-language recommendation string.

## Product

- Register purchases ("compras") into inventory with full Excel-equivalent fields (IMEI, condición, proveedor, forma de pago, costos).
- Register sales, undo sales, track supplier info, and log manual cash movements (capital injections/withdrawals).
- Dashboard shows current cash, inventory value, total capital, and profit stats.
- Recommendations page suggests which categoría/marca/modelo to keep buying and how much to pay, based on historical margins.

## User preferences

- User is a non-technical, Spanish-speaking small business owner (with her husband) reselling tech products. All UI copy is in Spanish.

## Gotchas

- `equipos.fechaCompra` / `fechaVenta` and `movimientos_caja.fecha` are Drizzle `date` (string) columns; convert zod-coerced `Date` inputs with `toDateOnlyString()` (`artifacts/api-server/src/lib/dates.ts`) before inserting — don't pass raw `Date` objects.
- Numeric/money columns are Postgres `numeric`, mapped to strings by Drizzle — always `String(...)` on write and `Number(...)` on read/aggregation.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `clerk-auth` skill for auth setup/customization details
