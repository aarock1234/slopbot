import pLimit from 'p-limit';

export type ConcurrencyOptions = {
	concurrency?: number;
	signal?: AbortSignal;
};

const DEFAULT_CONCURRENCY = 4;

// maps items concurrently with a sliding window limit.
// fails fast: one rejection rejects the entire batch.
export async function mapConcurrent<T, R>(
	items: readonly T[],
	mapper: (item: T) => Promise<R>,
	options: ConcurrencyOptions = {}
): Promise<R[]> {
	const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;

	if (!Number.isInteger(concurrency) || concurrency < 1) {
		throw new Error('concurrency must be a positive integer');
	}

	const limit = pLimit(concurrency);

	const tasks = items.map(item =>
		limit(() => {
			options.signal?.throwIfAborted();

			return mapper(item);
		})
	);

	return Promise.all(tasks);
}
