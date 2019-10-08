export async function sleep(time: number = 0): Promise<void> {
  await Promise.resolve();
  if (time <= 0) return;
  return new Promise(res => setTimeout(() => res(), time));
}

export type Task<T, S> = (worker: S) => Promise<T>;

export async function runParallel<T, S>(tasks: () => AsyncGenerator<Task<T, S>, void>, workers: S[]) {
  const results: T[] = [];
  const p = workers.length;
  if (!p) throw new Error('No workers');
  const generator = tasks();
  await Promise.all(
    [...new Array(p).keys()].map(
      i =>
        new Promise((res, rej) => {
          async function next(): Promise<void> {
            const { done, value: task } = await generator.next();
            if (done || !task) return res();
            try {
              results.push(await task(workers[i]));
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

export interface QueueController<R> {
  push(request: R): void;
  close(): void;
}

export type QueueOptions<R, T, S> = {
  initialRequests?: R[] | IterableIterator<R>;
  allowEmpty?: boolean;
  createTask(request: R, controller: QueueController<R>): Task<T, S>;
};

const cancelationToken = Symbol('cancel');

type Resolver<R> = {
  resolve: (req: R) => void;
  cancel: () => void;
};

export class Queue<R, T, S> {
  private requestIdCounter = 0;
  private tobeContinued = true;
  private readonly futureRequests: Promise<R>[] = [];
  private readonly resolvers: Resolver<R>[] = [];
  private readonly requestingIds = new Set<string>();
  private readonly allowEmpty: boolean;
  private readonly createDelegationTask: (request: R, controller: QueueController<R>) => Task<T, S>;

  constructor({ initialRequests, createTask, allowEmpty }: QueueOptions<R, T, S>) {
    this.createDelegationTask = createTask;
    this.allowEmpty = !!allowEmpty;
    if (initialRequests) {
      for (const req of initialRequests) {
        this.push(req);
      }
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

  close() {
    this.tobeContinued = false;
    this.resolvers.forEach(({ cancel }) => cancel());
  }

  publishController(): QueueController<R> {
    return {
      push: this.push.bind(this),
      close: async () => {
        await Promise.resolve();
        this.close();
      },
    };
  }

  private generateId() {
    return `request_${++this.requestIdCounter}`;
  }

  private createTask(req: R, controller: QueueController<R>) {
    const delegate = this.createDelegationTask(req, controller);
    const rid = this.generateId();
    this.requestingIds.add(rid);
    return async (worker: S) => {
      const result = await delegate(worker);
      this.requestingIds.delete(rid);
      if (!this.allowEmpty && this.requestingIds.size === 0 && this.futureRequests.length === 0) {
        this.close();
      }
      return result;
    };
  }

  async *tasks(): AsyncGenerator<Task<T, S>, void> {
    const controller = this.publishController();
    while (this.tobeContinued && (this.allowEmpty || this.futureRequests.length || this.requestingIds.size)) {
      if (this.futureRequests.length === 0) {
        this.futureRequests.push(
          new Promise<R>((resolve, reject) => {
            const cancel = () => reject(cancelationToken);
            this.resolvers.push({ resolve, cancel });
          }),
        );
      }
      const futureRequest = this.futureRequests.shift() as Promise<R>;
      try {
        const req = await futureRequest;
        yield this.createTask(req, controller);
      } catch (reason) {
        if (reason !== cancelationToken) {
          throw reason;
        }
      }
    }
  }
}

export type CreateExecutionServiceOptions = {
  allowEmpty?: boolean;
};

export interface ExecutionService<R, T> extends QueueController<R> {
  execute(): Promise<T[]>;
}

export function createExecutionService<R, T, S>(
  workers: S[],
  initialRequests: R[] | IterableIterator<R>,
  createTask: (request: R, context: QueueController<R>) => Task<T, S>,
  options: CreateExecutionServiceOptions = {},
): ExecutionService<R, T> {
  const queue = new Queue<R, T, S>({
    initialRequests,
    createTask,
    allowEmpty: !!options.allowEmpty,
  });
  return {
    execute() {
      return runParallel(queue.tasks.bind(queue), workers);
    },
    ...queue.publishController(),
  };
}
