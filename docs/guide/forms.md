---
sidebar_position: 4
title: Forms
---

# Forms

VEF form capabilities mainly come from `@vef-framework/components`, and the two main entry points are:

- `useForm()`
- `useFormContext()`

It can be understood as an enterprise-oriented UI wrapper around TanStack Form.

## Typical Usage

```tsx
import { Grid, useDataOptionsSelect, useFormContext } from "@vef-framework/components";
import { z } from "@vef-framework/shared";

const validators = {
  name: z.string("Required").min(2, "At least 2 characters"),
  gender: z.string("Required")
};

export function UserForm() {
  const { AppField } = useFormContext<{ name: string; gender: string }>();

  const genderSelectProps = useDataOptionsSelect({
    dataDictKey: "common.gender"
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
          {field => <field.Select {...genderSelectProps} required label="Gender" />}
        </AppField>
      </Grid.Item>
    </Grid>
  );
}
```

## `useForm()` Creates the Form Instance

```tsx
import { useForm } from "@vef-framework/components";

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

## Validation with `z`

```tsx
import { z } from "@vef-framework/shared";

const validators = {
  username: z.string("Required").min(2, "At least 2 characters").max(16, "At most 16 characters"),
  email: z.email().nullish()
};
```

## Feeding Data into Option Fields

VEF applications usually avoid fetching inside field components. Instead, hooks generate props that can be spread directly into controls.

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
const genderSelectProps = useDataOptionsSelect({
  dataDictKey: "common.gender"
});
```

## Common Field Types

- `field.Input`
- `field.Password`
- `field.TextArea`
- `field.Select`
- `field.TreeSelect`
- `field.Bool`
- `field.Upload`
- `field.DatePicker`
- `field.InputNumber`

It is usually better to keep data sourcing and field rendering separate:

- `useDataOptionsSelect()` fetches or builds options
- `AppField` binds field state
- `Grid` handles layout
