---
title: Testing
description: Recommended Vitest + Testing Library setup for VEF applications, a reusable provider wrapper, and patterns for testing forms and API-backed components.
---

# Testing

VEF does not publish a testing package, but the framework itself is tested with Vitest, jsdom, and Testing Library — and an application project can mirror that stack directly. Every pattern on this page uses only public framework APIs.

## Recommended Setup

```bash
pnpm add -D vitest jsdom @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

A standalone `vitest.config.ts` is enough — tests do not need the full `defineViteConfig()` build setup:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test-setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"]
  }
});
```

jsdom lacks several browser APIs that antd and the framework's hooks touch during render, so `test-setup.ts` must provide them: `ResizeObserver` backs `useElementSize` (used by `Table`), and `matchMedia` backs `useMediaQuery` / `useReducedMotion` (used by `ConfigProvider`).

```ts
import "@testing-library/jest-dom/vitest";

import { vi } from "vitest";

class ObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ObserverMock as never;
globalThis.IntersectionObserver = ObserverMock as never;

Object.defineProperty(globalThis, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});
```

Colocate specs next to their source as `<name>.test.ts(x)` — the same layout the framework uses, and consistent with the placement rules in [Project Conventions](./project-conventions.md).

## Start With Pure Logic

The cheapest, most stable tests need no providers and no DOM: helpers under a page's `helpers/` directory, request-envelope builders in `src/api/`, and validation schemas. Since `z` is re-exported from `@vef-framework-react/shared`, schema rules test as plain functions:

```ts
import { z } from "@vef-framework-react/shared";

const username = z.string().min(2, "At least 2 characters");

it("rejects a single-character username", () => {
  expect(username.safeParse("a").success).toBe(false);
});
```

If a piece of page logic is hard to test this way because it lives inside a component, that is usually the signal to move it into `helpers/` first.

## A Reusable `renderWithProviders`

Components that call `useQuery()`, read permissions, or render framework UI need three providers: `AppContextProvider`, `ApiClientProvider` (which installs TanStack Query's `QueryClientProvider` internally), and `ConfigProvider`. Wrap them once in a `src/test-utils.tsx`:

```tsx
import type { RenderOptions } from "@testing-library/react";
import type { ApiClient, AppContext } from "@vef-framework-react/core";
import type { PropsWithChildren, ReactElement } from "react";

import { render as originalRender } from "@testing-library/react";
import { ConfigProvider } from "@vef-framework-react/components";
import { ApiClientProvider, AppContextProvider, createApiClient } from "@vef-framework-react/core";

export function createTestApiClient(): ApiClient {
  return createApiClient({
    http: {
      // Non-routable host: an accidental real request fails fast and loudly.
      baseUrl: "http://vef-test.invalid"
    }
  });
}

interface ProviderOverrides {
  /** Permission and code-set wiring for permission-aware components. */
  appContext?: AppContext;
  /** Pass a shared client when a test needs cache continuity across renders. */
  apiClient?: ApiClient;
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper">, ProviderOverrides {}

function customRender(ui: ReactElement, options?: CustomRenderOptions) {
  const { appContext = {}, apiClient, ...renderOptions } = options ?? {};
  const client = apiClient ?? createTestApiClient();

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <AppContextProvider value={appContext}>
        <ApiClientProvider value={client}>
          <ConfigProvider>{children}</ConfigProvider>
        </ApiClientProvider>
      </AppContextProvider>
    );
  }

  return originalRender(ui, { wrapper: Wrapper, ...renderOptions });
}

export * from "@testing-library/react";
export { customRender as render };
```

Note the imports: tests use the core-level `createApiClient` from `@vef-framework-react/core`, not the starter wrapper — the starter version wires global stores and message feedback that unit tests should not depend on. Each test gets a fresh client, and with it an isolated query cache.

The `appContext` override is how permission-aware components are tested:

```tsx
render(<UserActions />, {
  appContext: { hasPermission: token => token === "user:update" }
});
```

## Testing Forms

Forms built with `useForm()` are tested through the rendered DOM with `userEvent` — antd inputs need the full pointer and focus event chain, which `fireEvent` does not produce:

```tsx
import userEvent from "@testing-library/user-event";

import { render, screen, waitFor } from "../test-utils";

function UserForm({ onSubmit }: { onSubmit: (values: { name: string }) => void }) {
  const form = useForm({
    defaultValues: { name: "" },
    onSubmit: ({ value }) => onSubmit(value)
  });

  return (
    <form.Form>
      <form.AppField name="name">
        {field => <field.Input label="Name" />}
      </form.AppField>
      <form.SubmitButton>Save</form.SubmitButton>
    </form.Form>
  );
}

it("submits the typed value", async () => {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  render(<UserForm onSubmit={onSubmit} />);

  await user.type(screen.getByRole("textbox"), "Alice");
  await user.click(screen.getByRole("button", { name: "Save" }));

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({ name: "Alice" });
  });
});
```

Prefer accessible queries (`getByRole`, `getByLabelText`) over test ids — they fail when the accessible structure breaks, which is what users experience.

## Mocking API Calls

Mock at the query-function boundary, not inside components. One rule to respect: framework query functions carry a `key` property that participates in the query key (and that `ProTable` reads), so a bare `vi.fn()` is not a valid stand-in. Build canned functions through a test client instead — the factory receives the HTTP client but is free to ignore it:

```tsx
import type { PaginationResult } from "@vef-framework-react/core";

const apiClient = createTestApiClient();

const findUserPage = apiClient.createQueryFn<PaginationResult<User>, UserSearchParams>(
  "auth/user/find_page",
  () => async () => ({ items: [{ id: "1", name: "Alice" }], total: 1 })
);

render(<UserTable queryFn={findUserPage} />, { apiClient });
```

This keeps the whole query pipeline real — caching, loading states, `useHasFetching()` — while the handler never touches the network. It works because [Project Conventions](./project-conventions.md) has `route.tsx` wire query functions into page components as props: the test passes a canned one the same way.

When a component imports its API functions directly from `~apis`, mock the module with `vi.mock("~apis/auth/user", ...)` and still construct the replacements with `createQueryFn` so the `key` contract holds (use `vi.hoisted` for state the factory needs).

There is no injectable HTTP transport: `HttpClientOptions` has no adapter hook and `HttpClient` is exported as a type only. To exercise the real request path — envelope format, error mapping, token refresh — intercept at the network layer with a tool like [MSW](https://mswjs.io/)'s `setupServer`. Most page tests do not need to go that deep.

## Routing and the Application Shell

Most page components can be rendered without a router: when `route.tsx` stays a thin assembly layer, the components under `components/` take their dependencies as props and test in isolation. Reserve full `RouterProvider` setups for tests that are genuinely about routing behavior, and never replay the login flow to reach a page — set the state the page needs directly.

The old rule still holds: if a page test requires the entire application shell before anything can be asserted, the page is carrying too much responsibility and is a candidate for splitting.

## What Not to Test

- **Framework behavior** — table virtualization, `ConfigProvider` theming, entrance animation, query caching. The framework maintains its own test suite for these; application tests should assert application behavior on top of them.
- **Pass-through wrappers** — a component that only forwards props to an antd component has no behavior of its own to assert.
- **Generated code** — `router.gen.ts` is build output.
- **Implementation details** — internal state, private helpers reached around the public surface, or DOM structure that a refactor may legitimately change.
