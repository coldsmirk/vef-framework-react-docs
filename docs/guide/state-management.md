---
title: State Management
description: Choosing between Zustand-style stores, Jotai atoms, and state machines for a given piece of state.
---

# State Management

VEF does not force a single state-management style. Instead, it exposes different tools for different kinds of state:

- Zustand-style stores
- Jotai atoms
- XState state machines

In most projects, the first two are used most often. This page is a decision guide; the full API — every option, type export, and `PersistenceOptions` field — lives in [Store and Atom](../reference/core/store-and-atom.md).

## Quick Mapping

| Need | Recommended API |
| --- | --- |
| global application state | `createStore()` / `createPersistedStore()` |
| local shared state inside a component tree | `createComponentStore()` |
| one-off modal or interaction state | `atom()` |
| complex state transitions | `createMachine()` |

## Global Store: `createStore()`

`createStore()` requires the state type to include a `name: string` field:

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

## Persisted Store: `createPersistedStore()`

`createPersistedStore()` does not require a `name` field on the state itself — the store's storage key comes from `persistenceOptions.name` instead:

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

## Component-Scoped Store: `createComponentStore()`

A configuration-page-style setup often looks like this:

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

Here the first argument (`"ConfigPage"`) is the store's name — used for the React context display name and dev-mode error messages — and is separate from any field on the state itself.

## Atom State

For single modals, drawers, or local detail state, Jotai is often the lighter option.

```tsx
import { atom, useAtomValue, useSetAtom } from "@vef-framework-react/core";

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
