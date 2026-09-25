---
severity: minor
detect: judge
confirm: callCount
falsePositives:
    - a function extracted so it can be unit tested in isolation
    - a function that names a non-obvious step even though it is called once
    - exported functions, which may have callers outside this repository
---

## Why

Pulling three lines into a helper that is called from exactly one place adds a name to learn and a jump to follow without removing any duplication. The reader now holds two locations in their head instead of one. Extract when there is a second caller or when the name carries real meaning; otherwise keep the code where it is used.

## Message

single-use helper adds indirection without removing duplication

## Bad

```ts
// BAD: a pass-through with one caller
function getUserName(user: User): string {
	return user.name;
}

export function greet(user: User): string {
	return `hello ${getUserName(user)}`;
}
```

## Good

```ts
export function greet(user: User): string {
	return `hello ${user.name}`;
}
```
