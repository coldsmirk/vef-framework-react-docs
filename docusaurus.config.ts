import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import { themes as prismThemes } from "prism-react-renderer";

const config: Config = {
  title: "VEF Framework React",
  tagline: "Enterprise React framework docs focused on the public API surface",
  favicon: "img/favicon.svg",

  future: {
    v4: true,
  },

  url: "https://coldsmirk.github.io",
  baseUrl: "/vef-framework-react-docs/",

  organizationName: "coldsmirk",
  projectName: "vef-framework-react-docs",

  onBrokenLinks: "throw",

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  themes: ["@docusaurus/theme-mermaid"],

  i18n: {
    defaultLocale: "en",
    locales: ["en", "zh-Hans"],
    localeConfigs: {
      en: {
        label: "English",
        direction: "ltr",
      },
      "zh-Hans": {
        label: "简体中文",
        direction: "ltr",
      },
    },
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/logo.svg",
    colorMode: {
      respectPrefersColorScheme: true,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ["bash", "json", "tsx"],
    },
    navbar: {
      title: "VEF Framework React",
      logo: {
        alt: "VEF Framework Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          position: "left",
          label: "Docs",
        },
        {
          type: "localeDropdown",
          position: "right",
        },
        {
          href: "https://github.com/coldsmirk/vef-framework-react",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Introduction",
              to: "/docs/intro",
            },
            {
              label: "Quick Start",
              to: "/docs/getting-started/quick-start",
            },
            {
              label: "API Reference",
              to: "/docs/reference/api-reference",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "GitHub Issues",
              href: "https://github.com/coldsmirk/vef-framework-react/issues",
            },
            {
              label: "GitHub Discussions",
              href: "https://github.com/coldsmirk/vef-framework-react/discussions",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/coldsmirk/vef-framework-react",
            },
            {
              label: "npm Package",
              href: "https://www.npmjs.com/package/vef-framework-react",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} VEF Framework React.`,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
