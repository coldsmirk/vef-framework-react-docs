import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

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
        "getting-started/configuration",
        "getting-started/project-structure",
        "getting-started/application-project-conventions"
      ]
    },
    {
      type: "category",
      label: "Core Guides",
      collapsed: false,
      items: [
        "guide/routing",
        "features/layouts",
        "guide/api-integration",
        "guide/components",
        "guide/forms",
        "guide/tables",
        "guide/crud",
        "guide/hooks",
        "guide/state-management",
        "features/i18n",
        "features/theming",
        "guide/error-handling"
      ]
    },
    {
      type: "category",
      label: "Components",
      collapsed: false,
      items: [
        "components/overview",
        {
          type: "link",
          label: "Ant Design Components",
          href: "https://ant.design/components/overview/"
        },
        "components/button",
        "components/input",
        "components/select",
        "components/table",
        "components/form",
        "components/modal",
        "components/page",
        "components/flex-card",
        "components/form-modal",
        "components/form-drawer",
        "components/pro-search",
        "components/pro-table",
        "components/crud",
        "components/action-button",
        "components/action-group",
        "components/bool",
        "components/grid",
        "components/stack",
        "components/center",
        "components/scroll-area",
        "components/loader",
        "components/logo-icon",
        "components/permission-gate",
        "components/icon-button",
        "components/dynamic-icon",
        "components/operation-button",
        "components/group",
        "components/icon",
        "components/config-provider",
        "components/chart",
        "components/code-highlighter",
        "components/keyboard",
        {
          type: "category",
          label: "Animation",
          collapsed: true,
          items: [
            "components/flip-text",
            "components/sparkles-text",
            "components/split-text",
            "components/typing-animation"
          ]
        },
        {
          type: "category",
          label: "AI Components (X)",
          collapsed: true,
          items: [
            "components/x-overview",
            "components/x-bubble",
            "components/x-sender",
            "components/x-conversations",
            "components/x-prompts",
            "components/x-thought-chain",
            "components/x-welcome",
            "components/x-attachments",
            "components/x-actions",
            "components/x-suggestion",
            "components/x-sources",
            "components/x-file-card",
            "components/x-think",
            "components/x-notification",
            "components/x-markdown",
            "components/x-mermaid",
            "components/x-code-highlighter"
          ]
        },
        {
          type: "category",
          label: "Ant Design Components",
          collapsed: true,
          items: [
            "components/alert",
            "components/affix",
            "components/anchor",
            "components/auto-complete",
            "components/avatar",
            "components/badge",
            "components/breadcrumb",
            "components/calendar",
            "components/card",
            "components/carousel",
            "components/cascader",
            "components/checkbox",
            "components/col",
            "components/collapse",
            "components/color-picker",
            "components/date-picker",
            "components/descriptions",
            "components/divider",
            "components/drawer",
            "components/dropdown",
            "components/empty",
            "components/flex",
            "components/float-button",
            "components/image",
            "components/input-number",
            "components/list",
            "components/mentions",
            "components/menu",
            "components/pagination",
            "components/popconfirm",
            "components/popover",
            "components/progress",
            "components/qrcode",
            "components/radio",
            "components/rate",
            "components/result",
            "components/row",
            "components/segmented",
            "components/skeleton",
            "components/slider",
            "components/space",
            "components/spin",
            "components/splitter",
            "components/statistic",
            "components/steps",
            "components/switch",
            "components/tabs",
            "components/tag",
            "components/time-picker",
            "components/timeline",
            "components/tooltip",
            "components/tour",
            "components/transfer",
            "components/tree",
            "components/tree-select",
            "components/typography",
            "components/upload",
            "components/watermark",
            "components/compact"
          ]
        }
      ]
    },
    {
      type: "category",
      label: "Security",
      collapsed: true,
      items: [
        "security/authentication",
        "security/authorization",
        "security/route-guards"
      ]
    },
    {
      type: "category",
      label: "Advanced Topics",
      collapsed: true,
      items: [
        "features/icons",
        "features/charts",
        "advanced/custom-components",
        "advanced/plugin-system",
        "advanced/performance",
        "advanced/testing"
      ]
    },
    {
      type: "category",
      label: "API Reference",
      collapsed: true,
      items: [
        "reference/api-reference",
        "reference/configuration-reference",
        "reference/css-variables-reference",
        "reference/component-reference",
        {
          type: "category",
          label: "Starter Package",
          collapsed: true,
          items: [
            "reference/starter/overview",
            "reference/starter/bootstrap-and-routing",
            "reference/starter/page-layout",
            "reference/starter/crud",
            "reference/starter/stores-and-types"
          ]
        },
        {
          type: "category",
          label: "Components Package",
          collapsed: true,
          items: [
            "reference/components/overview",
            "reference/components/vef-components",
            "reference/components/form-and-data",
            "reference/components/antd-pass-through"
          ]
        },
        {
          type: "category",
          label: "Hooks Package",
          collapsed: true,
          items: [
            "reference/hooks/overview",
            "reference/hooks/vef-hooks",
            "reference/hooks/upstream-hooks"
          ]
        },
        {
          type: "category",
          label: "Shared Package",
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
          label: "Core Package",
          collapsed: true,
          items: [
            "reference/core/overview",
            "reference/core/http-and-api",
            "reference/core/query",
            "reference/core/store-and-atom",
            "reference/core/context",
            "reference/core/sse-motion-dnd-immer"
          ]
        },
        {
          type: "category",
          label: "Dev Package",
          collapsed: true,
          items: [
            "reference/dev/overview"
          ]
        }
      ]
    }
  ]
};

export default sidebars;
