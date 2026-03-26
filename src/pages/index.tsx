import type { ReactNode } from "react";

import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

interface StatItem {
  label: string;
  title: string;
  packageName: string;
  summary: string;
}

interface WorkflowItem {
  index: string;
  title: string;
  description: string;
}

interface FeatureItem {
  badge: string;
  title: string;
  description: string;
}

interface PathItem {
  title: string;
  description: string;
  to: string;
}

const heroCode = [
  "import { createApp } from \"@vef-framework/starter\";",
  "import { apiClient } from \"./api\";",
  "import router from \"./router\";",
  "",
  "createApp().render({",
  "  apiClient,",
  "  router,",
  "  appContext: {",
  "    dataDictQueryFn: findDataDictItems,",
  "    fileBaseUrl: FILE_BASE_URL",
  "  }",
  "});"
];

const statList: StatItem[] = [
  {
    label: "App Layer",
    title: "Starter",
    packageName: "@vef-framework/starter",
    summary: "bootstrap · routing · layouts · CRUD"
  },
  {
    label: "UI Layer",
    title: "Components",
    packageName: "@vef-framework/components",
    summary: "forms · options · charts · icons"
  },
  {
    label: "Data Layer",
    title: "Core",
    packageName: "@vef-framework/core",
    summary: "requests · query · stores · atoms"
  },
  {
    label: "Tooling",
    title: "Dev",
    packageName: "@vef-framework/dev",
    summary: "Vite · ESLint · Stylelint · Commitlint"
  }
];

const workflowList: WorkflowItem[] = [
  {
    index: "01",
    title: "Establish the Foundation",
    description: "Set up the project tooling once through defineViteConfig, ESLint, and Stylelint."
  },
  {
    index: "02",
    title: "Assemble the Main Runtime",
    description: "Create the apiClient, router, and application entry so auth, permissions, query, and routing work together."
  },
  {
    index: "03",
    title: "Build Pages on Top",
    description: "Use Page for regular screens, ProTable for data-heavy pages, and CrudPage with createCrudKit for CRUD workflows."
  }
];

const featureList: FeatureItem[] = [
  {
    badge: "STARTER",
    title: "Application Entry and Layout",
    description: "createApp, createRouter, login routes, access-denied routes, Page, ProTable, and CrudPage all live in the main application shell."
  },
  {
    badge: "CORE",
    title: "Requests, Cache, and State",
    description: "ApiClient, useQuery, useMutation, createStore, createComponentStore, and atom form the page-level data layer."
  },
  {
    badge: "COMPONENTS",
    title: "Components, Forms, and Theme",
    description: "The component system is already integrated with theming, notifications, form fields, permissions, and option transformation."
  },
  {
    badge: "CRUD",
    title: "Reusable CRUD Pages",
    description: "A unified API for search areas, tables, form scenes, delete flows, and batch actions."
  },
  {
    badge: "HOOKS",
    title: "Page-Level Helper Hooks",
    description: "Data dictionaries, option transformation, permission checks, loading-state checks, and common interaction hooks are all exported in one place."
  },
  {
    badge: "FLOW",
    title: "Approval Flow Editor",
    description: "Can be embedded independently and extended through plugins for users, roles, departments, and form fields."
  }
];

const pathList: PathItem[] = [
  {
    title: "Start with Installation",
    description: "Confirm dependencies, runtime requirements, and the minimum project setup.",
    to: "/docs/getting-started/installation"
  },
  {
    title: "See the Minimal App Skeleton",
    description: "Follow the full bootstrap path through createApp, createApiClient, and createRouter.",
    to: "/docs/getting-started/quick-start"
  },
  {
    title: "Read the CRUD Page Guide",
    description: "A good starting point for understanding search areas, tables, and form scenes in admin pages.",
    to: "/docs/guide/crud"
  },
  {
    title: "Browse the Package API Map",
    description: "Useful when starting from a need and mapping it back to the right package and entry point.",
    to: "/docs/reference/api-reference"
  }
];

