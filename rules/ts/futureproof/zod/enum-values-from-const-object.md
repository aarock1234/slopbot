---
severity: minor
detect: ast
ast:
    rule:
        pattern: z.enum([$$$VALUES])
---

## Why

An inline string array in `z.enum(['pending', 'active'])` is a second copy of values that the code also needs as constants, so adding a variant means finding every literal list and hoping none is missed. Deriving the tuple from a const object keeps one definition that feeds the schema, the type, and every `Status.PENDING` reference. The schema then cannot drift from the constants it validates.

## Message

`z.enum` with inline string literals; derive the values from a const object

## Bad

```ts
// BAD: the values live only here and cannot be referenced as constants
const statusSchema = z.enum(['pending', 'active', 'completed']);
```

## Good

```ts
const Status = {
	PENDING: 'pending',
	ACTIVE: 'active',
	COMPLETED: 'completed',
} as const;

type Status = (typeof Status)[keyof typeof Status];

const statusValues = Object.values(Status) as [Status, ...Status[]];
const statusSchema = z.enum(statusValues);
```
