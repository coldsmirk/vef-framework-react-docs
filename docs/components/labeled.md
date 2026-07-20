---
title: "Labeled"
description: "A layout primitive that puts a form-style label on top of an arbitrary control, with real label and group semantics for assistive technology."
---

# Labeled

A layout primitive that puts a form-style label on top of an arbitrary control, with real label and group semantics for assistive technology. It matches the vertical form-item typography, so controls that live outside the form system visually align with the `AppField` items around them.

> **VEF-specific component.** Added in v2.12.0.

## When to Use

- Give a top label to controls that are not form field components — key-value editors ([`LabelsEditor`](./labels.md)), principal pickers, [`CodeEditor`](./code-editor.md) instances — so they line up with the vertical form items around them.
- Show a required marker or a secondary hint on such a control.
- Don't use it for regular form fields: `AppField` field components from the [`Form`](./form.md) system already render their own label, error, and hint scaffolding.

## Basic Usage

The children are arbitrary — `Labeled` never injects props into them. A typical use is wrapping a composite editor inside a form layout:

```tsx
import { Labeled, LabelsEditor } from '@vef-framework-react/components';
import { useState } from 'react';

export default function Demo() {
  const [labels, setLabels] = useState<Record<string, string>>({});

  return (
    <Labeled hint="Values may be left empty" label="Labels">
      <LabelsEditor value={labels} onChange={setLabels} />
    </Labeled>
  );
}
```

## Required Marker and Native Association

When the child renders a single control with a known id, pass `htmlFor` to get the native label-click association on top of the group semantics:

```tsx
import { Input, Labeled } from '@vef-framework-react/components';

<Labeled required htmlFor="webhook-url" label="Webhook URL">
  <Input id="webhook-url" placeholder="https://example.com/hook" />
</Labeled>
```

## Accessibility Semantics

`Labeled` carries real label and group semantics, not just visual styling:

- The wrapper is a [`Stack`](./stack.md) with `role="group"` whose `aria-labelledby` points at the label element — assistive tech names the whole group after the label even when the children are composite and no single control id exists.
- The label renders as a native `<label>` element; with `htmlFor` it additionally gets the native label-click / announcement association to that control.
- When `hint` is given, the group's `aria-describedby` points at the hint text, so it doubles as the accessible description.
- The `required` marker renders a red `*` that is `aria-hidden`, paired with visually hidden text, so screen readers announce the requirement without reading a bare asterisk.

## API

### LabeledProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `ReactNode` | — | Label shown above the control, matching the vertical form-item typography |
| `required` | `boolean` | `false` | Render the required marker (red `*`, hidden from assistive tech, with visually hidden replacement text) before the label |
| `hint` | `ReactNode` | — | Secondary hint under the control, rendered in small secondary text and wired up as the group's accessible description |
| `htmlFor` | `string` | — | Id of the labeled control, for the native label-click association. When omitted (composite children have no single control id), the group labelling still names the children for assistive tech |
| `children` | `ReactNode` | — | The control(s) being labeled; rendered as-is, no props are injected |
