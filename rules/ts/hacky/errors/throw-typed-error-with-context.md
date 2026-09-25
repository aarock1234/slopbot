---
severity: minor
detect: ast
ignore:
    - '**/*.test.ts'
    - '**/*.spec.ts'
ast:
    rule:
        pattern: throw new Error($MSG)
    constraints:
        MSG:
            kind: string
---

## Why

A bare `new Error('...')` with a fixed string gives the catcher nothing to branch on except the message text, and it carries no context about which record or input failed. A typed error class can be checked with `instanceof` and mapped to a status code at the boundary, and a message built from the inputs tells the on-call engineer what actually went wrong. Reserve plain `Error` for true invariants such as the `never` branch of an exhaustive switch, and even then include the value.

## Message

bare `Error` with a fixed message; throw a typed error that carries context

## Bad

```ts
async function getUser(id: string): Promise<User> {
	const user = await repository.find(id);

	if (!user) {
		// BAD: nothing to branch on and no hint of which user was missing
		throw new Error('user not found');
	}

	return user;
}
```

## Good

```ts
async function getUser(id: string): Promise<User> {
	const user = await repository.find(id);

	if (!user) {
		throw new NotFoundError(`user ${id}`);
	}

	return user;
}
```

```ts
function label(status: Status): string {
	switch (status) {
		case Status.ACTIVE:
			return 'running';
		default: {
			const exhaustive: never = status;

			throw new Error(`unhandled status: ${String(exhaustive)}`);
		}
	}
}
```
