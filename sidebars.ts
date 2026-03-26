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
        }
      ]
    }
  ]
};

export default sidebars;
