---
severity: minor
detect: ast
ast:
    rule:
        kind: export_statement
        has:
            any:
                - kind: lexical_declaration
                  regex: '^let\b'
                - kind: variable_declaration
ignore:
    - '**/*.test.ts'
    - '**/*.spec.ts'
---

## Why

An exported `let` is global mutable state: any importer can reassign it, and no reader of the module can know its value at a given moment without tracing every import. Tests that touch it leak into each other, and reloading or running two instances in one process breaks. Keep the state inside a function, class, or factory and expose operations on it, or export a `const`.

## Message

exported let is global mutable state; expose functions over the state or export a const

## Bad

```ts
// BAD: any importer can reassign this
export let currentUser: User | undefined;

export function login(user: User): void {
	currentUser = user;
}
```

```ts
// BAD: var is hoisted and reassignable from anywhere
export var requestCount = 0;
```

## Good

```ts
export function createSession(): Session {
	let currentUser: User | undefined;

	return {
		login(user: User): void {
			currentUser = user;
		},
		current(): User | undefined {
			return currentUser;
		},
	};
}
```

```ts
export const DEFAULT_PAGE_SIZE = 50;
```
