---
name: Orval-generated list/query hooks take filter params as first positional argument
description: Common integration mistake when wiring a design subagent's frontend to orval-generated React Query hooks for endpoints with query-string filters.
---

For an OpenAPI operation like `GET /equipos?estado=&categoria=&search=`, orval generates a hook shaped like:

```ts
function useListEquipos<TData, TError>(
  params?: ListEquiposParams,
  options?: { query?: UseQueryOptions<...> }
)
```

The filter params are the **first** positional argument, not nested inside `options.query`. A common mistake (including from design subagents unfamiliar with the exact generated signature) is calling:

```ts
// WRONG — params object misplaced under `query`
useListEquipos({ query: { queryKey: getListEquiposQueryKey({ search }) } })
```

which produces a TS error like `Object literal may only specify known properties, and 'query' does not exist in type 'ListEquiposParams'` because TypeScript now interprets the whole object as the params arg.

**Why:** Orval's codegen pattern for list endpoints always separates "the actual request params" (first arg) from "React Query options" (second arg, itself has a nested `query` key). This differs from get-by-id hooks where the first arg is just the id.

**How to apply:** When wiring any generated `useList*` hook (or similarly shaped hooks with query-string filters), call it as `useListThing(paramsObject, { query: { queryKey: getListThingQueryKey(paramsObject), ...otherOptions } })`. Verify by grepping the hook's exported type signature in `lib/api-client-react/src/generated/api.ts` before assuming the shape.
