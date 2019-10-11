/**
 *
 * Calculates time until given Promise object is resolved
 *
 * @param target - Target Promise
 * @returns Time to perform and the result of the original promise
 *
 **/
export async function time<T>(target: Promise<T>): Promise<[T, number]> {
  const start = Date.now();
  const result = await target;
  const end = Date.now();
  return [result, end - start];
}
