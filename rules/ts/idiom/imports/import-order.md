---
severity: minor
detect: ast
ast:
    rule:
        kind: import_statement
        any:
            - has:
                  field: source
                  regex: '^.\.'
              precedes:
                  kind: import_statement
                  stopBy: end
                  has:
                      field: source
                      regex: '^.[^.]'
            - has:
                  field: source
                  regex: '^.@/'
              precedes:
                  kind: import_statement
                  stopBy: end
                  has:
                      field: source
                      regex: '^.[^.]'
                  not:
                      has:
                          field: source
                          regex: '^.@/'
---

## Why

Imports come in three groups, external packages, then internal `@/` modules, then relative paths, with a blank line between groups. A reader scans the top of a file to learn what it depends on, and a fixed order makes external dependencies and local coupling visible at a glance. Mixed groups force a line-by-line read and produce noisy diffs when imports are added.

## Message

imports out of order; external packages, then `@/` modules, then relative paths

## Bad

```ts
// BAD: relative import placed before an external package
import { formatDate } from './format';
import { z } from 'zod';
```

```ts
import { z } from 'zod';
// BAD: internal module placed before an external package
import { config } from '@/config';
import { PrismaClient } from '@prisma/client';
```

## Good

```ts
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

import { config } from '@/config';
import { logger } from '@/lib/logger';

import { formatDate } from './format';
import type { User } from './user';
```
