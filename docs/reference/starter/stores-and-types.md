---
title: Stores and Types
description: The app/tab/theme Zustand stores and the domain, user, and router types exported by @vef-framework-react/starter.
---

# Stores and Types

## Store Exports

- `useAppStore` — authentication state, current user info, menu maps, and permission tokens; persisted (`isAuthenticated` / `custom` / `authTokens` survive reload).
- `useTabStore` — the open-tabs list backing the multi-tab layout; persisted.
- `useThemeStore` — the user's picked color scheme and semantic colors, menu layout mode, and layout toggles; persisted. Unset color and color-scheme values follow the application's `defaultTheme`.

All three are created with `createPersistedStore` (see [Store and Atom](../core/store-and-atom.md)) — their state types do not need a `name` field; the storage key comes from the persistence options instead.

Related types:

- `AppState`
- `Tab`
- `TabState`
- `ColorScheme` — `"system" | "light" | "dark"`
- `ThemeColors` — `Record<SemanticColor, string>`
- `DefaultTheme` — `{ colorScheme?: ColorScheme; colors?: Partial<ThemeColors> }`
- `MenuLayoutMode` — `"vertical" | "horizontal" | "mixed"`
- `ThemeState`

## API and Domain Types

Entity identity:

- `Entity<TId = string>` — base interface that only carries `id`

Standalone audit field interfaces (use these for composite primary keys or non-`id` keyed records):

- `CreationTracked<TId, TDate>` — `createdAt` / `createdBy` / `createdByName`
- `FullTracked<TId, TDate>` — extends `CreationTracked` with `updatedAt` / `updatedBy` / `updatedByName`

Composed entity interfaces:

- `CreationAuditedEntity<TId, TDate>` — `Entity` + `CreationTracked`
- `FullAuditedEntity<TId, TDate>` — `Entity` + `FullTracked`

Batch parameter helper:

- `Many<T>` — wraps a `list: T[]` for batch create / update payloads

## User and Menu Types

- `Gender` — `"male" | "female" | "unknown"`
- `UserMenuType` — `"directory" | "menu" | "view" | "report"`, open to project-specific extension via `LiteralUnion`
- `UserMenu` — `type` / `path` / `name` / `icon?` / `meta?` / `children?`
- `UserMenuMeta` — `params?: Record<string, string>` and `search?: Record<string, string>` bound to a menu's route, plus any keys augmented onto `Register['menuMeta']`
- `UserInfo` — `details` is typed via the `Register` augmentation point (see below)
- `AppCustomState` — the shape of `AppState.custom`; defaults to `AnyObject`, narrowed via `Register['appCustomState']`
- `ChallengeSpec` — `{ data?: unknown; response: unknown }`, the contract for one login challenge type
- `ResolvedChallenges` — the challenge-type registry resolved from `Register['challenges']`, or an open `Record<string, ChallengeSpec>` when not augmented
- `Register` — empty interface that projects augment via `declare module` to refine `UserInfo['details']`, `AppState.custom`, `UserMenuMeta`, `loginParams`, and the login challenge registry. For the built-in `password_change` challenge, register `PasswordChangeChallengeSpec` under `PASSWORD_CHANGE_CHALLENGE_TYPE` — see [Login challenges](./application-shell.md#login-challenges)
- `LoginParams` — `PasswordLoginParams | TrustCodeLoginParams` plus project-registered login mechanisms
- `PasswordLoginParams` — `{ type: "password"; principal: string; credentials: string }`
- `TrustCodeLoginParams` — `{ type: "trust_code"; principal: string; credentials: string }`; `principal` is the initiating app id
- `LoginChallengeAutoResolver` / `LoginChallengeAutoResolvers` — optional per-type callbacks that answer a challenge from data the page already holds
- `UserDetails` — fallback shape (`Record<string, unknown>`) when `Register['userDetails']` is not augmented
- `OrderSpec` — `{ column: string; direction: "asc" | "desc" }`

### `department_selection` Challenge

The built-in `department_selection` login challenge carries a free-form `meta` field on both the challenge payload and each department entry. The framework itself only transports this data; the project declares the keys the login screen actually reads. There is no exported `DepartmentSelectionChallengeMeta` type — the shape is declared through `Register['challenges']` augmentation, and `ResolvedChallenges` carries it.

Each department entry has an optional `meta?: { orgId?: string; parentId?: string }` — `orgId` identifies which organization owns the department, and `parentId` enables rendering a tree. The challenge-level `meta` carries `organizations` — the organization hierarchy the departments hang off — as `meta?: { organizations?: Array<{ id: string; name: string; parentId?: string }> }`.

Organizations live in the challenge-level `meta` rather than as extra `departments` entries because every entry in the departments list is selectable — a grouping node listed among them would become a choosable one.

```ts
declare module "@vef-framework-react/starter" {
  interface Register {
    challenges: {
      department_selection: {
        data: {
          departments: Array<{
            id: string;
            name: string;
            meta?: { orgId?: string; parentId?: string };
          }>;
          meta?: {
            organizations?: Array<{ id: string; name: string; parentId?: string }>;
          };
        };
        response: string;
      };
    };
  }
}
```

### Extending `UserInfo.details`

`UserInfo.details` resolves through the `Register` interface, mirroring the pattern used by `@tanstack/react-query` for `mutationMeta`. Augment it once in your project to get strongly typed user attributes everywhere `UserInfo` flows through the app:

```ts
// src/types/vef-augment.d.ts
declare module "@vef-framework-react/starter" {
  interface Register {
    userDetails: {
      department: string;
      organization: string;
    };
  }
}
```

After this declaration, `userInfo.details.department` is typed as `string` across the application without forking the framework. The same `Register` interface also accepts `appCustomState`, `menuMeta`, and `challenges` members for the other extension points above.

## Router Types

- `RouterContext`

## Query Helpers

- `extractQueryParams`
- `noopMutationFn`
