# Options Pattern

For complex configuration.

## Example

```ts
type ServiceOptions = {
	timeout?: number;
	retries?: number;
	logger?: Logger;
};

class ApiClient {
	private readonly timeout: number;
	private readonly retries: number;
	private readonly logger: Logger;

	constructor(baseUrl: string, options: ServiceOptions = {}) {
		this.timeout = options.timeout ?? 10_000;
		this.retries = options.retries ?? 3;
		this.logger = options.logger ?? console;
	}
}

// Usage
const client = new ApiClient('https://api.example.com', {
	timeout: 5000,
	retries: 5,
});
```
