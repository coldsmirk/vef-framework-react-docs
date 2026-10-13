---
title: Integration Package Overview
description: What @vef-framework-react/integration ships — management pages for the integration engine's contracts, systems, adapters, routes, and code maps, plus the ops console.
---

# Integration Package Overview

`@vef-framework-react/integration` (v2.15.0, released with framework v2.15.0 on 2026‑08‑07) is the frontend console for the VEF server's integration engine — the subsystem that talks to external vendor systems through scripted adapters behind stable, schema-validated contracts.

## When to Use

- Your VEF server runs the integration engine and you want its full management UI — including the script debugging console — by mounting six components on routes.
- You are building integration-adjacent screens (e.g. a business page that picks a contract) and want the typed API hooks (`useContractApi`, `useOpsApi`, …), directories (`useSystemDirectory`, `useContractDirectory`), and presentation components instead of raw RPC calls.

## Domain model

The engine's domains map one-to-one onto the package's permission groups and pages:

| Domain | Resource | What it is | Page |
| --- | --- | --- | --- |
| Contract | `integration/contract` | A standard operation: input/output JSON Schemas every provider adapter must honor | [`IntegrationContractPage`](./pages.md#integrationcontractpage) |
| System | `integration/system` | One external system instance: base URL, outbound/inbound auth, optional direct data source, envelope scripts, retry policy | [`IntegrationSystemPage`](./pages.md#integrationsystempage) |
| Adapter | `integration/adapter` | One system-to-contract binding in one direction: a script translating between the system's wire format and the contract's models | [`IntegrationAdapterPage`](./pages.md#integrationadapterpage) |
| Route | `integration/route` | A rule mapping a route key (tenant, branch, hospital area) to the system serving a contract | [`IntegrationRoutePage`](./pages.md#integrationroutepage) |
| Code map | `integration/code_map` (+ `integration/code_set` catalog) | Per-system bidirectional value translation of one [code set](../../guide/code-sets.md) between the canonical model and the external system's coding | [`IntegrationCodeMapPage`](./pages.md#integrationcodemappage) |
| Log | `integration/log` | The recorded invocations with masked, size-capped captures | Console → 调用日志 |
| Ops | `integration/ops` (+ `sys/monitor` stats) | Dry runs, connection probes, routing diagnosis, per-node statistics | [`IntegrationConsolePage`](./pages.md#integrationconsolepage) |

An outbound call flows *host → contract → route → system → adapter script → vendor*; an inbound delivery flows *vendor → system (inbound auth) → adapter script → `dispatch` → business handler*.

## The console workbench design

The v2.12.0 cycle redesigned all integration pages around a *console workbench* layout (commits `bdcd65f`, `b0cb7b1`; the approval package adopted the same pattern in `17830fd`):

- **Full-height screens, inner scrolling.** Pages fill the viewport; panels split the remaining height and scroll internally (tables scroll their own body; the dry-run request/result cards are side-by-side grid cells that stack in narrow viewports). Tabbed consoles use [`FlexTabs`](../../components/flex-tabs.md) so each pane owns its height.
- **Drawer forms with top labels.** Create/update forms open as wide drawers (responsive widths, `100vw` on the smallest breakpoint) with vertical label layout — standalone inputs wrapped in the shared [`Labeled`](../../components/labeled.md) component — grouped into titled sections ([`FormSection`](./reference.md#formsection)) whose header switch alone tells which optional capabilities a record has.

## Editor niceties

Several editing surfaces carry engine-aware assistance:

- **Script completions mirrored from the runtime** (`c56d318`, aligned in `094a9c6`). Every script editor (adapter scripts, envelope request/response scripts, outbound/inbound auth scripts, the dry-run console) offers completions for exactly the bindings and capability libraries the Go runtime installs on that surface — `input`, `request`, `system`, `http`, `sql`, `codes`, `dispatch`, `errors`, plus the engine baseline (`console`, `crypto`, `cache`, `dayjs`, `BigNumber`, `fxp`, `radashi`, `z`, `URL`, `URLSearchParams`). The catalogs live in [`ScriptDoc`](./reference.md#script-documentation) constants you can reuse in your own editors.
- **Hoverable script docs** (`ef47059`). Each script field's label carries a help icon ([`ScriptDocLabel`](./reference.md#scriptdoclabel)); hovering opens the surface's contract summary and full binding/library listing — rendered from the *same* completion catalog, so the popover and the autocomplete can never drift apart.
- **Scheme-aware auth parameter editor** (`ac4f860`). A system's outbound/inbound auth form renders dedicated inputs for schemes with a fixed parameter set (`http_basic` username/password, `bearer` token, `signature` app id/secret, inbound `ip` whitelist), a free name→value pair list only where parameter names are user-defined (`header`, `query`, `script`, unknown custom schemes), and nothing for `none`. Sensitive values are stored encrypted and masked back as `******` — resubmitting the mask keeps the stored secret. Switching schemes prunes parameters left over from the previous scheme (`67dfda1`).
- **Contract labels** (`a261401`, `8314fbc`). Contracts carry host-owned `labels` (edited inline with the shared `LabelsEditor`, validated inline), the contract list filters by them, and `useContractDirectory(search)` accepts label filters — so a business-side picker can offer only the contracts tagged for its scene.
- **JSON Schema keyword completions** (`c826041`). The contract form's input/output schema editors complete JSON Schema draft 2020‑12 keywords as object keys, with per-keyword documentation.
- **Wire-trace body highlighting** (`c826041`). Captured HTTP exchange bodies are auto-detected: JSON bodies re-indent and highlight, XML highlights verbatim, anything else falls back to a plain block — in both the invocation log detail and the dry-run trace.
- **Code map editing against the host catalog** (`cf2fd15`). Adapter scripts translate values with `codes.toExternal` / `codes.toCanonical`; the code-map form picks the code set from the host's registered catalog (`integration/code_set.list_code_sets`, auto-filling the name) with manual free-text fallback when the host registers no enumerable catalog. The entries editor suggests host canonical codes while typing, and a reference line lists the canonical codes of the selected set (`72353da`).
- **Transport-encoded script bodies** (`ca2a738`). Create/update bodies for script-carrying resources (system outbound/inbound auth scripts, envelope scripts, adapter scripts, and the dry-run console) are transport-encoded with `gzip+base64` so they survive middleboxes that inspect request payloads.

## Mounting the pages

No provider is required — mount each page directly on a route. The playground uses `/sys/integration-*`:

```tsx
// routes/sys/integration-system/route.tsx
import { createFileRoute } from "@tanstack/react-router";
import { IntegrationSystemPage } from "@vef-framework-react/integration";

export const Route = createFileRoute("/_layout/sys/integration-system")({
  component: () => <IntegrationSystemPage />
});
```

Recommended order in a menu mirrors the dependency chain: contracts → systems → adapters → routes → code maps → console. See [Pages](./pages.md) for each page's permissions and endpoints, and the [API Reference](./reference.md) for the full export tables.

## Permission model

`INTEGRATION_PERMISSIONS` mirrors the backend codes verbatim: standard `query`/`create`/`update`/`delete` per CRUD domain (`contract`, `system`, `adapter`, `route`, `codeMap`), `log.query` plus `log.replay` for re-running a recorded invocation, and four operational codes (`ops.dry_run`, `ops.dry_run_inbound`, `ops.test_connection`, `ops.diagnose_routes`). The host code-set catalog endpoints reuse `codeMap.query` — the catalog exists solely to support the mapping editor. Every page accepts a `permissions` override; see [Permissions](../../guide/permissions.md).
