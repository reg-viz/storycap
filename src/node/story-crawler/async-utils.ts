export function sleep(time: number = 0) {
  return new Promise(res => {
    setTimeout(() => res(), time);
  });
}

export type Task<T, S> = (runner: S) => Promise<T>;

export function execParalell<T, S>(tasks: Task<T, S>[], runners: S[]) {
  const copied = tasks.slice();
  const results = <T[]>[];
  const p = runners.length;
  if (!p) throw new Error("No runners");
  return Promise.all(
    new Array(p).fill("").map(
      (_, i) =>
        new Promise((res, rej) => {
          function next(): Promise<number | void> {
            const t = copied.shift();
            return t == null
              ? Promise.resolve(res())
              : t(runners[i])
                  .then(r => results.push(r))
                  .then(next)
                  .catch(rej);
          }
          return next();
        }),
    ),
  ).then(() => results);
}
