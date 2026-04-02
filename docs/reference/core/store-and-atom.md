---
sidebar_position: 4
title: Store and Atom
---

# Store and Atom

`@vef-framework-react/core` provides two state management approaches: Zustand-based stores and Jotai atoms.

## Zustand Stores

### `createStore`

Creates a global bound store with `subscribeWithSelector` and `immer` middleware.

The state type must include a `name: string` field.

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

Usage in components:

```tsx
const count = useCounterStore(state => state.count);
const increment = useCounterStore(state => state.increment);
```

### `createPersistedStore`

Creates a global store that persists to `localStorage` or `sessionStorage`.

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

| Option | Type | Description |
| --- | --- | --- |
| `name` | `string` | Unique storage key |
| `storage` | `"local" \| "session"` | Storage type (default: `"local"`) |
| `selector` | `(state) => partial` | Select which fields to persist |

### `createComponentStore`

Creates a component-scoped store backed by React Context. Useful for sharing state within a page or feature without polluting global state.

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

Wrap the page with the provider:

```tsx
<PageStoreProvider>
  <MyPage />
</PageStoreProvider>
```

With initial state:

```tsx
<PageStoreProvider initialState={{ selectedId: "default" }}>
  <MyPage />
</PageStoreProvider>
```

### `useDeep` and `useShallow`

Selector comparison helpers for Zustand stores:

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

### Type Exports

| Type | Description |
| --- | --- |
| `SliceStateCreator<TState, TSlice, TPersist>` | State creator type for store slices |
| `UnboundStore<TState>` | Raw Zustand store without React binding |
| `UseBoundStore<TState>` | Bound store hook type |
| `UseBoundStoreWithPersist<TState>` | Bound store hook type with persistence |
| `PersistenceOptions<TState, TSelectedState>` | Options for `createPersistedStore` |
| `StoreProviderProps<TInitialState>` | Props for the component store provider |
| `UseStore<TState>` | Hook signature for `useStore` |

---

## Jotai Atoms

For lightweight, one-off state that does not need a full store.

### `atom`

```ts
import { atom } from "@vef-framework-react/core";

const modalAtom = atom({ open: false, data: null as UserRow | null });
const countAtom = atom(0);
```

### `useAtom`, `useAtomValue`, `useSetAtom`

```tsx
import { useAtom, useAtomValue, useSetAtom } from "@vef-framework-react/core";

// Read and write
const [modal, setModal] = useAtom(modalAtom);

// Read only
const modal = useAtomValue(modalAtom);

// Write only
const setModal = useSetAtom(modalAtom);
```

### `AtomStoreProvider` and `createAtomStore`

For isolated atom scopes:

```tsx
import { AtomStoreProvider, createAtomStore } from "@vef-framework-react/core";

const store = createAtomStore();

<AtomStoreProvider store={store}>
  <IsolatedFeature />
</AtomStoreProvider>
```

### `useAtomStore` and `getDefaultAtomStore`

```ts
import { useAtomStore, getDefaultAtomStore } from "@vef-framework-react/core";

// Inside component
const store = useAtomStore();

// Outside React
const store = getDefaultAtomStore();
const value = store.get(countAtom);
store.set(countAtom, 1);
```

### Atom Type Exports

| Type | Description |
| --- | --- |
| `Atom<T>` | Read-only atom type |
| `PrimitiveAtom<T>` | Read-write primitive atom type |
| `WritableAtom<T, Args, Result>` | Writable atom type |
| `AtomGetter` | Getter function type |
| `AtomSetter` | Setter function type |
| `ExtractAtomValue<T>` | Extract value type from atom |
| `ExtractAtomArgs<T>` | Extract args type from writable atom |
| `ExtractAtomResult<T>` | Extract result type from writable atom |
| `SetStateAction<T>` | Set state action type |
