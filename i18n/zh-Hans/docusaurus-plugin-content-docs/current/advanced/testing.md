---
title: 测试
description: VEF 应用推荐的 Vitest + Testing Library 测试配置、可复用的 Provider 包装器，以及表单与 API 驱动组件的测试模式。
---

# 测试

VEF 没有发布专门的测试包，但框架自身就是用 Vitest、jsdom 和 Testing Library 测试的——应用项目可以直接沿用这套技术栈。本页的所有模式只使用框架的公开 API。

## 推荐配置

```bash
pnpm add -D vitest jsdom @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

一个独立的 `vitest.config.ts` 就够了——测试不需要完整的 `defineViteConfig()` 构建配置：

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

jsdom 缺少几个 antd 和框架 hooks 在渲染时会用到的浏览器 API，所以要在 `test-setup.ts` 里补齐：`ResizeObserver` 支撑 `useElementSize`（`Table` 依赖它），`matchMedia` 支撑 `useMediaQuery` / `useReducedMotion`（`ConfigProvider` 依赖它们）。

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

测试文件以 `<name>.test.ts(x)` 的形式与源码同目录放置——这与框架自身的布局一致，也符合[应用项目规约](./project-conventions.md)的放置规则。

## 从纯逻辑开始

最便宜、最稳定的测试既不需要 Provider 也不需要 DOM：页面 `helpers/` 目录下的辅助函数、`src/api/` 里的请求信封构造器，以及校验 schema。由于 `z` 从 `@vef-framework-react/shared` 重导出，schema 规则可以当作普通函数来测：

```ts
import { z } from "@vef-framework-react/shared";

const username = z.string().min(2, "At least 2 characters");

it("rejects a single-character username", () => {
  expect(username.safeParse("a").success).toBe(false);
});
```

如果一段页面逻辑因为写在组件内部而难以这样测试，这通常正是先把它移进 `helpers/` 的信号。

## 可复用的 `renderWithProviders`

调用 `useQuery()`、读取权限或渲染框架 UI 的组件需要三个 Provider：`AppContextProvider`、`ApiClientProvider`（它内部会安装 TanStack Query 的 `QueryClientProvider`）和 `ConfigProvider`。在 `src/test-utils.tsx` 里包装一次：

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
      // 不可路由的主机：一旦有测试意外发出真实请求，会立刻显式失败。
      baseUrl: "http://vef-test.invalid"
    }
  });
}

interface ProviderOverrides {
  /** 供权限相关组件使用的权限与码集接线。 */
  appContext?: AppContext;
  /** 当测试需要跨多次渲染保持缓存连续时，传入共享的 client。 */
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

注意导入来源：测试使用 `@vef-framework-react/core` 的核心级 `createApiClient`，而不是 starter 的包装版本——后者接入了全局 store 和消息反馈，单元测试不应依赖它们。每个测试拿到一个全新的 client，也就拿到了隔离的查询缓存。

`appContext` 覆盖项就是权限相关组件的测试方式：

```tsx
render(<UserActions />, {
  appContext: { hasPermission: token => token === "user:update" }
});
```

## 测试表单

用 `useForm()` 构建的表单通过渲染出的 DOM 配合 `userEvent` 来测试——antd 输入组件需要完整的指针和焦点事件链，`fireEvent` 无法产生：

```tsx
import userEvent from "@testing-library/user-event";

import { useForm } from "@vef-framework-react/components";

import { render, screen, waitFor } from "../test-utils";

function UserForm({ onSubmit }: { onSubmit: (values: { name: string }) => void }) {
  const form = useForm({
    defaultValues: { name: "" },
    onSubmit: ({ value }) => onSubmit(value)
  });

  return (
    <form.Form>
      <form.AppField name="name">
        {field => <field.Input label="姓名" />}
      </form.AppField>
      <form.SubmitButton>保存</form.SubmitButton>
    </form.Form>
  );
}

it("submits the typed value", async () => {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  render(<UserForm onSubmit={onSubmit} />);

  await user.type(screen.getByRole("textbox"), "Alice");
  await user.click(screen.getByRole("button", { name: "保存" }));

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({ name: "Alice" });
  });
});
```

优先使用可访问性查询（`getByRole`、`getByLabelText`）而不是 test id——可访问结构坏了它们就会失败，而那正是用户实际感知到的东西。

## Mock API 调用

在查询函数这个边界上做 mock，而不是伸进组件内部。有一条规则必须遵守：框架的查询函数带有 `key` 属性，它参与 query key 的构成（`ProTable` 也会读取它），所以裸的 `vi.fn()` 不是合法替身。改为通过测试 client 构造返回固定数据的查询函数——工厂函数会收到 HTTP client，但完全可以忽略它：

```tsx
import type { PaginationResult } from "@vef-framework-react/core";

const apiClient = createTestApiClient();

const findUserPage = apiClient.createQueryFn<PaginationResult<User>, UserSearchParams>(
  "auth/user/find_page",
  () => async () => ({ items: [{ id: "1", name: "Alice" }], total: 1 })
);

render(<UserTable queryFn={findUserPage} />, { apiClient });
```

这样整条查询链路都是真实的——缓存、loading 状态，以及 `@vef-framework-react/hooks` 的 `useHasFetching()`——但处理函数从不触网。它之所以可行，是因为[应用项目规约](./project-conventions.md)要求 `route.tsx` 以 props 形式把查询函数接入页面组件：测试只是用同样的方式传入一个固定数据版本。

当组件直接从 `~apis` 导入 API 函数时，用 `vi.mock("~apis/auth/user", ...)` mock 整个模块，但替身仍然要用 `createQueryFn` 构造，以维持 `key` 契约（工厂函数需要的状态用 `vi.hoisted` 提供）。

框架没有可注入的 HTTP 传输层：`HttpClientOptions` 没有 adapter 钩子，`HttpClient` 也只作为类型导出。要走真实请求路径——信封格式、错误映射、token 刷新——就在网络层拦截，例如 [MSW](https://mswjs.io/) 的 `setupServer`。大多数页面测试不需要走到这一层。

## 路由与应用外壳

大多数页面组件不需要路由器就能渲染：只要 `route.tsx` 保持薄装配层的角色，`components/` 下的组件通过 props 接收依赖，就可以独立测试。完整的 `RouterProvider` 只留给真正测试路由行为的场景，并且永远不要为了到达某个页面而重放登录流程——直接设置页面需要的状态。

那条老规则依然成立：如果一个页面测试必须先跑通整个应用外壳才能开始断言，说明该页面承担了过多职责，适合进一步拆分。

## 不要测什么

- **框架行为** — 表格虚拟滚动、`ConfigProvider` 主题、入场动画、查询缓存。框架有自己的测试套件覆盖这些；应用测试应当断言构建在其上的应用行为。
- **纯透传包装** — 只把 props 转发给 antd 组件的组件没有自己的行为可断言。
- **生成代码** — `router.gen.ts` 是构建产物。
- **实现细节** — 内部状态、绕过公开接口去触碰的私有辅助函数，以及重构后可以合法变化的 DOM 结构。
