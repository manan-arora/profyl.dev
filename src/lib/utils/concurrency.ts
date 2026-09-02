/**
 * Maps an array of items to async results with a bounded maximum concurrency limit.
 * Preserves the original array ordering of items in the output array.
 * 
 * @param items - The input items to process
 * @param limit - Maximum number of concurrent executions allowed at any time
 * @param fn - Async iterator function
 * @returns Promise resolving to an array of results in original order
 */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  if (!items || items.length === 0) {
    return [];
  }

  const concurrencyLimit = Math.max(1, limit);
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++;
      results[currentIndex] = await fn(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrencyLimit, items.length) },
    () => worker()
  );

  await Promise.all(workers);
  return results;
}
