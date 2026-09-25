---
severity: minor
detect: ast
ast:
    rule:
        any:
            - pattern: $LOGGER.$METHOD($MSG)
            - pattern: $LOGGER.$METHOD($MSG, $$$REST)
    constraints:
        METHOD:
            regex: '^(log|info|warn|error|debug|trace|fatal)$'
        MSG:
            regex: '^.[A-Z][a-z]'
---

## Why

Log lines are grepped and read in bulk, and a mix of `Starting server` and `connected to database` makes the stream look like it came from two systems. Messages are lowercase fragments, with proper nouns and acronyms kept as they are, and variable data goes in the structured fields rather than the sentence. A consistent shape makes the output scannable and the fields queryable.

## Message

log message starts with a capital letter; write it as a lowercase fragment

## Bad

```ts
// BAD: capitalized sentence in a log line
logger.info('Starting server on port 3000');
```

```ts
// BAD: console output follows the same convention
console.error('Failed to connect', error);
```

## Good

```ts
logger.info('starting server', { port: 3000 });
logger.error('failed to connect', { error });
```

```ts
logger.info('connecting to PostgreSQL');
```
