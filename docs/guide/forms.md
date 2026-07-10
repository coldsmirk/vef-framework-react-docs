---
title: Forms
description: How VEF's form layer composes useForm, field components, and data-driven options into a typical page form.
---

# Forms

VEF form capabilities mainly come from `@vef-framework-react/components`, and the two main entry points are:

- `useForm()`
- `useFormContext()`

It can be understood as an enterprise-oriented UI wrapper around TanStack Form. The full field-component list and every shared `FormItemProps` field live in [Form](../components/form.md); this page focuses on how a form is put together.

## Typical Usage

```tsx
import { Grid, useDictionaryOptionsSelect, useFormContext } from "@vef-framework-react/components";
import { z } from "@vef-framework-react/shared";

const validators = {
  name: z.string("Required").min(2, "At least 2 characters"),
  gender: z.string("Required")
};

export function UserForm() {
  const { AppField } = useFormContext<{ name: string; gender: string }>();

  const { gender } = useDictionaryOptionsSelect({
    gender: "common.gender"
  });

  return (
    <Grid columnGap="small">
      <Grid.Item span={12}>
        <AppField name="name" validators={{ onBlur: validators.name }}>
          {field => <field.Input required label="Name" />}
        </AppField>
      </Grid.Item>

      <Grid.Item span={12}>
        <AppField name="gender" validators={{ onChange: validators.gender }}>
          {field => <field.Select {...gender} required label="Gender" />}
        </AppField>
      </Grid.Item>
    </Grid>
  );
}
```

## `useForm()` Creates the Form Instance

```tsx
import { useForm } from "@vef-framework-react/components";

const {
  Form,
  AppField,
  SubmitButton
} = useForm({
  defaultValues: {
    keyword: ""
  },
  onSubmit({ value }) {
    console.log(value);
  }
});
```

## `useFormContext()` Works Well for Split Forms

When a form is split into separate components, a new form instance is usually not needed. `AppField` can be retrieved from context instead:

```tsx
const { AppField } = useFormContext<FormValues>();
```

This is the pattern to reach for once a form grows beyond a single component — a search bar, a scene-specific form body, and a footer of actions can each pull `AppField` from the same form context instead of threading form state through props.

## Validation with `z`

```tsx
import { z } from "@vef-framework-react/shared";

const validators = {
  username: z.string("Required").min(2, "At least 2 characters").max(16, "At most 16 characters"),
  email: z.email().nullish()
};
```

`@vef-framework-react/shared` re-exports a project-configured Zod instance, so validators stay consistent with the rest of the codebase without an extra dependency.

## Feeding Data into Option Fields

VEF applications usually avoid fetching inside field components. Instead, hooks generate props that can be spread directly into controls, keeping data sourcing and field rendering as separate concerns.

### Select

```tsx
const roleSelectProps = useDataOptionsSelect({
  filterable: true,
  queryOptions: {
    queryKey: [findRoleOptions.key],
    queryFn: findRoleOptions
  }
});
```

### Tree Select

```tsx
const deptTreeSelectProps = useDataOptionsTreeSelect({
  filterable: true,
  queryOptions: {
    queryKey: [findDepartmentTree.key],
    queryFn: findDepartmentTree
  }
});
```

### Data Dictionary

```tsx
const { gender } = useDictionaryOptionsSelect({
  gender: "common.gender"
});

// <field.Select {...gender} />
```

`useDictionaryOptionsSelect(keys, options?)` returns a `{ alias: SelectProps }` map. Pass `{ filterable: true }` (or per-key `{ key: { key: "...", filterable: true } }`) to enable pinyin search — see [Data Dictionaries](./data-dictionaries.md) for where the underlying data comes from.

## Dependent Fields & Linkage

Because the form layer is TanStack Form underneath, one field can react to another without extra machinery. Three mechanisms cover the common cases:

- `Subscribe` — re-renders a slice of UI whenever a selected part of form state changes; use it to show, hide, disable, or re-require a field based on another field's value.
- `listeners` on `AppField` — runs a side effect when a field's value changes; use it to reset or derive dependent values.
- `useFormStore()` — the hook form of `Subscribe`, for when a whole component needs the value.

