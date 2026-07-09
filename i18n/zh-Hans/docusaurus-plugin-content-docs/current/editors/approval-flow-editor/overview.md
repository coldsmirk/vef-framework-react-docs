---
title: 审批流编辑器概览
description: ApprovalFlowEditor 是什么、它编辑的 FlowDefinition 契约，以及它支持的六种节点类型。
---

# 审批流编辑器概览

`@vef-framework-react/approval-flow-editor` 是一个用于审批工作流路由图的可视化编辑器。它渲染出 `<ApprovalFlowEditor>`——一个构建在 `@xyflow/react` v12（ReactFlow）之上的画布，配有由 `elkjs` 驱动的一键自动布局（按需从工具栏加载，不打包进初始 bundle）。该编辑器是一个受控组件: 它读取一个 `FlowDefinition`，并通过 `onChange` 发回一份新的——与 Go 后端 `NodeDefinition` / `EdgeDefinition` 契约所使用的 JSON 形态完全一致，因此编辑器发出的内容就是可以直接部署的内容。

## 快速开始

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

一个空的或缺省的 `value`（没有节点）会给画布填充一个最小可用的流程: 一个 start 节点连到一个 end 节点。用户可以从这里开始，通过工具栏添加 `approval` / `handle` / `condition` / `cc` 节点并把它们连接起来。

## 节点类型

每个节点都属于六种类型之一。start 和 end 是编辑器自己管理的结构性首尾节点——既不能从工具栏添加，用户也不能删除它们:

| 类型 | 标签 | 数量上限 | 可删除 | 可添加 |
| --- | --- | --- | --- | --- |
| `start` | 开始 | 1 | 否 | 否 |
| `approval` | 审批 | — | 是 | 是 |
| `handle` | 办理 | — | 是 | 是 |
| `condition` | 条件 | — | 是 | 是 |
| `cc` | 抄送 | — | 是 | 是 |
| `end` | 结束 | 1 | 否 | 否 |

- **`approval`**——一个决策节点: 审批人按顺序或并行投票，支持通过规则、回退、超时以及新增 / 移除审批人等行为。
- **`handle`**——审批人在这里执行的是办理工作，而不是同意 / 拒绝；它与 `approval` 共用同一套审批人 / 超时 / 抄送机制，但不能自动拒绝。
- **`condition`**——为图分支。每条分支是一组彼此 AND 的条件组（各条件组之间是 OR 关系）；必须恰好有一条分支被标记为默认分支，并且必须恰好有一条外出边绑定到每条分支上。
- **`cc`**——通知收件人，但不会阻塞流程；它自带一份（只读的）字段权限矩阵。

关于把选择器和表单字段元数据接入编辑器，见 [宿主集成](./host-integration.md)；关于完整的类型和导出表，见 [API 参考](./reference.md)。

## 受控往返

`value` / `onChange` 的行为类似标准的受控输入，但针对画布场景做了两处细化:

- 只有当 `value` 变为一个编辑器自身没有发出过的**新**定义时，编辑器才会重新加载画布。把 `onChange` 传出去的对象原样传回作为 `value`（标准的 `useState` 往返方式）会被按引用识别，不会在编辑过程中重新挂载节点或清空当前选中状态。
- 每一个通过 `onChange` 发出的定义都是一份脱离的深拷贝——它永远不会与编辑器的实时内部状态产生别名关系，因此宿主可以随意存储、修改或持久化它。

## 发布与只读模式

- 当提供了 `onPublish` 时会渲染一个发布按钮（右上角面板）；点击它会运行 `validateFlowDefinition`，只有当流程在结构上已具备部署条件时才会调用 `onPublish`，否则会被阻塞。这与 `FormEditor` 的 `onPublish` 关卡机制一致，因此宿主可以在一个多步向导里以相同方式接入两个编辑器。`publishText` 用于重新命名按钮文案（默认是 `"发布"`）；`publishLoading` 会显示一个加载指示，并在异步发布过程中阻止重复点击。
- `readonly` 会禁用节点 / 边的选中、拖拽、连线，并隐藏工具栏和发布按钮——用于对一个已部署流程做只读查看。
