---
sidebar_position: 4
title: Icons
---

# Icons

VEF exposes two icon entry points most often used in application code:

- `Icon`
- `DynamicIcon`

## `Icon`

Use `Icon` when a Lucide icon component is referenced directly in code:

```tsx
import { Icon } from "@vef-framework-react/components";
import { PlusIcon } from "lucide-react";

<Icon component={PlusIcon} />
```

## `DynamicIcon`

Use `DynamicIcon` when icon names come from configuration or backend data, such as menu metadata.

```tsx
import { DynamicIcon } from "@vef-framework-react/components";

<DynamicIcon name="users" />
```

It automatically:

- lazy-loads icon assets
- caches loaded icons
- falls back safely for unknown icon names

## Menu Use Case

`createLayoutRouteOptions()` passes backend menu `icon` fields into `DynamicIcon`, which makes backend-driven icon names a natural fit for menu systems.

## Recommended Usage

- use `Icon` for fixed icons in page code
- use `DynamicIcon` for icon names coming from menus, config, or data
