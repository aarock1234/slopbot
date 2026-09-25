---
severity: minor
detect: ast
ast:
    rule:
        any:
            - pattern: $P.then($$$ARGS)
            - pattern: $P.catch($$$ARGS)
            - pattern: $P.finally($$$ARGS)
---

## Why

`async`/`await` reads top to bottom and keeps error handling in an ordinary `try`. Promise chains split the same logic across callbacks, lose stack context, and make the return value of the surrounding function harder to see.

## Message

promise chain; use async/await

## Bad

```ts
function loadUser(id: string) {
	// BAD: callback chain where a straight line would do
	return fetchUser(id)
		.then(user => enrich(user))
		.catch(error => report(error));
}
```

## Good

```ts
async function loadUser(id: string): Promise<User> {
	try {
		const user = await fetchUser(id);

		return await enrich(user);
	} catch (error) {
		report(error);

		throw error;
	}
}
```
