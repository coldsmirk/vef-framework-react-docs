---
sidebar_position: 7
title: State Management
---

# State Management

VEF does not force a single state-management style. Instead, it exposes different tools for different kinds of state:

- Zustand-style stores
- Jotai atoms
- XState state machines

In most projects, the first two are used most often.

## Quick Mapping

| Need | Recommended API |
| --- | --- |
| global application state | `createStore()` / `createPersistedStore()` |
| local shared state inside a component tree | `createComponentStore()` |
| one-off modal or interaction state | `atom()` |
| complex state transitions | `createMachine()` |

## Global Store: `createStore()`

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

## Persisted Store: `createPersistedStore()`

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

## Component-Scoped Store: `createComponentStore()`

A configuration-page-style setup often looks like this:

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

## Atom State

For single modals, drawers, or local detail state, Jotai is often the lighter option.

```tsx
import { atom, useAtomValue, useSetAtom } from "@vef-framework/core";

const modalAtom = atom({
  open: false,
  data: null
});
```

## Rule of Thumb

In practice, the order usually looks like this:

1. local transient UI state: `useState`
2. local shared state: `atom`
3. page-scoped shared state: `createComponentStore`
4. global shared state: `createStore()` / `createPersistedStore()`
5. complex process-driven state: state machines
