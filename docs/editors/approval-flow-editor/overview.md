---
title: Approval Flow Editor Overview
description: What ApprovalFlowEditor is, the FlowDefinition contract it edits, and the six node kinds it supports.
---

# Approval Flow Editor Overview

`@vef-framework-react/approval-flow-editor` is a visual editor for approval-workflow routing graphs. It renders `<ApprovalFlowEditor>`, a canvas built on `@xyflow/react` v12 (ReactFlow) with one-click auto-layout powered by `elkjs` (loaded on demand from the toolbar, not part of the initial bundle). The editor is a controlled component: it reads a `FlowDefinition` and emits one back through `onChange` — the same JSON shape the Go backend's `NodeDefinition` / `EdgeDefinition` contract uses, so what the editor emits is what deploys.

## Quick start

```tsx
import type { FlowDefinition } from "@vef-framework-react/approval-flow-editor";

import { ApprovalFlowEditor } from "@vef-framework-react/approval-flow-editor";
import { useState } from "react";

function FlowDesigner() {
  const [definition, setDefinition] = useState<FlowDefinition>({ nodes: [], edges: [] });

  return (
    <div style={{ height: 600 }}>
      <ApprovalFlowEditor value={definition} onChange={setDefinition} />
    </div>
  );
}
```

An empty or missing `value` (no nodes) seeds the canvas with a minimal valid flow: one start node connected to one end node. From there the toolbar lets the user add `approval` / `handle` / `condition` / `cc` nodes and wire them up.

## Node kinds

Every node carries one of six kinds. Start and end are structural bookends the editor manages itself — neither addable from the toolbar nor deletable by the user:

| Kind | Label | Max count | Deletable | Addable |
| --- | --- | --- | --- | --- |
| `start` | Start | 1 | No | No |
| `approval` | Approval | — | Yes | Yes |
| `handle` | Handle | — | Yes | Yes |
| `condition` | Condition | — | Yes | Yes |
| `cc` | CC | — | Yes | Yes |
| `end` | End | 1 | No | No |

- **`approval`** — a decision point: assignees vote sequentially or in parallel, with pass rules, rollback, timeout, and add/remove-assignee behavior.
- **`handle`** — assignees perform work rather than approve/reject; it shares the same assignee/timeout/CC machinery as `approval` but cannot auto-reject.
- **`condition`** — branches the graph. Each branch is a set of AND-ed condition groups (OR-ed against each other); exactly one branch must be marked default, and exactly one outgoing edge must bind to each branch.
- **`cc`** — notifies recipients without gating the flow; carries its own (read-only) field-permission matrix.

See [Host Integration](./host-integration.md) for wiring pickers and form field metadata into the editor, and [API Reference](./reference.md) for the full type and export tables.

## Controlled round-trip

`value` / `onChange` behave like a standard controlled input, with two refinements that matter for a canvas:

- The editor only reloads the canvas when `value` changes to a **new** definition it did not itself emit. Passing the object handed to `onChange` straight back as `value` (the standard `useState` round-trip) is recognized by reference and never remounts nodes or clears the selection mid-edit.
- Every definition emitted through `onChange` is a detached deep copy — it never aliases live editor state, so the host may store, mutate, or persist it freely.

## Publishing and readonly mode

- `onPublish` renders a publish button (top-right panel) when provided; clicking it runs `validateFlowDefinition` and only calls `onPublish` when the flow is structurally deploy-ready, blocking otherwise. This mirrors `FormEditor`'s `onPublish` gate, so a host can wire both editors the same way inside a multi-step wizard. `publishText` relabels the button (default `"发布"`); `publishLoading` shows a spinner and blocks re-clicks during an async publish.
- `readonly` disables node/edge selection, dragging, connecting, and hides the toolbar and publish button — for a read-only review view of a deployed flow.