### Reacting to Another Field

`Subscribe` comes from the same place as `AppField` — `useForm()` or `useFormContext()`. Its `selector` decides what triggers a re-render, so typing in unrelated fields does not re-render the subscribed block:

```tsx
const { AppField, Subscribe } = useFormContext<MenuFormValues>();

<AppField name="path">
  {field => (
    <Subscribe selector={state => state.values.type}>
      {type => (
        <field.Input
          disabled={type === "button"}
          label="Path"
          required={type !== "button"}
        />
      )}
    </Subscribe>
  )}
</AppField>
```

The same component works outside `AppField` too, for showing or hiding an entire block:

```tsx
<Subscribe selector={state => state.values.orgId}>
  {orgId => orgId && <DepartmentSection orgId={orgId} />}
</Subscribe>
```

Keep selectors narrow — `state.values.type`, not `state.values` — so the block only re-renders when the value it actually depends on changes.

### Deriving and Resetting Values

`AppField` accepts a `listeners` prop. The `onChange` listener receives the new `value` and the `fieldApi`, whose `form` property reaches the rest of the form — `form.resetField()` puts a dependent field back to its default, and `form.setFieldValue()` writes a derived value (it also accepts an updater function `prev => next`):

```tsx
<AppField
  name="quantity"
  listeners={{
    onChange: ({ value, fieldApi: { form } }) => {
      form.setFieldValue("total", (value ?? 0) * form.state.values.unitPrice);
    }
  }}
>
  {field => <field.InputNumber required label="Quantity" />}
</AppField>
```

Unlike `validators`, listeners are for side effects — they never produce error messages.

### Cascading Options

Cascading combines the two mechanisms: the controlling field resets its dependent on change, and the dependent field's options query keys off the controlling value.

```tsx
function DepartmentField({ orgId }: { orgId?: string }) {
  const { AppField } = useFormContext<StaffFormValues>();

  const deptTreeSelectProps = useDataOptionsTreeSelect({
    filterable: true,
    queryOptions: {
      queryKey: [findDepartmentTree.key, { orgId }],
      queryFn: findDepartmentTree,
      enabled: Boolean(orgId)
    }
  });

  return (
    <AppField name="deptId">
      {field => <field.TreeSelect {...deptTreeSelectProps} label="Department" />}
    </AppField>
  );
}
```

The parent wires the two fields together:

```tsx
<AppField
  name="orgId"
  listeners={{
    onChange: ({ fieldApi: { form } }) => form.resetField("deptId")
  }}
>
  {field => <field.TreeSelect {...orgTreeSelectProps} required label="Organization" />}
</AppField>

<Subscribe selector={state => state.values.orgId}>
  {orgId => <DepartmentField orgId={orgId} />}
</Subscribe>
```

Because `orgId` is part of the `queryKey`, picking a different organization refetches the department options automatically (`enabled` keeps the query idle until one is chosen), and the `listeners` reset prevents a stale `deptId` from surviving the switch.

### Subscribing from Hook Code

When the value is needed in ordinary hook code rather than inside JSX, `useFormStore(form.store, selector)` has the same selector semantics as `Subscribe`:

```tsx
import { useForm, useFormStore } from "@vef-framework-react/components";

const form = useForm({
  defaultValues: { type: "menu", path: "" }
});

const type = useFormStore(form.store, state => state.values.type);
```

To wire an entirely custom control into a dependent field, see [Custom Form Components](../advanced/custom-form-components.md).

## Why the Split Matters

Keeping data sourcing (`useDataOptionsSelect()`, `useDictionaryOptionsSelect()`, ...) separate from field rendering (`AppField`) and layout (`Grid`) means:

- option-loading logic can be reused across a create form, an edit form, and a search bar
- a field component never needs to know whether its options come from a dictionary, a query, or a tree
- swapping a field's data source does not touch its layout or validation

For the full set of available field components (`field.Input`, `field.Select`, `field.Bool`, and the rest), see [Form](../components/form.md).
