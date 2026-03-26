import type { ReactNode } from "react";

import { translate } from "@docusaurus/Translate";
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

interface HomeContent {
  featureList: FeatureItem[];
  heroDescription: string;
  heroKicker: string;
  heroPanelPoints: string[];
  heroPanelTitle: string;
  metaDescription: string;
  metaTitle: string;
  overviewLabel: string;
  pathList: PathItem[];
  pathsEyebrow: string;
  pathsSubtitle: string;
  pathsTitle: string;
  quickStartLabel: string;
  statList: StatItem[];
  workflowEyebrow: string;
  workflowList: WorkflowItem[];
  workflowSubtitle: string;
  workflowTitle: string;
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

function getHomeContent(): HomeContent {
  return {
    metaTitle: translate({
      id: "homepage.meta.title",
      message: "Home"
    }),
    metaDescription: translate({
      id: "homepage.meta.description",
      message: "VEF Framework React documentation focused on practical usage of the public API surface."
    }),
    heroKicker: translate({
      id: "homepage.hero.kicker",
      message: "Documentation for enterprise and admin-focused React applications"
    }),
    heroDescription: translate({
      id: "homepage.hero.description",
      message:
        "The documentation focuses on how to build applications with the exported APIs from `@vef-framework/*`, including routing, requests, forms, CRUD pages, and approval-flow integration."
    }),
    overviewLabel: translate({
      id: "homepage.hero.primary",
      message: "Read the Overview"
    }),
    quickStartLabel: translate({
      id: "homepage.hero.secondary",
      message: "Open Quick Start"
    }),
    heroPanelTitle: translate({
      id: "homepage.hero.panel.title",
      message: "App Entry"
    }),
    heroPanelPoints: [
      translate({
        id: "homepage.hero.panel.pointOne",
        message: "The entry point focuses on one thing: wiring apiClient, router, and appContext into createApp."
      }),
      translate({
        id: "homepage.hero.panel.pointTwo",
        message: "Data dictionaries, file URLs, and permission checks enter the page system through appContext."
      }),
      translate({
        id: "homepage.hero.panel.pointThree",
        message: "Routing, theme, query, and notifications are mounted by the starter layer."
      })
    ],
    statList: [
      {
        label: translate({
          id: "homepage.stats.appLayer.label",
          message: "App Layer"
        }),
        title: "Starter",
        packageName: "@vef-framework/starter",
        summary: translate({
          id: "homepage.stats.appLayer.summary",
          message: "bootstrap · routing · layouts · CRUD"
        })
      },
      {
        label: translate({
          id: "homepage.stats.uiLayer.label",
          message: "UI Layer"
        }),
        title: "Components",
        packageName: "@vef-framework/components",
        summary: translate({
          id: "homepage.stats.uiLayer.summary",
          message: "forms · options · charts · icons"
        })
      },
      {
        label: translate({
          id: "homepage.stats.dataLayer.label",
          message: "Data Layer"
        }),
        title: "Core",
        packageName: "@vef-framework/core",
        summary: translate({
          id: "homepage.stats.dataLayer.summary",
          message: "requests · query · stores · atoms"
        })
      },
      {
        label: translate({
          id: "homepage.stats.tooling.label",
          message: "Tooling"
        }),
        title: "Dev",
        packageName: "@vef-framework/dev",
        summary: translate({
          id: "homepage.stats.tooling.summary",
          message: "Vite · ESLint · Stylelint · Commitlint"
        })
      }
    ],
    workflowEyebrow: translate({
      id: "homepage.workflow.eyebrow",
      message: "Main Flow"
    }),
    workflowTitle: translate({
      id: "homepage.workflow.title",
      message: "Establish the shell first, then build the product on top"
    }),
    workflowSubtitle: translate({
      id: "homepage.workflow.subtitle",
      message:
        "The most effective way to understand VEF is to follow the same shape as a real application: bootstrap the shell, assemble the runtime, and then build pages on top."
    }),
    workflowList: [
      {
        index: "01",
        title: translate({
          id: "homepage.workflow.one.title",
          message: "Establish the Foundation"
        }),
        description: translate({
          id: "homepage.workflow.one.description",
          message: "Set up the project tooling once through defineViteConfig, ESLint, and Stylelint."
        })
      },
      {
        index: "02",
        title: translate({
          id: "homepage.workflow.two.title",
          message: "Assemble the Main Runtime"
        }),
        description: translate({
          id: "homepage.workflow.two.description",
          message:
            "Create the apiClient, router, and application entry so auth, permissions, query, and routing work together."
        })
      },
      {
        index: "03",
        title: translate({
          id: "homepage.workflow.three.title",
          message: "Build Pages on Top"
        }),
        description: translate({
          id: "homepage.workflow.three.description",
          message:
            "Use Page for regular screens, ProTable for data-heavy pages, and CrudPage with createCrudKit for CRUD workflows."
        })
      }
    ],
    featureList: [
      {
        badge: "STARTER",
        title: translate({
          id: "homepage.feature.starter.title",
          message: "Application Entry and Layout"
        }),
        description: translate({
          id: "homepage.feature.starter.description",
          message:
            "createApp, createRouter, login routes, access-denied routes, Page, ProTable, and CrudPage all live in the main application shell."
        })
      },
      {
        badge: "CORE",
        title: translate({
          id: "homepage.feature.core.title",
          message: "Requests, Cache, and State"
        }),
        description: translate({
          id: "homepage.feature.core.description",
          message:
            "ApiClient, useQuery, useMutation, createStore, createComponentStore, and atom form the page-level data layer."
        })
      },
      {
        badge: "COMPONENTS",
        title: translate({
          id: "homepage.feature.components.title",
          message: "Components, Forms, and Theme"
        }),
        description: translate({
          id: "homepage.feature.components.description",
          message:
            "The component system is already integrated with theming, notifications, form fields, permissions, and option transformation."
        })
      },
      {
        badge: "CRUD",
        title: translate({
          id: "homepage.feature.crud.title",
          message: "Reusable CRUD Pages"
        }),
        description: translate({
          id: "homepage.feature.crud.description",
          message: "A unified API for search areas, tables, form scenes, delete flows, and batch actions."
        })
      },
      {
        badge: "HOOKS",
        title: translate({
          id: "homepage.feature.hooks.title",
          message: "Page-Level Helper Hooks"
        }),
        description: translate({
          id: "homepage.feature.hooks.description",
          message:
            "Data dictionaries, option transformation, permission checks, loading-state checks, and common interaction hooks are all exported in one place."
        })
      },
      {
        badge: "FLOW",
        title: translate({
          id: "homepage.feature.flow.title",
          message: "Approval Flow Editor"
        }),
        description: translate({
          id: "homepage.feature.flow.description",
          message:
            "Can be embedded independently and extended through plugins for users, roles, departments, and form fields."
        })
      }
    ],
    pathsEyebrow: translate({
      id: "homepage.paths.eyebrow",
      message: "Suggested Entry Points"
    }),
    pathsTitle: translate({
      id: "homepage.paths.title",
      message: "A practical reading path into the framework"
    }),
    pathsSubtitle: translate({
      id: "homepage.paths.subtitle",
      message:
        "These four pages are a good starting path for understanding the structure of the framework and moving quickly into implementation work."
    }),
    pathList: [
      {
        title: translate({
          id: "homepage.paths.install.title",
          message: "Start with Installation"
        }),
        description: translate({
          id: "homepage.paths.install.description",
          message: "Confirm dependencies, runtime requirements, and the minimum project setup."
        }),
        to: "/docs/getting-started/installation"
      },
      {
        title: translate({
          id: "homepage.paths.quick.title",
          message: "See the Minimal App Skeleton"
        }),
        description: translate({
          id: "homepage.paths.quick.description",
          message: "Follow the full bootstrap path through createApp, createApiClient, and createRouter."
        }),
        to: "/docs/getting-started/quick-start"
      },
      {
        title: translate({
          id: "homepage.paths.crud.title",
          message: "Read the CRUD Page Guide"
        }),
        description: translate({
          id: "homepage.paths.crud.description",
          message:
            "A good starting point for understanding search areas, tables, and form scenes in admin pages."
        }),
        to: "/docs/guide/crud"
      },
      {
        title: translate({
          id: "homepage.paths.reference.title",
          message: "Browse the Package API Map"
        }),
        description: translate({
          id: "homepage.paths.reference.description",
          message: "Useful when starting from a need and mapping it back to the right package and entry point."
        }),
        to: "/docs/reference/api-reference"
      }
    ]
  };
}

function HeroCodeBlock({
  panelPoints,
  panelTitle
}: {
  panelPoints: string[];
  panelTitle: string;
}) {
  return (
    <div className="home-panel hero-code-panel">
      <div className="home-panel-header">
        <span className="home-panel-dot" />
        <span className="home-panel-dot" />
        <span className="home-panel-dot" />
        <span className="home-panel-title">{panelTitle}</span>
      </div>

      <pre className="home-code-block" aria-hidden="true">
        <code>
          {heroCode.map(line => `${line}\n`)}
        </code>
      </pre>

      <ul className="home-panel-list">
        {panelPoints.map(point => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </div>
  );
}

function Home() {
  const { siteConfig } = useDocusaurusContext();
  const content = getHomeContent();

  return (
    <Layout
      title={content.metaTitle}
      description={content.metaDescription}
    >
      <main className="homepage-main">
        <div className="home-shell">
          <section className="home-hero">
            <div className="home-hero-copy">
              <p className="home-kicker">{content.heroKicker}</p>
              <Heading as="h1" className="home-title">
                {siteConfig.title}
              </Heading>
              <p className="home-description">{content.heroDescription}</p>

              <div className="home-actions">
                <Link className="button button--primary button--lg" to="/docs/intro">
                  {content.overviewLabel}
                </Link>
                <Link className="button button--secondary button--lg" to="/docs/getting-started/quick-start">
                  {content.quickStartLabel}
                </Link>
              </div>

              <div className="home-stat-grid">
                {content.statList.map(item => (
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
              <HeroCodeBlock panelPoints={content.heroPanelPoints} panelTitle={content.heroPanelTitle} />
            </div>
          </section>

          <section className="home-section">
            <div className="home-section-head">
              <p className="home-eyebrow">{content.workflowEyebrow}</p>
              <Heading as="h2">{content.workflowTitle}</Heading>
              <p>{content.workflowSubtitle}</p>
            </div>

            <div className="workflow-grid">
              {content.workflowList.map(item => (
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
              <p className="home-eyebrow">
                {translate({
                  id: "homepage.features.eyebrow",
                  message: "Core Surfaces"
                })}
              </p>
              <Heading as="h2">
                {translate({
                  id: "homepage.features.title",
                  message: "These API surfaces matter first"
                })}
              </Heading>
              <p>
                {translate({
                  id: "homepage.features.subtitle",
                  message:
                    "These capabilities cover the most common application tasks and represent the most central, most stable parts of the framework."
                })}
              </p>
            </div>

            <div className="feature-grid">
              {content.featureList.map(item => (
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
              <p className="home-eyebrow">{content.pathsEyebrow}</p>
              <Heading as="h2">{content.pathsTitle}</Heading>
              <p>{content.pathsSubtitle}</p>
            </div>

            <div className="link-grid">
              {content.pathList.map(item => (
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
