---
title: Store and Atom
description: createStore, createPersistedStore, createComponentStore, Jotai atom signatures, and the XState state-machine exports.
---

# Store and Atom

`@vef-framework-react/core` provides three state management approaches: Zustand-based stores, Jotai atoms, and XState state machines (documented [at the end of this page](#xstate-state-machines)).

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

Creates a global store that persists to `localStorage` or `sessionStorage` (Zustand `persist` middleware, storage key `__VEF_STORE__<CONSTANT_CASE(name)>__`, JSON serialization, version `1`). Unlike `createStore`, the state type does not need a `name` field — the store name comes from the persistence options.

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

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | — (required) | Unique store name; converted to `CONSTANT_CASE` inside the storage key |
| `storage` | `"local" \| "session"` | `"session"` | Storage backend. Only the explicit value `"local"` selects `localStorage`; omitting the option (or any other value) selects `sessionStorage` |
| `selector` | `(state: TState) => TSelectedState` | identity | Selects which fields to persist (Zustand `partialize`) |

### `createComponentStore`

Creates a component-scoped store backed by React Context. Useful for sharing state within a page or feature without polluting global state.

```ts
createComponentStore<TState, TInitialState extends Partial<TState> = never>(
  name: string,
  initializer: ComponentStoreInitializer<TState>,
  persistOptions?: Except<PersistenceOptions<TState, Partial<TState>>, "name">
): ReturnedComponentStoreResult<TState, TInitialState>
```

| Param | Type | Description |
| --- | --- | --- |
| `name` | `string` | Store name, used for the context display name and error messages (the context is cached by name to survive React Fast Refresh) |
| `initializer` | `ComponentStoreInitializer<TState>` | Zustand state initializer (with the same `subscribeWithSelector` + `immer` middleware stack as `createStore`) |
| `persistOptions` | `Except<PersistenceOptions, "name">` | Optional persistence configuration (`storage`, `selector`). When provided, `StoreProvider` accepts a `storageKey` prop that turns persistence on for that instance |

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

#### `StoreProviderProps`

| Prop | Type | Description |
| --- | --- | --- |
| `initialState` | `TInitialState` | Initial state patch. Required when the store declares a `TInitialState` type parameter, forbidden otherwise. Merged into the store **after mount** (in an isomorphic layout effect), overriding initializer values for the provided keys; non-plain-object values are ignored |
| `storageKey` | `string` | Storage key for state persistence (full key: `__VEF_COMPONENT_STORE__<CONSTANT_CASE(storageKey)>__`). Only takes effect when the store was created with `persistOptions`. Different provider instances should use different keys |

#### Behavior notes

- `useStore()` without a selector returns the whole state; `useStore(selector)` subscribes to the selected slice.
- `useStoreApi()` returns the raw store object (`getState` / `setState` / `subscribe`) and **throws** when no enclosing `StoreProvider` is found (in dev, the error also hints that a hot-reload refresh may fix a stale context).

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
| `SliceStateCreator<TState, TSlice, TPersist>` | State creator type for store slices (middleware-aware; set `TPersist` to `true` for persisted stores) |
| `UnboundStore<TState>` | Raw Zustand store without React binding (`subscribeWithSelector` + `immer` mutators) |
| `UseBoundStore<TState>` | Bound store hook type returned by `createStore` |
| `UseBoundStoreWithPersist<TState>` | Bound store hook type returned by `createPersistedStore` |
| `PersistenceOptions<TState, TSelectedState>` | Options for `createPersistedStore` and `createComponentStore`'s `persistOptions` |
| `StoreProviderProps<TInitialState>` | Props for the component store provider (`initialState`, `storageKey`, `children`) |
| `UseStore<TState>` | Hook signature for `useStore` — `(): TState` and `<TSelected>(selector: (state: TState) => TSelected): TSelected` |
| `ReturnedComponentStoreResult<TState, TInitialState>` | Return type of `createComponentStore` — `{ StoreProvider, useStoreApi, useStore }` |

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
| `AtomGetter` | Getter function type (Jotai's `Getter`, renamed) |
| `AtomSetter` | Setter function type (Jotai's `Setter`, renamed) |
| `ExtractAtomValue<T>` | Extract value type from atom |
| `ExtractAtomArgs<T>` | Extract args type from writable atom |
| `ExtractAtomResult<T>` | Extract result type from writable atom |
| `SetStateAction<T>` | Set state action type |

---

## XState State Machines

For complex state transitions, `@vef-framework-react/core` re-exports XState with one VEF-specific hook. Pick by complexity: store for shared app state, atom for one-off state, machine for statechart-shaped logic.

### `useActor`

The VEF-maintained hook. Combines actor creation (`useActorRef`) with selector-based state subscription (`useSelector`, compared with `Object.is`), so the component re-renders only when the selected value changes:

```ts
useActor<TLogic extends AnyActorLogic, TSelected>(
  logic: TLogic,
  selector: (snapshot: SnapshotFrom<TLogic>) => TSelected,
  options?: ActorOptions<TLogic> // required when the logic declares required inputs
): [TSelected, Actor<TLogic>["send"], Actor<TLogic>]
```

| Param | Type | Description |
| --- | --- | --- |
| `logic` | `TLogic extends AnyActorLogic` | The actor logic (a state machine or other actor logic) |
| `selector` | `(snapshot: SnapshotFrom<TLogic>) => TSelected` | Selects data from the actor's snapshot |
| `options` | `ActorOptions<TLogic>` | Actor configuration; the parameter becomes **required** when the logic has required actor options (e.g. `input`) |

Returns `[selectedState, send, actorRef]`.

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

### Re-Exports

| Export | Source | Description |
| --- | --- | --- |
| `createMachine` | `xstate` | Defines a state machine |
| `createActor` | `xstate` | Creates an actor from logic outside React |
| `Actor` | `xstate` | The actor class |
| `updateContext` | `xstate` | XState's `assign` action creator, renamed — updates machine context |
| `useActorRef` | `@xstate/react` | Creates an actor and returns a stable ref without subscribing to state |

### State-Machine Type Exports

| Type | Description |
| --- | --- |
| `ActorLogic` / `AnyActorLogic` | Actor logic types |
| `ActorOptions<TLogic>` | Actor configuration options |
| `RequiredActorOptionsKeys<TLogic>` | Keys of `ActorOptions` the logic makes required |
| `MachineConfig` / `MachineContext` | Machine definition and context types |
| `StateMachine` / `AnyStateMachine` | Machine types |
| `MachineSnapshot` / `AnyMachineSnapshot` | Snapshot types |
| `SnapshotFrom<TLogic>` | Snapshot type derived from actor logic |
