---
severity: minor
detect: ast
ast:
    rule:
        pattern: const $NAME = $VALUE
        inside:
            any:
                - kind: program
                - kind: export_statement
    constraints:
        NAME:
            regex: '^[a-z][a-zA-Z0-9]*$'
        VALUE:
            any:
                - kind: number
                - kind: string
                - kind: 'true'
                - kind: 'false'
---

## Why

A module-level constant holding a literal value is a configuration knob, and SCREAMING_SNAKE_CASE marks it as one at every use site. A camelCase name such as `maxRetries` looks like a local variable, so a reader inside a function cannot tell whether it is a fixed limit or something computed nearby. Local constants stay camelCase; only the module-level literals get the loud name.

## Message

module-level literal constant is camelCase; use SCREAMING_SNAKE_CASE

## Bad

```ts
// BAD: a fixed module-level limit dressed as a local variable
const maxRetries = 3;
```

```ts
// BAD: exported literal config in camelCase
export const defaultTimeout = 10_000;
```

## Good

```ts
const MAX_RETRIES = 3;

export const DEFAULT_TIMEOUT = 10_000;
```

```ts
export const userSchema = z.object({
	id: z.string(),
});

function retry(): void {
	const attempts = 3;
}
```
