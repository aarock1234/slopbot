---
severity: minor
detect: ast
ast:
    rule:
        kind: export_statement
        has:
            kind: export_clause
        not:
            has:
                field: source
                kind: string
---

## Why

An export list at the bottom of a file separates the decision to export from the thing being exported, so a reader looking at a declaration cannot tell whether it is public without scrolling. Exporting at the declaration site keeps that intent next to the code and means a rename or removal touches one place instead of two. Re-exports from another module are a different construct and are fine.

## Message

export list detached from its declarations; export at the declaration site

## Bad

```ts
const MAX_RETRIES = 3;

function getUser(id: string): Promise<User> {
	return repository.find(id);
}

// BAD: the export decision lives far from the declarations
export { MAX_RETRIES, getUser };
```

## Good

```ts
export const MAX_RETRIES = 3;

export function getUser(id: string): Promise<User> {
	return repository.find(id);
}
```

```ts
export { createUser } from './user';
export type { User } from './user';
```
