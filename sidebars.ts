import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

/**
 * Hand-authored sidebar. Ordering and grouping live here (not in per-doc
 * `sidebar_position` or `_category_.json`), so this file is the single source
 * of navigation truth. Sections follow a shallow→deep learning path:
 * Getting Started (learn) → Guides (build) → Components / Visual Editors /
 * API Reference (look up) → Advanced (extend).
 */
const sidebars: SidebarsConfig = {
  docsSidebar: [
    "intro",
    {
      type: "category",
      label: "Getting Started",
      collapsed: false,
      items: [
        "getting-started/installation",
        "getting-started/quick-start",
        "getting-started/first-crud-page",
        "getting-started/configuration",
        "getting-started/project-structure"
      ]
    },
    {
      type: "category",
      label: "Guides",
      collapsed: false,
      items: [
        "guide/routing",
        "guide/menus-and-navigation",
        "guide/data-fetching",
        "guide/forms",
        "guide/tables",
        "guide/crud",
        "guide/state-management",
        "guide/authentication",
        "guide/permissions",
        "guide/data-dictionaries",
        "guide/theming",
        "guide/localization",
        "guide/error-handling",
        "guide/hooks"
      ]
    },
    {
      type: "category",
      label: "Components",
      collapsed: true,
      items: [
        "components/overview",
        {
          type: "category",
          label: "Layout",
          collapsed: true,
          items: [
            "components/grid",
            "components/stack",
            "components/center",
            "components/group",
            "components/scroll-area"
          ]
        },
        {
          type: "category",
          label: "Page & CRUD",
          collapsed: true,
          items: [
            "components/page",
            "components/flex-card",
            "components/form-modal",
            "components/form-drawer",
            "components/pro-search",
            "components/pro-table",
            "components/table",
            "components/editable-table",
            "components/crud"
          ]
        },
        {
          type: "category",
          label: "Forms",
          collapsed: true,
          items: [
            "components/form",
            "components/bool",
            "components/select",
            "components/tree",
            "components/tree-select",
            "components/upload",
            "components/icon-picker",
            "components/file-upload",
            "components/generic-select"
          ]
        },
        {
          type: "category",
          label: "Actions & Permissions",
          collapsed: true,
          items: [
            "components/action-button",
            "components/action-group",
            "components/operation-button",
            "components/permission-gate"
          ]
        },
        {
          type: "category",
          label: "Display & Utility",
          collapsed: true,
          items: [
            "components/config-provider",
            "components/notifications",
            "components/icon-button",
            "components/loader",
            "components/icon",
            "components/dynamic-icon",
            "components/logo-icon",
            "components/chart",
            "components/code-highlighter",
            "components/code-editor",
            "components/keyboard"
          ]
        },
        {
          type: "category",
          label: "Animation",
          collapsed: true,
          items: [
            "components/flip-text",
            "components/sparkles-text",
            "components/split-text",
            "components/typing-animation",
            "components/border-beam"
          ]
        },
        {
          type: "category",
          label: "Ant Design",
          collapsed: true,
          items: [
            "components/button",
            "components/input",
            "components/modal",
            "components/alert",
            "components/avatar",
            "components/typography",
            "components/compact",
            "components/antd-pass-through",
            {
              type: "link",
              label: "All Ant Design Components ↗",
              href: "https://ant.design/components/overview/"
            }
          ]
        }
      ]
    },
    {
      type: "category",
      label: "Visual Editors",
      collapsed: true,
      items: [
        "editors/overview",
        {
          type: "category",
          label: "Form Editor",
          collapsed: true,
          items: [
            "editors/form-editor/overview",
            "editors/form-editor/embedding",
            "editors/form-editor/schema",
            "editors/form-editor/linkage",
            "editors/form-editor/reference"
          ]
        },
        "editors/approval-form-bridge",
        {
          type: "category",
          label: "Approval Flow Editor",
          collapsed: true,
          items: [
            "editors/approval-flow-editor/overview",
            "editors/approval-flow-editor/host-integration",
            "editors/approval-flow-editor/reference"
          ]
        }
      ]
    },
    {
      type: "category",
      label: "API Reference",
      collapsed: true,
      items: [
        "reference/overview",
        {
          type: "category",
          label: "Core",
          collapsed: true,
          items: [
            "reference/core/overview",
            "reference/core/http-and-api",
            "reference/core/query",
            "reference/core/store-and-atom",
            "reference/core/context",
            "reference/core/storage",
            "reference/core/sse-motion-dnd-immer"
          ]
        },
        {
          type: "category",
          label: "Starter",
          collapsed: true,
          items: [
            "reference/starter/overview",
            "reference/starter/bootstrap-and-routing",
            "reference/starter/application-shell",
            "reference/starter/stores-and-types"
          ]
        },
        {
          type: "category",
          label: "Hooks",
          collapsed: true,
          items: [
            "reference/hooks/vef-hooks",
            "reference/hooks/upstream-hooks"
          ]
        },
        {
          type: "category",
          label: "Shared",
          collapsed: true,
          items: [
            "reference/shared/overview",
            "reference/shared/types",
            "reference/shared/chrono-event-validation",
            "reference/shared/data-and-structure",
            "reference/shared/general-utilities"
          ]
        },
        {
          type: "category",
          label: "Dev",
          collapsed: true,
          items: ["reference/dev/overview"]
        },
        "reference/css-variables-reference",
        "reference/release-notes"
      ]
    },
    {
      type: "category",
      label: "Advanced",
      collapsed: true,
      items: [
        "advanced/project-conventions",
        "advanced/custom-form-components",
        "advanced/performance",
        "advanced/testing"
      ]
    }
  ]
};

export default sidebars;
