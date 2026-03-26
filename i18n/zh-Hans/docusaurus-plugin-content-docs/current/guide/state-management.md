---
sidebar_position: 7
title: 状态管理
---

# 状态管理

VEF 在状态管理上不是只押注一个库，而是给了三类不同用途的导出:

- Zustand 风格 store
- Jotai atom
- XState 状态机

实际项目里最常用的是前两类。

## 先给结论

| 需求 | 推荐 API |
| --- | --- |
| 全局应用状态 | `createStore()` / `createPersistedStore()` |
| 组件树内部局部状态 | `createComponentStore()` |
| 一次性弹窗或局部交互状态 | `atom()` |
| 复杂状态流转 | `createMachine()` |

## 全局 store: `createStore()`

```ts
import { createStore } from "@vef-framework/core";

interface CounterState {
  count: number;
  increment: () => void;
}

export const useCounterStore = createStore<CounterState>(set => ({
  count: 0,
  increment: () => {
    set(state => {
      state.count += 1;
    });
  }
}));
```

## 持久化 store: `createPersistedStore()`

```ts
import { createPersistedStore } from "@vef-framework/core";

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

## 组件作用域 store: `createComponentStore()`

配置页场景通常可以按下面的方式组织:

```ts
import { createComponentStore } from "@vef-framework/core";
import { EventEmitter } from "@vef-framework/shared";

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

## Atom 状态

对于单个弹窗、抽屉、详情模态框之类的状态，Jotai 往往更轻。

```tsx
import { atom, useAtomValue, useSetAtom } from "@vef-framework/core";

const modalAtom = atom({
  open: false,
  data: null
});
```

## 一条经验规则

优先级通常是:

1. 局部瞬时 UI 状态: `useState`
2. 局部共享状态: `atom`
3. 页面级共享状态: `createComponentStore`
4. 全局共享状态: `createStore` / `createPersistedStore`
5. 复杂业务流: 状态机
