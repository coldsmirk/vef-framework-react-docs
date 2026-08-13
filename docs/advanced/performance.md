---
title: Performance
description: Where VEF already spends its performance budget for you, and the knobs page code still controls — table virtualization, query caching, store selectors, icon loading, and code splitting.
---

# Performance

VEF makes several performance decisions before page code runs: queries default to a 5-second `staleTime`, the build splits routes and vendors into separate chunks, and animation shuts off for users who prefer reduced motion. This page covers the knobs that remain in page code — what each one does and when to reach for it.

## Virtualize Large Tables

`Table` and `ProTable` accept a `virtual` prop that turns on antd's virtual scrolling, so only the visible window of rows is mounted:

```tsx
<ProTable<User, UserSearchParams>
  virtual
  columns={columns}
  queryFn={findUsers}
  isPaginated={false}
  rowKey="id"
/>
```

Two details matter in virtual mode:

- Give every column an explicit `width` or `minWidth`. The table computes its horizontal scroll size by summing column widths, and a column without one falls back to `200`.
- `virtual` relies on the default `flexHeight` behavior: the table measures its container to size the scroll viewport, so keep it inside a height-constrained layout (a `Page` body qualifies).

Virtualization pays off when hundreds or thousands of rows are loaded at once — typically a non-paginated result set. A paginated table showing 20 rows per page does not need it. See [Tables](../guide/tables.md) for choosing between the table variants.

When a search input filters a large rendered list on every keystroke, React's `useDeferredValue` keeps typing responsive by letting the expensive re-render lag behind the input value.

## Tune Query Caching

`createApiClient()` accepts cache defaults for the whole application:

```ts
import { createApiClient } from "@vef-framework-react/starter";

export const apiClient = createApiClient({
  http: { baseUrl: "/api" },
  query: {
    staleTime: 30_000, // default: 5000
    gcTime: 600_000 // default: 300000
  }
});
```

- `staleTime` — how long a cached result is served without refetching. Queries also refetch on window focus and reconnect by default, so a short `staleTime` on stable reference data turns into repeated identical requests.
- `gcTime` — how long inactive cache entries survive before garbage collection.

Both options also work per query, which is usually the better tool: keep the global default conservative, then stretch it for data you know is stable (code sets, department trees, enum-like lists):

```ts
const { data } = useQuery({
  queryFn: findDepartmentTree,
  queryKey: [findDepartmentTree.key],
  staleTime: 300_000
});
```

The full option tables live in [Query](../reference/core/query.md).

## Keep the Previous Page Visible While Paginating

For a hand-built paginated view (card lists, custom result panels), changing the page changes the query key, so `data` becomes `undefined` while the next page loads and the layout collapses. `keepPreviousData` — re-exported from `@vef-framework-react/core` — avoids that:

```ts
import { keepPreviousData, useQuery } from "@vef-framework-react/core";

const { data, isPlaceholderData } = useQuery({
  queryFn: findUserPage,
  queryKey: [findUserPage.key, params],
  placeholderData: keepPreviousData
});
```

The previous page keeps rendering while the next one loads; `isPlaceholderData` reports when the visible rows are the outgoing page. `ProTable` does not need this — it keeps its own loading overlay during page changes.

## Warm the Cache Before It Is Needed

`apiClient.prefetchQuery()` fills the cache in the background; `apiClient.fetchQuery()` does the same and returns the data. Run them after login or on route entry for data the next screens are certain to need:

```ts
void apiClient.prefetchQuery({
  queryFn: findDepartmentTree,
  queryKey: [findDepartmentTree.key]
});
```

The result lands in the same cache that `useQuery()` reads, so the first component that asks for it renders without a loading state.

## Loading Flags Without Extra State

`useHasFetching(key)` and `useHasMutating(key)` from `@vef-framework-react/hooks` subscribe to the query cache instead of duplicating loading state in `useState` flags:

```tsx
import { useHasMutating } from "@vef-framework-react/hooks";

const isSaving = useHasMutating(createUser.key);

<Button loading={isSaving}>Save</Button>;
```

They match by key prefix, so one flag can cover a whole family of queries. See [VEF Hooks](../reference/hooks/vef-hooks.md) for signatures.

