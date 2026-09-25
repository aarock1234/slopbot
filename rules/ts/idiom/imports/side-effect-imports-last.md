---
severity: minor
detect: ast
ast:
    rule:
        kind: import_statement
        not:
            has:
                kind: import_clause
        precedes:
            kind: import_statement
            stopBy: end
---

## Why

A side-effect import such as `import './polyfills'` runs code for its effect alone, so it stands apart from the imports that bind names. Placing it last, after a blank line, makes the effect visible instead of burying it among ordinary imports where a reader assumes nothing happens. A comment saying what the effect is helps the next person decide whether it can be removed.

## Message

side-effect import belongs after all named imports

## Bad

```ts
// BAD: side-effect import hidden at the top of the list
import './polyfills';
import { z } from 'zod';

import { config } from '@/config';
```

## Good

```ts
import { z } from 'zod';

import { config } from '@/config';

// registers the fetch polyfill for node 18
import './polyfills';
```
