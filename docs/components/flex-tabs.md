---
title: "FlexTabs"
description: "A Tabs variant that fills its height-bounded flex parent — the tab bar stays fixed and the active pane stretches to the remaining space."
---

# FlexTabs

A `Tabs` variant that fills its height-bounded flex parent — the tab bar stays fixed and the active pane stretches to the remaining space, so pane content manages its own scrolling instead of growing the page. The height-filling counterpart of the plain `Tabs` re-export, mirroring what [`FlexCard`](./flex-card.md) does for `Card`.

> **VEF-specific component.** Added in v2.12.0. Wraps the Ant Design `Tabs` re-export with height-filling layout styles.

## When to Use

- Full-height page layouts where each tab pane holds a table, console, or log view that should scroll internally while the tab bar stays pinned.
- Any `Tabs` placed inside a height-bounded column-flex container (a [`Page`](./page.md) body, a [`FlexCard`](./flex-card.md), a sized [`Stack`](./stack.md)) that should absorb the remaining height.
- Reach for the plain `Tabs` re-export when the tabs should size to their content and let the page scroll as a whole.

## Basic Usage

`FlexTabs` only fills the space its parent bounds: put it inside a column-flex container with a fixed height. A typical shape is a page whose panes are task tables:

```tsx
import { FlexTabs, Page } from '@vef-framework-react/components';

export default function TaskCenterPage() {
  return (
    <Page margin>
      {/* A height-bounded flex column: FlexTabs absorbs the remaining space. */}
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <FlexTabs
          items={[
            { key: 'pending', label: 'Pending', children: <PendingTaskTable /> },
            { key: 'completed', label: 'Completed', children: <CompletedTaskTable /> }
          ]}
        />
      </div>
    </Page>
  );
}
```

## Scrolling Inside a Pane

Because the active pane is pinned to the remaining height, scrolling belongs to the pane content — combine with [`Table`](./table.md)'s `flexHeight` or a [`ScrollArea`](./scroll-area.md):

```tsx
import { FlexTabs, ScrollArea, Table } from '@vef-framework-react/components';

<FlexTabs
  items={[
    {
      key: 'runs',
      label: 'Runs',
      // The pane is height-bounded, so the table can flex its body height.
      children: <Table flexHeight columns={columns} dataSource={runs} />
    },
    {
      key: 'raw',
      label: 'Raw Output',
      children: (
        <ScrollArea style={{ height: '100%' }}>
          <pre>{rawOutput}</pre>
        </ScrollArea>
      )
    }
  ]}
/>
```

## How the Height Filling Works

`FlexTabs` renders the Ant Design `Tabs` with an Emotion style block and changes nothing else:

- The tabs root gets `flex: 1` and `min-height: 0`, so it grows into a column-flex parent and is allowed to shrink below its content size.
- Ant Design v6 renders panes as `.vef-tabs-body-holder > .vef-tabs-body > .vef-tabs-content`. The holder is already flex-bounded, but the inner two grow with their content — `FlexTabs` pins both to `height: 100%` so the active pane ends exactly at the tabs' bottom edge.
- Some tab configurations wrap the holder in an intermediate `div`, so the rules also match `> div > .vef-tabs-body-holder`.

Two consequences worth knowing:

- **Pane scoping.** Every selector hop is a direct-child combinator, so the height rules apply only to `FlexTabs`' own panes — a `Tabs` (or another `FlexTabs`) nested *inside* a pane is never restyled from outside.
- **Class prefix.** The rules target the `vef-` class prefix that the framework's [`ConfigProvider`](./config-provider.md) sets; `FlexTabs` assumes it is rendered under that provider.

## API

`FlexTabsProps` is exactly Ant Design's `TabsProps` — a type alias with no additional members:

```ts
export type FlexTabsProps = TabsProps;
```

All `Tabs` props (`items`, `activeKey`, `defaultActiveKey`, `onChange`, `tabPosition`, `type`, `size`, …) apply unchanged; see the [Ant Design Tabs documentation](https://ant.design/components/tabs/). The layout behavior described above is added purely through styles, not props.
