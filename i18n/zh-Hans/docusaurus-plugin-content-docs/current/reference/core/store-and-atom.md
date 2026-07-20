---
title: Store 与 Atom
description: createStore、createPersistedStore、createComponentStore、Jotai atom 的签名，以及 XState 状态机导出。
---

# Store 与 Atom

`@vef-framework-react/core` 提供三种状态管理方式：基于 Zustand 的 store、Jotai atom，以及 XState 状态机（收录在[本页末尾](#xstate-状态机)）。

## Zustand Store

### `createStore`

创建一个带有 `subscribeWithSelector` 和 `immer` 中间件的全局绑定 store。

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

创建一个持久化到 `localStorage` 或 `sessionStorage` 的全局 store（Zustand `persist` 中间件，存储键为 `__VEF_STORE__<CONSTANT_CASE(name)>__`，JSON 序列化，版本 `1`）。与 `createStore` 不同，状态类型不需要 `name` 字段——store 名称来自持久化选项。

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

### `PersistenceOptions<TState, TSelectedState>`

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | —（必填） | 唯一的 store 名称；在存储键中会被转换为 `CONSTANT_CASE` |
| `storage` | `"local" \| "session"` | `"session"` | 存储后端。只有显式传入 `"local"` 才会选用 `localStorage`；省略该选项（或传入任何其他值）都会选用 `sessionStorage` |
| `selector` | `(state: TState) => TSelectedState` | 恒等函数 | 选择需要持久化的字段（Zustand 的 `partialize`） |

### `createComponentStore`

创建一个由 React Context 支撑的组件作用域 store，适用于在某个页面或功能内共享状态而不污染全局状态。

```ts
createComponentStore<TState, TInitialState extends Partial<TState> = never>(
  name: string,
  initializer: ComponentStoreInitializer<TState>,
  persistOptions?: Except<PersistenceOptions<TState, Partial<TState>>, "name">
): ReturnedComponentStoreResult<TState, TInitialState>
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `name` | `string` | Store 名称，用于 context 的 display name 与错误消息（context 按名称缓存，以便在 React Fast Refresh 后存活） |
| `initializer` | `ComponentStoreInitializer<TState>` | Zustand 状态初始化函数（与 `createStore` 相同的 `subscribeWithSelector` + `immer` 中间件栈） |
| `persistOptions` | `Except<PersistenceOptions, "name">` | 可选的持久化配置（`storage`、`selector`）。提供后，`StoreProvider` 会接受一个 `storageKey` prop，用于为该实例开启持久化 |

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

用提供者包裹页面：

```tsx
<PageStoreProvider>
  <MyPage />
</PageStoreProvider>
```

带初始状态：

```tsx
<PageStoreProvider initialState={{ selectedId: "default" }}>
  <MyPage />
</PageStoreProvider>
```

#### `StoreProviderProps`

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `initialState` | `TInitialState` | 初始状态补丁。当 store 声明了 `TInitialState` 类型参数时必填，否则禁止传入。在**挂载后**合并进 store（在同构 layout effect 中），对提供的 key 覆盖初始化函数的值；非普通对象的值会被忽略 |
| `storageKey` | `string` | 状态持久化的存储键（完整键：`__VEF_COMPONENT_STORE__<CONSTANT_CASE(storageKey)>__`）。仅当 store 创建时提供了 `persistOptions` 才生效。不同的 provider 实例应使用不同的键 |

#### 行为说明

- 不带选择器调用 `useStore()` 返回完整状态；`useStore(selector)` 订阅选中的切片。
- `useStoreApi()` 返回原始 store 对象（`getState` / `setState` / `subscribe`），在找不到外层 `StoreProvider` 时会**抛出异常**（开发环境下，错误还会提示热更新刷新可能修复过期的 context）。

### `useDeep` 和 `useShallow`

用于 Zustand store 的选择器比较辅助函数：

```ts
import { useDeep, useShallow } from "@vef-framework-react/core";

// Shallow comparison (avoids re-render when object reference changes but values are equal)
const { count, name } = useCounterStore(useShallow(state => ({
  count: state.count,
  name: state.name
})));

// Deep comparison
const config = useConfigStore(useDeep(state => state.config));
```

### 类型导出

| 类型 | 说明 |
| --- | --- |
| `SliceStateCreator<TState, TSlice, TPersist>` | Store 切片的状态创建器类型（感知中间件；持久化 store 需将 `TPersist` 设为 `true`） |
| `UnboundStore<TState>` | 未绑定 React 的原始 Zustand store（`subscribeWithSelector` + `immer` mutator） |
| `UseBoundStore<TState>` | `createStore` 返回的已绑定 store Hook 类型 |
| `UseBoundStoreWithPersist<TState>` | `createPersistedStore` 返回的已绑定 store Hook 类型 |
| `PersistenceOptions<TState, TSelectedState>` | `createPersistedStore` 及 `createComponentStore` 的 `persistOptions` 的选项 |
| `StoreProviderProps<TInitialState>` | 组件 store 提供者的 Props（`initialState`、`storageKey`、`children`） |
| `UseStore<TState>` | `useStore` 的 Hook 签名——`(): TState` 与 `<TSelected>(selector: (state: TState) => TSelected): TSelected` |
| `ReturnedComponentStoreResult<TState, TInitialState>` | `createComponentStore` 的返回类型——`{ StoreProvider, useStoreApi, useStore }` |

---

## Jotai Atom

用于不需要完整 store 的轻量、一次性状态。

### `atom`

```ts
import { atom } from "@vef-framework-react/core";

const modalAtom = atom({ open: false, data: null as UserRow | null });
const countAtom = atom(0);
```

### `useAtom`、`useAtomValue`、`useSetAtom`

```tsx
import { useAtom, useAtomValue, useSetAtom } from "@vef-framework-react/core";

// Read and write
const [modal, setModal] = useAtom(modalAtom);

// Read only
const modal = useAtomValue(modalAtom);

// Write only
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

// Inside component
const store = useAtomStore();

// Outside React
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
| `AtomGetter` | Getter 函数类型（Jotai 的 `Getter`，重命名） |
| `AtomSetter` | Setter 函数类型（Jotai 的 `Setter`，重命名） |
| `ExtractAtomValue<T>` | 从 atom 中提取值类型 |
| `ExtractAtomArgs<T>` | 从可写 atom 中提取参数类型 |
| `ExtractAtomResult<T>` | 从可写 atom 中提取结果类型 |
| `SetStateAction<T>` | 设置状态操作类型 |

---

## XState 状态机

对于复杂的状态转换，`@vef-framework-react/core` 重导出了 XState，并附带一个 VEF 专属 hook。按复杂度选择：共享的应用状态用 store，一次性状态用 atom，状态图形态的逻辑用状态机。

### `useActor`

由 VEF 维护的 hook。将 actor 创建（`useActorRef`）与基于选择器的状态订阅（`useSelector`，以 `Object.is` 比较）结合起来，因此仅当选中的值变化时组件才会重新渲染：

```ts
useActor<TLogic extends AnyActorLogic, TSelected>(
  logic: TLogic,
  selector: (snapshot: SnapshotFrom<TLogic>) => TSelected,
  options?: ActorOptions<TLogic> // required when the logic declares required inputs
): [TSelected, Actor<TLogic>["send"], Actor<TLogic>]
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `logic` | `TLogic extends AnyActorLogic` | Actor 逻辑（状态机或其他 actor 逻辑） |
| `selector` | `(snapshot: SnapshotFrom<TLogic>) => TSelected` | 从 actor 快照中选取数据 |
| `options` | `ActorOptions<TLogic>` | Actor 配置；当逻辑存在必填的 actor 选项（例如 `input`）时，该参数变为**必填** |

返回 `[selectedState, send, actorRef]`。

```tsx
import { createMachine, useActor } from "@vef-framework-react/core";

const toggleMachine = createMachine({
  id: "toggle",
  initial: "inactive",
  states: {
    inactive: { on: { TOGGLE: "active" } },
    active: { on: { TOGGLE: "inactive" } }
  }
});

function Toggle() {
  const [isActive, send] = useActor(toggleMachine, snapshot => snapshot.matches("active"));

  return <button onClick={() => send({ type: "TOGGLE" })}>{isActive ? "On" : "Off"}</button>;
}
```

### 重导出

| 导出 | 来源 | 说明 |
| --- | --- | --- |
| `createMachine` | `xstate` | 定义一个状态机 |
| `createActor` | `xstate` | 在 React 之外从逻辑创建 actor |
| `Actor` | `xstate` | Actor 类 |
| `updateContext` | `xstate` | XState 的 `assign` 动作创建器，重命名——用于更新机器上下文 |
| `useActorRef` | `@xstate/react` | 创建 actor 并返回稳定的 ref，而不订阅状态 |

### 状态机类型导出

| 类型 | 说明 |
| --- | --- |
| `ActorLogic` / `AnyActorLogic` | Actor 逻辑类型 |
| `ActorOptions<TLogic>` | Actor 配置选项 |
| `RequiredActorOptionsKeys<TLogic>` | 逻辑要求必填的 `ActorOptions` 键 |
| `MachineConfig` / `MachineContext` | 机器定义与上下文类型 |
| `StateMachine` / `AnyStateMachine` | 机器类型 |
| `MachineSnapshot` / `AnyMachineSnapshot` | 快照类型 |
| `SnapshotFrom<TLogic>` | 由 actor 逻辑推导出的快照类型 |
