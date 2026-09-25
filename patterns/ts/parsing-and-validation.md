# Parsing And Validation

## Example

```ts
// Throws ZodError on invalid data
function processItem(data: unknown): Item {
	return itemSchema.parse(data);
}

// Returns result object instead of throwing
function safeProcessItem(data: unknown): Item | null {
	const result = itemSchema.safeParse(data);

	return result.success ? result.data : null;
}

// With error handling
function parseItemWithErrors(data: unknown) {
	const result = itemSchema.safeParse(data);

	if (!result.success) {
		logger.error('validation failed', { errors: result.error.flatten() });
		return null;
	}

	return result.data;
}
```
