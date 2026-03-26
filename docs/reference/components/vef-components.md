---
sidebar_position: 2
title: VEF Components
---

# VEF Components

This page covers components and wrappers that are more than direct Ant Design re-exports.

## ActionButton

Adds async-click and confirmation behavior on top of a button.

Recommended for:

- delete, disable, and batch actions
- actions that wait for async completion
- places where confirmation should stay visually consistent

## ActionGroup

Renders a group of actions from configuration.

Recommended for:

- page toolbars
- batch actions above tables
- context-driven action groups

## Bool

Wraps a boolean field as one unified control, supporting `switch`, `checkbox`, `radio`, and `radio-button`.

Recommended for:

- enable / disable states
- yes / no style fields
- boolean fields that should stay visually consistent across forms

## ConfigProvider

VEF's top-level theme container. It extends Ant Design configuration with Emotion, CSS variables, notifications, an error boundary, and dark-mode context.

Recommended for:

- application root setup
- isolated rendering environments that still need the VEF theme shell

## DynamicIcon

Loads Lucide icons from string names with caching and safe fallback behavior.

Recommended for:

- backend-driven menu icons
- config-driven icon names
- dynamic navigation structures

## Grid

A responsive grid built for forms and admin-page layouts.

Recommended for:

- form layouts
- stats cards
- collapsible search panels

## Icon and IconButton

`Icon` integrates Lucide icons into the VEF component system.  
`IconButton` adds tooltip-oriented icon-button semantics on top.

Recommended for:

- action icons
- table-row action buttons
- toolbars and compact action areas

## Loader

Unified loading placeholder for page-level or local loading states.

## OperationButton

Semantically close to `ActionButton`, but most often used inside row actions or compact operation areas.

## PermissionGate

Component-level permission gate based on `appContext.hasPermission()`.

Recommended for:

- hiding unauthorized actions
- permission-aware sections and cards
- rendering different content based on permission state

## ScrollArea

A scroll container built on Radix Scroll Area, better suited than plain `overflow: auto` for complex admin-page panels.

Recommended for:

- left-side tree navigation
- bounded filter panels
- panels that need scroll-position callbacks

## CodeHighlighter

Code and JSON display component for docs, request inspection, and structured payload viewing.

## Presentation Components

The following exports are more presentation-oriented than core business UI:

- `FlipText`
- `SparklesText`
- `SplitText`
- `TypingAnimation`
