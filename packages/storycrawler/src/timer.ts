export async function time<T>(target: Promise<T>): Promise<[T, number]> {
  const start = Date.now();
  const result = await target;
  const end = Date.now();
  return [result, end - start];
}
