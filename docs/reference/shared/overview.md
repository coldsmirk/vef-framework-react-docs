---
title: Shared Package Overview
description: What @vef-framework-react/shared covers and the suggested reading order across its four topic pages.
---

# Shared Package Overview

`@vef-framework-react/shared` is the general-purpose, pure-function foundation package of the framework. It has no React or DOM dependency beyond a few browser APIs used internally (`atob`/`btoa` for the base64 obfuscation helpers, `navigator` for the optional FingerprintJS-seeded id generator). It mainly contains:

1. type utilities
2. date, formatting, and validation helpers
3. event, object, tree, path, and string utilities
4. color and pinyin-related helpers

## Suggested Reading Order

1. [Type Utilities](./types.md)
2. [Validation, Time, Events, and Security](./chrono-event-validation.md)
3. [Trees, Paths, and Data Structures](./data-and-structure.md)
4. [General Utilities and Color Helpers](./general-utilities.md)
