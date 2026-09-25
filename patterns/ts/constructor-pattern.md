# Constructor Pattern

## Example

```ts
class UserService {
	constructor(
		private readonly db: Database,
		private readonly logger: Logger,
		private readonly timeout = 10_000
	) {}
}
```
