# Abstract Base Classes

For shared behavior across implementations.

For simple shared logic, prefer composition (shared functions, dependency injection) over class hierarchies. Use abstract classes when you need enforced method contracts across a family of related implementations.

## Example

```ts
// Input -> output pattern
abstract class BaseProcessor<TInput, TOutput> {
	protected constructor(
		protected readonly logger: Logger,
		protected readonly config: ProcessorConfig
	) {}

	async process(input: TInput): Promise<TOutput> {
		this.validate(input);
		return this.execute(input);
	}

	protected validate(input: TInput): void {
		if (input == null) {
			throw new ValidationError('input is required');
		}
	}

	protected abstract execute(input: TInput): Promise<TOutput>;
}

class PdfProcessor extends BaseProcessor<PdfInput, PdfOutput> {
	protected async execute(input: PdfInput): Promise<PdfOutput> {
		// PDF-specific processing
		return {
			/* ... */
		};
	}
}
```
