# Concurrent Processing With Limit

**Simple chunked approach**; fixed-size batches, waits for each batch to complete.

**True concurrency limiting**: use `p-limit` for sliding window concurrency.

## Example

```ts
async function processInChunks<T, R>(items: T[], fn: (item: T) => Promise<R>, chunkSize: number): Promise<R[]> {
	const results: R[] = [];
	for (let i = 0; i < items.length; i += chunkSize) {
		const chunk = items.slice(i, i + chunkSize);
		const chunkResults = await Promise.all(chunk.map(fn));
		results.push(...chunkResults);
	}
	return results;
}

// Usage
const processed = await processInChunks(items, processItem, 10);
```

```ts
import pLimit from 'p-limit';

const limit = pLimit(10); // max 10 concurrent
const results = await Promise.all(items.map(item => limit(() => processItem(item))));
```
