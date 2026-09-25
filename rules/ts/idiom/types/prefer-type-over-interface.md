---
severity: minor
detect: ast
ast:
    rule:
        kind: interface_declaration
        not:
            any:
                - has:
                      kind: extends_type_clause
                - inside:
                      kind: ambient_declaration
                      stopBy: end
                - has:
                      kind: interface_body
                      has:
                          kind: method_signature
---

## Why

A plain data shape is a `type`: it composes with unions, intersections, mapped types, and `z.infer` in one syntax, and it cannot be silently reopened by declaration merging somewhere else in the program. `interface` earns its place when you extend another shape, define a contract that classes implement, or deliberately augment a global. An interface with only properties and no `extends` is a `type` with an extra way to go wrong.

## Message

plain data shape declared as `interface`; use `type`

## Bad

```ts
// BAD: a data shape that gains nothing from being an interface
interface User {
	id: string;
	name: string;
}
```

## Good

```ts
type User = {
	id: string;
	name: string;
};
```

```ts
interface Admin extends User {
	role: 'admin';
}

interface Repository<T> {
	findById(id: string): Promise<T | undefined>;
	save(item: T): Promise<void>;
}
```

```ts
declare global {
	interface Window {
		analytics: Analytics;
	}
}
```
