# Result Pattern Alternative

For functions where errors are expected and frequent.

## Example

```ts
type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

const configSchema = z.object({
	port: z.number(),
	host: z.string(),
});

type Config = z.infer<typeof configSchema>;

function parseConfig(raw: string): Result<Config> {
	try {
		const data = JSON.parse(raw);
		return {
			success: true,
			data: configSchema.parse(data),
		};
	} catch (err) {
		const error = err instanceof Error ? err : new Error(String(err));
		return {
			success: false,
			error,
		};
	}
}

// Usage
const result = parseConfig(input);

if (result.success) {
	console.log(result.data);
} else {
	console.error(result.error);
}
```