function HeroCodeBlock() {
  return (
    <div className="home-panel hero-code-panel">
      <div className="home-panel-header">
        <span className="home-panel-dot" />
        <span className="home-panel-dot" />
        <span className="home-panel-dot" />
        <span className="home-panel-title">App Entry</span>
      </div>

      <pre className="home-code-block" aria-hidden="true">
        <code>
          {heroCode.map(line => `${line}\n`)}
        </code>
      </pre>

      <ul className="home-panel-list">
        <li>The entry point focuses on one thing: wiring apiClient, router, and appContext into createApp.</li>
        <li>Data dictionaries, file URLs, and permission checks enter the page system through appContext.</li>
        <li>Routing, theme, query, and notifications are mounted by the starter layer.</li>
      </ul>
    </div>
  );
}

function Home() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title="Home"
      description="VEF Framework React documentation focused on practical usage of the public API surface."
    >
      <main className="homepage-main">
        <div className="home-shell">
          <section className="home-hero">
            <div className="home-hero-copy">
              <p className="home-kicker">Documentation for enterprise and admin-focused React applications</p>
              <Heading as="h1" className="home-title">
                {siteConfig.title}
              </Heading>
              <p className="home-description">
                The documentation focuses on how to build applications with the exported APIs from `@vef-framework/*`, including routing, requests, forms, CRUD pages, and approval-flow integration.
              </p>

              <div className="home-actions">
                <Link className="button button--primary button--lg" to="/docs/intro">
                  Read the Overview
                </Link>
                <Link className="button button--secondary button--lg" to="/docs/getting-started/quick-start">
                  Open Quick Start
                </Link>
              </div>

              <div className="home-stat-grid">
                {statList.map(item => (
                  <div className="home-stat-card" key={item.label}>
                    <span className="home-stat-label">{item.label}</span>
                    <strong className="home-stat-value">{item.title}</strong>
                    <code className="home-stat-package">{item.packageName}</code>
                    <p className="home-stat-description">{item.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="home-hero-side">
              <img
                alt="VEF Framework Logo"
                className="home-hero-logo"
                src={useBaseUrl("/img/logo.svg")}
              />
              <HeroCodeBlock />
            </div>
          </section>

          <section className="home-section">
            <div className="home-section-head">
              <p className="home-eyebrow">Main Flow</p>
              <Heading as="h2">Establish the shell first, then build the product on top</Heading>
              <p>The most effective way to understand VEF is to follow the same shape as a real application: bootstrap the shell, assemble the runtime, and then build pages on top.</p>
            </div>

            <div className="workflow-grid">
              {workflowList.map(item => (
                <article className="home-panel workflow-card" key={item.index}>
                  <span className="workflow-index">{item.index}</span>
                  <Heading as="h3">{item.title}</Heading>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="home-section">
            <div className="home-section-head">
              <p className="home-eyebrow">Core Surfaces</p>
              <Heading as="h2">These API surfaces matter first</Heading>
              <p>These capabilities cover the most common application tasks and represent the most central, most stable parts of the framework.</p>
            </div>

            <div className="feature-grid">
              {featureList.map(item => (
                <article className="home-panel feature-card" key={item.title}>
                  <span className="feature-badge">{item.badge}</span>
                  <Heading as="h3">{item.title}</Heading>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="home-section">
            <div className="home-section-head">
              <p className="home-eyebrow">Suggested Entry Points</p>
              <Heading as="h2">A practical reading path into the framework</Heading>
              <p>These four pages are a good starting path for understanding the structure of the framework and moving quickly into implementation work.</p>
            </div>

            <div className="link-grid">
              {pathList.map(item => (
                <Link className="home-panel link-card" key={item.title} to={item.to}>
                  <span className="link-card-arrow" aria-hidden="true">
                    →
                  </span>
                  <Heading as="h3">{item.title}</Heading>
                  <p>{item.description}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}

export default function Homepage(): ReactNode {
  return <Home />;
}
