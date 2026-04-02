---
sidebar_position: 39
---

# XSuggestion

Inline suggestion list that appears above the input area as the user types.

> **Source:** Re-exported from `@ant-design/x`. Full documentation: [Ant Design X Suggestion](https://x.ant.design/components/suggestion)

## Basic Usage

```tsx
import { XSuggestion, XSender } from '@vef-framework-react/components';
import { useState } from 'react';

export default function Demo() {
  const [value, setValue] = useState('');

  const suggestions = [
    { label: 'How to create a form?', value: 'How to create a form?' },
    { label: 'Show table example', value: 'Show table example' },
  ];

  return (
    <XSuggestion items={suggestions}>
      {({ onTrigger, onKeyDown }) => (
        <XSender
          value={value}
          onChange={(v) => { setValue(v); onTrigger(v.startsWith('/') ? v : false); }}
          onKeyDown={onKeyDown}
          onSubmit={(v) => { setValue(''); }}
        />
      )}
    </XSuggestion>
  );
}
```

> For the full API, see [Ant Design X Suggestion docs](https://x.ant.design/components/suggestion).
