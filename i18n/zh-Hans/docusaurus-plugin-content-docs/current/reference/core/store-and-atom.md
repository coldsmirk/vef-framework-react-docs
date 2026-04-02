---
sidebar_position: 4
title: Store 与 Atom
---

# Store 与 Atom

`@vef-framework-react/core` 提供两种状态管理方式：基于 Zustand 的 store 和 Jotai atom。

## Zustand Store

### `createStore`

创建带有 `subscribeWithSelector` 和 `immer` 中间件的全局绑定 store。

状态类型必须包含 `name: string` 字段。

```ts
import { createStore } from "@vef-framework-react/core";

interface CounterState {
  name: string;
  count: number;
  increment: () => void;
  reset: () => void;
}

export const useCounterStore = createStore<CounterState>(set => ({
  name: "counter",
  count: 0,
  increment: () => {
    set(state => {
      state.count += 1;
    });
  },
  reset: () => {
    set(state => {
      state.count = 0;
    });
  }
}));
```

在组件中使用：

```tsx
const count = useCounterStore(state => state.count);
const increment = useCounterStore(state => state.increment);
```

### `createPersistedStore`

创建持久化到 `localStorage` 或 `sessionStorage` 的全局 store。

```ts
import { createPersistedStore } from "@vef-framework-react/core";

interface ThemeState {
  colorScheme: "light" | "dark";
  setColorScheme: (value: "light" | "dark") => void;
}

export const useThemeStore = createPersistedStore<ThemeState>(
  set => ({
    colorScheme: "light",
    setColorScheme: colorScheme => {
      set(state => {
        state.colorScheme = colorScheme;
      });
    }
  }),
  {
    name: "theme",
    storage: "local",
    selector: state => ({ colorScheme: state.colorScheme })
  }
);
```

### `PersistenceOptions`

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `name` | `string` | 唯一存储键名 |
| `storage` | `"local" \| "session"` | 存储类型（默认：`"local"`） |
| `selector` | `(state) => partial` | 选择需要持久化的字段 |

### `createComponentStore`

创建基于 React Context 的组件级 store，适合在页面或功能模块内共享状态，而不污染全局状态。

```ts
import { createComponentStore } from "@vef-framework-react/core";

interface PageState {
  selectedId?: string;
  setSelectedId: (id: string) => void;
}

export const {
  StoreProvider: PageStoreProvider,
  useStore: usePageStore,
  useStoreApi: usePageStoreApi
} = createComponentStore<PageState>("MyPage", set => ({
  setSelectedId: id => {
    set(state => {
      state.selectedId = id;
    });
  }
}));
```

用 Provider 包裹页面：

```tsx
<PageStoreProvider>
  <MyPage />
</PageStoreProvider>
```

携带初始状态：

```tsx
<PageStoreProvider initialState={{ selectedId: "default" }}>
  <MyPage />
</PageStoreProvider>
```

### `useDeep` 和 `useShallow`

Zustand store 的选择器比较辅助函数：

```ts
import { useDeep, useShallow } from "@vef-framework-react/core";

// 浅比较（对象引用变化但值相同时避免重渲染）
const { count, name } = useCounterStore(useShallow(state => ({
  count: state.count,
  name: state.name
})));

// 深比较
const config = useConfigStore(useDeep(state => state.config));
```

### 类型导出

| 类型 | 说明 |
| --- | --- |
| `SliceStateCreator<TState, TSlice, TPersist>` | store 切片的状态创建器类型 |
| `UnboundStore<TState>` | 未绑定 React 的原始 Zustand store 类型 |
| `UseBoundStore<TState>` | 绑定 store 的 hook 类型 |
| `UseBoundStoreWithPersist<TState>` | 带持久化的绑定 store hook 类型 |
| `PersistenceOptions<TState, TSelectedState>` | `createPersistedStore` 的选项类型 |
| `StoreProviderProps<TInitialState>` | 组件 store Provider 的 props 类型 |
| `UseStore<TState>` | `useStore` 的 hook 签名类型 |

---

## Jotai Atom

适用于不需要完整 store 的轻量级一次性状态。

### `atom`

```ts
import { atom } from "@vef-framework-react/core";

const modalAtom = atom({ open: false, data: null as UserRow | null });
const countAtom = atom(0);
```

### `useAtom`、`useAtomValue`、`useSetAtom`

```tsx
import { useAtom, useAtomValue, useSetAtom } from "@vef-framework-react/core";

// 读写
const [modal, setModal] = useAtom(modalAtom);

// 只读
const modal = useAtomValue(modalAtom);

// 只写
const setModal = useSetAtom(modalAtom);
```

### `AtomStoreProvider` 和 `createAtomStore`

用于隔离的 atom 作用域：

```tsx
import { AtomStoreProvider, createAtomStore } from "@vef-framework-react/core";

const store = createAtomStore();

<AtomStoreProvider store={store}>
  <IsolatedFeature />
</AtomStoreProvider>
```

### `useAtomStore` 和 `getDefaultAtomStore`

```ts
import { useAtomStore, getDefaultAtomStore } from "@vef-framework-react/core";

// 组件内部
const store = useAtomStore();

// React 外部
const store = getDefaultAtomStore();
const value = store.get(countAtom);
store.set(countAtom, 1);
```

### Atom 类型导出

| 类型 | 说明 |
| --- | --- |
| `Atom<T>` | 只读 atom 类型 |
| `PrimitiveAtom<T>` | 可读写的原始 atom 类型 |
| `WritableAtom<T, Args, Result>` | 可写 atom 类型 |
| `AtomGetter` | getter 函数类型 |
| `AtomSetter` | setter 函数类型 |
| `ExtractAtomValue<T>` | 从 atom 中提取值类型 |
| `ExtractAtomArgs<T>` | 从可写 atom 中提取参数类型 |
| `ExtractAtomResult<T>` | 从可写 atom 中提取结果类型 |
| `SetStateAction<T>` | 设置状态的 action 类型 |