## Select Narrowly From Stores

Store hooks from `createStore()` and `createComponentStore()` accept selectors, and the component re-renders only when the selected slice changes:

```ts
// re-renders on every state change
const state = useUserPageStore();

// re-renders only when `selectedId` changes
const selectedId = useUserPageStore(state => state.selectedId);
```

A selector that returns a fresh object every call defeats this — wrap multi-field picks in `useShallow`, or `useDeep` when the selector derives nested data:

```ts
import { useShallow } from "@vef-framework-react/core";

const { keyword, scene } = useUserPageStore(
  useShallow(state => ({ keyword: state.keyword, scene: state.scene }))
);
```

This is the same pattern the framework uses internally. Also keep state at the narrowest scope that works — page-local stores over global ones — per [State Management](../guide/state-management.md).

## Deep and Shallow Comparison Hooks

`@vef-framework-react/hooks` ships `useDeepMemo` / `useShallowMemo` / `useDeepEffect` / `useShallowEffect` / `useDeepCallback` / `useShallowCallback`: drop-in versions of the React hooks that compare dependency *values* instead of references. Reach for them when a dependency object genuinely arrives rebuilt on every render — route search params, form values, a filters object assembled inline:

```ts
import { useDeepEffect } from "@vef-framework-react/hooks";

useDeepEffect(() => {
  reportFilterChange(filters);
}, [filters]); // fires only when the contents of `filters` change
```

The comparison itself has a cost, so prefer stabilizing the reference at its source when you control it; these hooks are for the cases where you do not.

## Icons: `DynamicIcon` Loads On Demand

[`DynamicIcon`](../components/dynamic-icon.md) resolves a Lucide icon from a name string at runtime. Each icon ships as its own lazily imported chunk, resolved nodes are cached globally for the app's lifetime, concurrent requests for one name share a single import, and no more than six imports run at once — so a data-driven menu or an icon-picker grid stays cheap even across thousands of names.

The flip side: for an icon known at build time, import it statically instead of routing a constant string through `DynamicIcon`. Static imports bundle into the shared icon chunk and render synchronously with no loading placeholder.

## Code Splitting Comes From the Build Setup

Application projects built on `defineViteConfig()` from `@vef-framework-react/dev` already get:

- **Route-level splitting** — the TanStack Router plugin runs with automatic code splitting, so each route's component code becomes its own chunk, loaded on first navigation.
- **Vendor chunking** — React, TanStack libraries, the framework packages, Lucide icons, pinyin data, and ECharts are grouped into stable chunks that cache independently of app code.

The habit that preserves this: keep heavy page-specific dependencies imported by the page that uses them. A chart configuration or editor module imported from a shared barrel is pulled into the shared chunk and paid for by every route — which is also why [Project Conventions](./project-conventions.md) keeps page-local code inside the page directory.

## Entrance Animation and Reduced Motion

`Page` plays a short entrance animation on mount. It is cheap by itself, but work started during it competes with the animation frames. For heavy, non-critical initialization, wait for the entrance to settle:

```tsx
import { usePageEntranceEffect } from "@vef-framework-react/components";

usePageEntranceEffect(() => {
  chart.startEntranceSequence();
});
```

The effect runs once the hosting `Page` has finished arriving (immediately outside a `Page`), and `usePageEntranceSettled()` offers the same signal as a boolean when it drives rendering.

Reduced motion is handled at the framework level: `ConfigProvider` reads the OS-level `prefers-reduced-motion` setting and disables antd animation when it is on. Custom animation code should respect the same signal via [`useReducedMotion`](../reference/hooks/upstream-hooks.md) from `@vef-framework-react/hooks`.

## Pinyin Option Search

For Chinese option data, the built-in pipeline — `filterable` on [Select](../components/select.md) and the `useDataOptions*` hooks — already performs pinyin-enhanced matching, backed by the shared `withPinyin()` utility and a dedicated pinyin vendor chunk. Prefer it over rebuilding fuzzy pinyin conversion in page code: a hand-rolled version recomputes conversions per keystroke and duplicates option data the app has already loaded.
