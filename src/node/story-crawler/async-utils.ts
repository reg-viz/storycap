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

export async function runParallel<T, S>(tasks: () => AsyncGenerator<Task<T, S>, void>, runners: S[]) {
  const results: T[] = [];
  const p = runners.length;
  if (!p) throw new Error("No runners");
  const generator = tasks();
  await Promise.all(
    [...new Array(p).keys()].map(
      i =>
        new Promise((res, rej) => {
          async function next(): Promise<number | void> {
            const { done, value: task } = await generator.next();
            if (done || !task) return res();
            try {
              results.push(await task(runners[i]));
              return await next();
            } catch (error) {
              rej(error);
            }
          }
          return next();
        }),
    ),
  );
  return results;
}

export interface QueueCreateTaskContext<R> {
  push(request: R): void;
}

export interface QueueOptions<R, T, S> {
  initialRequests?: R[];
  createTask(request: R, context: QueueCreateTaskContext<R>): Task<T, S>;
}

type Resolver<R> = {
  resolve: (req: R) => void;
  reject: (v: any) => void;
};

export class Queue<R, T, S> {
  private futureRequests: Promise<R>[] = [];
  private resolvers: Resolver<R>[] = [];
  private tobeContinued = true;

  constructor(private opt: QueueOptions<R, T, S>) {
    if (opt.initialRequests) {
      opt.initialRequests.forEach(req => this.push(req));
    }
  }

  push(req: R) {
    if (this.resolvers.length) {
      const resolver = this.resolvers.shift() as Resolver<R>;
      resolver.resolve(req);
    } else {
      this.futureRequests.push(Promise.resolve(req));
    }
  }

  disconnect() {
    this.tobeContinued = false;
    this.resolvers.forEach(({ reject }) => reject("cancel"));
  }

  private createTask(req: R) {
    return this.opt.createTask(req, {
      push: this.push.bind(this),
    });
  }

  async *tasks(): AsyncGenerator<Task<T, S>, void> {
    while (this.tobeContinued) {
      if (this.futureRequests.length === 0) {
        this.futureRequests.push(
          new Promise<R>((resolve, reject) => {
            this.resolvers.push({ resolve, reject });
          }),
        );
      }
      const futureRequest = this.futureRequests.shift() as Promise<R>;
      try {
        const req = await futureRequest;
        yield this.createTask(req);
      } catch (reason) {
        if (reason !== "cancel") {
          throw reason;
        }
      }
    }
  }
}

export function createQueueService<R, T, S>(
  runners: S[],
  initialRequests: R[],
  createTask: (request: R, context: QueueCreateTaskContext<R>) => Task<T, S>,
) {
  const queue = new Queue<R, T, S>({
    initialRequests,
    createTask,
  });
  return {
    run() {
      return runParallel(queue.tasks.bind(queue), runners);
    },
    queue,
  };
}
