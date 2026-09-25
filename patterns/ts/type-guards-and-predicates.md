# Type Guards And Predicates

Use type predicates (`is`) to narrow types in conditional checks.

## Example

```ts
// Type predicate function
function isString(value: unknown): value is string {
	return typeof value === 'string';
}

// Basic type guard; checks structure exists
function isUser(value: unknown): value is User {
	return typeof value === 'object' && value !== null && 'id' in value && 'email' in value;
}

// Thorough type guard; validates property types
function isUserStrict(value: unknown): value is User {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const obj = value as Record<string, unknown>;
	return typeof obj.id === 'string' && typeof obj.email === 'string';
}

// Usage
function processValue(value: unknown) {
	if (isString(value)) {
		console.log(value.toUpperCase()); // value is string here
	}
}

// Type guard for discriminated unions
type ApiResult = { status: 'success'; data: User } | { status: 'error'; message: string };

function isSuccess(result: ApiResult): result is { status: 'success'; data: User } {
	return result.status === 'success';
}

// Array filtering with type guards
const mixed: (string | number)[] = [1, 'two', 3, 'four'];
const strings = mixed.filter((x): x is string => typeof x === 'string');

// Assertion functions (throws if not valid)
function assertIsUser(value: unknown): asserts value is User {
	if (!isUser(value)) {
		throw new Error('expected user');
	}
}

function processUser(data: unknown) {
	assertIsUser(data);
	console.log(data.email); // data is User from here on
}
```
