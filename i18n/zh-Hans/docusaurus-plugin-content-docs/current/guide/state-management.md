---
title: 状态管理
description: 针对某一类具体状态，在 Zustand 风格 store、Jotai atom 和状态机之间做选择。
---

# 状态管理

VEF 不强制要求使用单一的状态管理风格，而是针对不同类型的状态提供不同的工具：

- Zustand 风格 store
- Jotai atom
- XState 状态机

在大多数项目中，前两者是最常用的。本篇是一份选型指南；完整的 API——每个选项、类型导出以及 `PersistenceOptions` 字段——见 [Store 与 Atom](../reference/core/store-and-atom.md)。

## 快速对照

| 需求 | 推荐 API |
| --- | --- |
| 全局应用状态 | `createStore()` / `createPersistedStore()` |
| 组件树内部的局部共享状态 | `createComponentStore()` |
| 一次性弹窗或交互状态 | `atom()` |
| 复杂的状态流转 | `createMachine()` |

## 全局 Store：`createStore()`

`createStore()` 要求状态类型包含一个 `name: string` 字段：

```ts
import { createStore } from "@vef-framework-react/core";

interface CounterState {
  name: string;
  count: number;
  increment: () => void;
}

export const useCounterStore = createStore<CounterState>(set => ({
  name: "counter",
  count: 0,
  increment: () => {
    set(state => {
      state.count += 1;
    });
  }
}));
```

## 持久化 Store：`createPersistedStore()`

`createPersistedStore()` 不要求状态本身包含 `name` 字段——store 的存储 key 改为来自 `persistenceOptions.name`：

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
    storage: "local"
  }
);
```

## 组件作用域 Store：`createComponentStore()`

一个配置页风格的场景通常是这样的：

```ts
import { createComponentStore } from "@vef-framework-react/core";
import { EventEmitter } from "@vef-framework-react/shared";

interface ConfigPageEvents {
  submit: undefined;
}

interface ConfigPageState {
  eventEmitter: EventEmitter<ConfigPageEvents>;
  selectedGroup?: string;
  setSelectedGroup: (selectedGroup: string) => void;
}

export const {
  StoreProvider: ConfigPageStoreProvider,
  useStore: useConfigPageStore
} = createComponentStore<ConfigPageState, never>(
  "ConfigPage",
  set => ({
    eventEmitter: new EventEmitter(),
    setSelectedGroup: selectedGroup => {
      set(state => {
        state.selectedGroup = selectedGroup;
      });
    }
  })
);
```

这里第一个参数（`"ConfigPage"`）是 store 的名称——用于 React context 的 display name 和开发模式下的错误信息——它和状态本身的任何字段是分开的。

## Atom 状态

对于单个模态框、抽屉，或局部详情状态，Jotai 往往是更轻量的选择。

```tsx
import { atom, useAtomValue, useSetAtom } from "@vef-framework-react/core";

const modalAtom = atom({
  open: false,
  data: null
});
```

## 经验法则

实践中，优先级顺序通常是这样的：

1. 局部瞬时 UI 状态：`useState`
2. 局部共享状态：`atom`
3. 页面作用域的共享状态：`createComponentStore`
4. 全局共享状态：`createStore()` / `createPersistedStore()`
5. 复杂的、由流程驱动的状态：状态机
