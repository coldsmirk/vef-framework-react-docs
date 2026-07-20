---
title: Cron API Reference
description: Exhaustive reference for every export of @vef-framework-react/cron — permissions, schedule and run APIs, form model helpers, trigger editor, and wire types.
---

# Cron API Reference

Everything exported from the root of `@vef-framework-react/cron`, grouped as in the source: [permissions](#permissions), [API hooks](#api-hooks), [page helpers](#page-helpers-and-form-model), [components](#components), and [types](#types). The two page components and their props are covered in the [Overview](./overview.md#pages).

`QueryFunction<TData, TParams>` / `MutationFunction<TData, TParams>` are the framework's keyed function shapes from `@vef-framework-react/core`; `PaginatedQueryParams<TSearch>` is the ProTable query shape from `@vef-framework-react/components`; `ApiResult<T>` is the standard response envelope.

## Permissions

### `CRON_PERMISSIONS`

`const` — permission codes for the durable cron store management API, mirroring the backend `RequiredPermission` strings verbatim. All schedule mutations (create / update / delete / pause / resume / trigger_now) share the single `manage` code — there are no per-action codes. See [Permissions](../../guide/permissions.md).

| Group.key | Code | Gates |
| --- | --- | --- |
| `schedule.query` | `cron.schedule.query` | Schedule list, detail, job-name list, fire preview |
| `schedule.manage` | `cron.schedule.manage` | Create, update (incl. rename), delete, pause, resume, trigger now |
| `run.query` | `cron.run.query` | Run journal list and single-run fetch |

Type exports: `CronPermissions` (`typeof CRON_PERMISSIONS`), `SchedulePermissionCodes` (`CronPermissions["schedule"]`), `RunPermissionCodes` (`CronPermissions["run"]`).

## API hooks

### Query plumbing

| Export | Signature | Description |
| --- | --- | --- |
| `API_PATH` | `const "/api"` | The framework RPC endpoint every management call posts to. |
| `splitQueryParams` | `<TSearch extends AnyObject>(queryParams: PaginatedQueryParams<TSearch>) => { params: Omit<PaginatedQueryParams<TSearch>, typeof SYMBOL_PAGINATION>; pagination: PaginationParams \| undefined }` | Splits ProTable's symbol-keyed query params into plain search params and pagination metadata. The sort symbol stays on `params`; JSON serialization drops it. |

### `useScheduleApi`

`() => ScheduleApi` — the query and mutation functions for the durable schedule store (`sys/cron/schedule`). Addressing is by `name` (there is no id-keyed delete and no batch delete), and every mutation shares the single `cron.schedule.manage` permission on the backend.

| Function | Type | Operation |
| --- | --- | --- |
| `findPage` | `QueryFunction<PaginationResult<Schedule>, PaginatedQueryParams<ScheduleSearch>>` | `find_page` — converts the framework select's `isEnabled` toggle string (`"true"` / `"false"`) into the real boolean the wire eq filter expects (dropped when unset) |
| `get` | `QueryFunction<ScheduleDetail, ScheduleNameParams>` | `get` — the schedule plus a preview of its next fire times |
| `listJobs` | `QueryFunction<string[]>` | `list_jobs` — the job names registered on the answering node (the only legal `jobName` values) |
| `previewFires` | `QueryFunction<PreviewFiresResult, PreviewFiresParams>` | `preview_fires` — validated exactly like a save, so an invalid expression comes back as a business error |
| `create` | `MutationFunction<ApiResult<unknown>, ScheduleParams>` | `create` |
| `update` | `MutationFunction<ApiResult<unknown>, ScheduleParams>` | `update` — an optional `newName` renames |
| `remove` | `MutationFunction<ApiResult<unknown>, ScheduleNameParams>` | `delete` — sends `{ name }` |
| `pause` | `MutationFunction<ApiResult<unknown>, ScheduleNameParams>` | `pause` |
| `resume` | `MutationFunction<ApiResult<unknown>, ScheduleNameParams>` | `resume` |
| `triggerNow` | `MutationFunction<ApiResult<unknown>, ScheduleNameParams>` | `trigger_now` — one execution through the normal claim flow |

### `useRunApi`

`() => RunApi` — read-only query functions for the run journal (`sys/cron/run`). The detail view refetches the full row through `find_one` so it always shows the complete, untruncated error text.

| Function | Type | Operation |
| --- | --- | --- |
| `findPage` | `QueryFunction<PaginationResult<Run>, PaginatedQueryParams<RunSearch>>` | `find_page` |
| `findOne` | `QueryFunction<Run, RunIdParams>` | `find_one` |

## Page helpers and form model

Exported so hosts can rebuild or extend the schedule form with identical semantics.

### `ScheduleFormValues`

The schedule form's values. The trigger is held in the editor's value+unit shape, the timeout as a value+unit pair, and `params` as raw JSON text — all collapsed to the API model on submit. `originalName` is the addressing name captured when editing, so a changed `name` becomes a rename (`newName`).

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string?` | Row id (present when editing). |
| `originalName` | `string?` | The addressing name captured when editing. |
| `name` | `string` | Unique schedule name; editing it renames. |
| `jobName` | `string` | The registered job handler. |
| `trigger` | `TriggerFormValues` | The trigger in editor shape. |
| `startsAt` / `endsAt` | `string` | Effective window (empty = unbounded on that side). |
| `misfirePolicy` | `MisfirePolicy` | `fire_now` / `skip`. |
| `concurrencyPolicy` | `ConcurrencyPolicy` | `forbid` / `allow`. |
| `recover` | `boolean` | Re-fire after a node crash (idempotent handlers only). |
| `timeoutValue` / `timeoutUnit` | `number` / `string` | Per-run timeout as value+unit (0 = global default). |
| `paramsText` | `string` | The params JSON text. |
| `enabled` | `boolean` | Enabled state. |

### Form model functions

| Export | Signature | Description |
| --- | --- | --- |
| `SCHEDULE_FORM_DEFAULTS` | `const ScheduleFormValues` | Defaults for a newly created schedule (`cron` trigger, `fire_now`, `forbid`, no recovery, zero timeout, enabled). |
| `scheduleToFormValues` | `(row: Schedule) => ScheduleFormValues` | Projects a saved schedule into editable form values (splitting `timeoutMs` / `everyMs` into the most readable value+unit). |
| `scheduleToParams` | `(values: ScheduleFormValues) => ScheduleParams` | Converts form values into API params: addresses by `originalName`, renames via `newName`, collapses the trigger, timeout and params. |
| `parseJsonParams` | `(text: string) => JsonParamsResult` | Parses the params textarea into a JSON object. Empty text is valid and omits the params entirely; anything that is not a JSON object is rejected. |
| `jsonParamsError` | `(text: string) => string \| undefined` | The field-validator form of `parseJsonParams`: an error message when invalid, `undefined` when valid. |
| `JsonParamsResult` | `{ ok: true; value?: JsonObject } \| { ok: false; error: string }` | The outcome of parsing the params textarea. |
| `TIMEOUT_UNIT_OPTIONS` | `Array<{ label: string; value: string }>` | Select options derived from `TIMEOUT_UNITS`. |
| `useScheduleFormMutations` | `() => { create: MutationFunction<ApiResult<unknown>, ScheduleFormValues>; update: MutationFunction<ApiResult<unknown>, ScheduleFormValues> }` | Form mutations that collapse the schedule form into API params (via `scheduleToParams`) before submitting create/update — pluggable straight into `CrudPage.formMutationFns`. |
| `useJobNames` | `() => { options: Array<{ label: string; value: string }>; loading: boolean }` | The registered job names as select options (from `list_jobs`). |
| `ScheduleSceneValues` | `CrudBasicSceneFormValues<ScheduleFormValues, ScheduleFormValues>` | Create and update share the schedule form shape. |

## Components

### `TriggerEditor`

Props exported as `TriggerEditorProps`. A trigger editor: a kind switch (cron / interval / once) revealing the kind-specific fields — cron expression + timezone, interval value + unit, or a date-time picker — plus a debounced (400 ms) live preview of the next fire times via `preview_fires`. The preview renders inline errors for invalid expressions and an empty state when the effective window contains no fire times.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `TriggerFormValues` | — | The trigger in editor shape. |
| `onChange` | `(value: TriggerFormValues) => void` | — | Emitted on every edit. |
| `startsAt` | `string` | — | The schedule's effective-window start, echoed into the fire preview. |
| `endsAt` | `string` | — | The schedule's effective-window end, echoed into the fire preview. |

### Trigger helpers

| Export | Signature | Description |
| --- | --- | --- |
| `TriggerFields` | `Pick<Schedule, "kind" \| "expr" \| "timezone" \| "everyMs" \| "fireAt">` | The subset of a schedule row that describes its trigger. |
| `TriggerFormValues` | `{ kind: TriggerKind; expr: string; timezone: string; intervalValue: number; intervalUnit: string; at: string }` | The editor's UI-facing value; the interval is a value+unit pair converted to `everyMs` on submit. |
| `DEFAULT_TRIGGER` | `const TriggerFormValues` | A fresh trigger: the `cron` kind with an empty expression, plus a once-a-minute interval prefilled for when the user switches kinds. |
| `triggerToFormValues` | `(schedule: TriggerFields) => TriggerFormValues` | Projects a saved trigger into editor values. |
| `triggerFormToParams` | `(trigger: TriggerFormValues) => TriggerParams` | Converts the editor value into wire params, keeping only the fields the chosen kind needs. |
| `isTriggerComplete` | `(trigger: TriggerFormValues) => boolean` | Whether the trigger has enough filled in to preview: a cron expression, an interval of at least the 1000 ms floor, or a chosen once time. |
| `formatTriggerSummary` | `(schedule: TriggerFields) => string` | A one-line, humanized trigger summary for a schedule row: the cron expression (with timezone), the interval rate, or the single fire time. |

### Duration utilities

`DurationUnit` — `{ label: string; value: string; ms: number }`, a selectable time unit paired with its size in milliseconds.

| Export | Signature | Description |
| --- | --- | --- |
| `INTERVAL_UNITS` | `DurationUnit[]` | Units for the fixed-rate interval trigger (`everyMs`): 秒 / 分钟 / 小时 / 天. |
| `TIMEOUT_UNITS` | `DurationUnit[]` | Units for the per-run timeout (`timeoutMs`): 毫秒 / 秒 / 分钟. |
| `combineDurationMs` | `(value: number, unit: string, units: DurationUnit[]) => number` | Combines a value expressed in `unit` into milliseconds. An unknown unit falls back to the first (smallest) unit; a negative value clamps to zero. |
| `splitDurationMs` | `(ms: number, units: DurationUnit[]) => { value: number; unit: string }` | Splits milliseconds into the coarsest unit that divides it evenly, so a saved `everyMs`/`timeoutMs` round-trips to the most readable value+unit. Zero maps to the smallest unit with a zero value. |

### Status and formatting

| Export | Signature | Description |
| --- | --- | --- |
| `RunStatusBadge` | `({ status: RunStatus }) => JSX.Element` | A run's lifecycle status as a colored tag. |
| `EnabledTag` | `({ enabled: boolean }) => JSX.Element` | 启用 / 停用 as a success/neutral tag. |
| `RUN_STATUS_COLORS` | `Record<RunStatus, string>` | antd Tag color tokens per run status. |
| `RUN_STATUS_LABELS` / `RUN_STATUS_OPTIONS` | `Record<RunStatus, string>` / options array | Labels and ready-made select options. |
| `TRIGGER_KIND_LABELS` / `TRIGGER_KIND_OPTIONS` | `Record<TriggerKind, string>` / options array | Trigger-kind labels and options. |
| `MISFIRE_POLICY_LABELS` / `MISFIRE_POLICY_OPTIONS` | `Record<MisfirePolicy, string>` / options array | Misfire-policy labels and options. |
| `CONCURRENCY_POLICY_LABELS` / `CONCURRENCY_POLICY_OPTIONS` | `Record<ConcurrencyPolicy, string>` / options array | Concurrency-policy labels and options. |
| `formatTimestamp` | `(value?: string \| null) => string` | Formats a naive local wall-clock timestamp (`YYYY-MM-DD HH:mm:ss`), or a dash when empty. |
| `formatDuration` | `(ms?: number \| null) => string` | Humanizes a run duration: sub-second stays `ms`, under a minute becomes `s`, longer becomes `min`; missing/zero is a dash. |

### `RunDetailDrawer`

The run detail drawer, exported standalone. It refetches the full row through `find_one` so the complete, untruncated error text is always available.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `runId` | `string \| null` | — | The run to show; `null` keeps the drawer closed. |
| `onClose` | `() => void` | — | Close handler. |

## Types

### Base and JSON

| Type | Shape | Notes |
| --- | --- | --- |
| `CreationAudited` | `{ id: string; createdAt?: string; createdBy?: string }` | Mirrors `orm.CreationAuditedModel`. |
| `FullAudited` | `CreationAudited & { updatedAt?: string; updatedBy?: string }` | Mirrors `orm.FullAuditedModel`. |
| `JsonValue` | `string \| number \| boolean \| null \| JsonValue[] \| { [key: string]: JsonValue }` | — |
| `JsonObject` | `Record<string, JsonValue>` | The object form used for a schedule's opaque `params` payload — carried verbatim to the job handler on the Go side. |

### Enums

Each mirrors a Go enum verbatim; display labels and colors live with the presentation components.

| Export | Values | Notes |
| --- | --- | --- |
| `TRIGGER_KINDS` / `TriggerKind` | `"cron" \| "interval" \| "once"` | How a schedule computes its fire times. |
| `MISFIRE_POLICIES` / `MisfirePolicy` | `"fire_now" \| "skip"` | What to do with occurrences missed while a node was down or the schedule was paused: `fire_now` runs the gap once immediately, `skip` drops it. |
| `CONCURRENCY_POLICIES` / `ConcurrencyPolicy` | `"forbid" \| "allow"` | Whether a new occurrence may start while the previous run is still going: `forbid` skips the overlap, `allow` runs them in parallel. |
| `RUN_STATUSES` / `RunStatus` | `"running" \| "succeeded" \| "failed" \| "missed" \| "skipped" \| "abandoned" \| "canceled"` | The lifecycle status of one journaled run. |

### Schedule

`Schedule` — a durable schedule row from `sys/cron/schedule` (extends `FullAudited`). Timestamps are naive local wall-clock strings (`YYYY-MM-DD HH:mm:ss`):

| Field | Type | Description |
| --- | --- | --- |
| `name` | `string` | Unique addressing name. |
| `jobName` | `string` | The registered job handler. |
| `kind` | `TriggerKind` | Trigger kind. |
| `expr` | `string` | Cron expression (empty for non-cron kinds). |
| `timezone` | `string` | Cron timezone (empty = server timezone). |
| `everyMs` | `number` | Interval rate (0 for non-interval kinds). |
| `fireAt` | `string?` | The `once` fire time. |
| `startsAt` / `endsAt` | `string?` | Effective window. |
| `params` | `JsonObject?` | Opaque handler payload. |
| `misfirePolicy` | `MisfirePolicy` | Missed-occurrence policy. |
| `concurrencyPolicy` | `ConcurrencyPolicy` | Overlap policy. |
| `recover` | `boolean` | Re-fire after a node crash. |
| `timeoutMs` | `number` | Per-run timeout (0 = global default). |
| `isEnabled` | `boolean` | Paused when `false`. |
| `nextFireAt` | `string?` | The fire cursor. A paused schedule keeps it so resuming can account for the paused gap — the list therefore hides it while paused, since it will not fire at that time. |
| `lastFireAt` | `string?` | Last fire time. |

| Type | Fields | Notes |
| --- | --- | --- |
| `TriggerParams` | `kind: TriggerKind`, `expr?: string`, `timezone?: string`, `everyMs?: number`, `at?: string` | The trigger definition submitted with a save. Only the fields the chosen kind needs are populated: `cron` → `expr` (+ optional `timezone`), `interval` → `everyMs` (fixed rate, min 1000), `once` → `at`. |
| `ScheduleParams` | `name: string`, `newName?: string`, `jobName: string`, `trigger: TriggerParams`, `params?: JsonObject`, `startsAt?`, `endsAt?` (`string`), `misfirePolicy?: MisfirePolicy`, `concurrencyPolicy?: ConcurrencyPolicy`, `recover?: boolean`, `timeoutMs?: number`, `enabled?: boolean` | Create/update payload. Addressing is by `name`; on update an optional `newName` renames the schedule. |
| `ScheduleSearch` | `name?`, `jobName?` (`string`), `kind?: TriggerKind`, `isEnabled?: string` | `isEnabled` is a `"true"` / `"false"` toggle **string** — framework select values are strings — which `findPage` converts to the boolean the wire eq filter expects. |
| `ScheduleNameParams` | `name: string` | Addressing payload for the name-keyed actions (get / delete / pause / resume / trigger_now). |
| `ScheduleDetail` | `schedule: Schedule`, `nextFires: string[]` | The `get` result; `nextFires` is empty when the schedule is paused or spent. |
| `PreviewFiresParams` | `trigger: TriggerParams`, `startsAt?: string`, `endsAt?: string` | The trigger is validated exactly like a save, so an invalid expression comes back as a business error. |
| `PreviewFiresResult` | `nextFires: string[]` | The next fire times inside the effective window. |

### Run

`Run` — one journaled run from `sys/cron/run` (extends `CreationAudited`). Read-only:

| Field | Type | Description |
| --- | --- | --- |
| `scheduleId` | `string` | Owning schedule's id. |
| `scheduleName` | `string` | Owning schedule's name. |
| `jobName` | `string` | The handler that ran. |
| `scheduledAt` | `string` | The occurrence's planned time. |
| `status` | `RunStatus` | Lifecycle status. |
| `nodeId` | `string` | The cluster node that claimed the run. |
| `startedAt` / `finishedAt` | `string?` | Actual execution bounds. |
| `durationMs` | `number` | Execution duration. |
| `heartbeatAt` | `string?` | Last heartbeat while running. |
| `error` | `string?` | Failure text (full text via `find_one`). |
| `missedCount` | `number?` | For `missed` runs: how many occurrences were dropped. |

| Type | Fields | Notes |
| --- | --- | --- |
| `RunSearch` | `scheduleName?`, `jobName?` (`string`), `status?: RunStatus`, `nodeId?: string`, `scheduledAtFrom?: string`, `scheduledAtTo?: string` | The `scheduledAt*` fields bound the scheduled time (gte / lte). |
| `RunIdParams` | `id: string` | Addressing payload for the single-run fetch (`find_one`). |

Page prop types (`CronSchedulePageProps`, `CronRunPageProps`, `RunDetailDrawerProps`) are exported alongside their components — see the [Overview](./overview.md#pages) for the page tables.
