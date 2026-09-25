---
severity: minor
detect: ast
ast:
    rule:
        kind: lexical_declaration
        has:
            kind: variable_declarator
            has:
                kind: arrow_function
                field: value
        inside:
            any:
                - kind: program
                - kind: export_statement
---

## Why

A top-level function written as `const f = () => {}` is not hoisted, so callers above it in the file break, and it shows up in stack traces and debuggers as an anonymous arrow bound to a variable. A `function` declaration is hoisted, carries its name, and stands out visually as a unit of the module. Arrows are for callbacks and inline expressions, where lexical `this` and brevity actually help.

## Message

top-level arrow function; use a `function` declaration

## Bad

```ts
// BAD: exported arrow is not hoisted and is anonymous in stack traces
export const createUser = async (input: CreateUserInput): Promise<User> => {
	return repository.insert(input);
};
```

```ts
// BAD: module-level helper written as an arrow
const toSlug = (title: string) => title.toLowerCase().replaceAll(' ', '-');
```

## Good

```ts
export async function createUser(input: CreateUserInput): Promise<User> {
	return repository.insert(input);
}
```

```ts
function toSlug(title: string): string {
	return title.toLowerCase().replaceAll(' ', '-');
}

export function slugs(titles: readonly string[]): string[] {
	return titles.map(title => toSlug(title));
}
```
