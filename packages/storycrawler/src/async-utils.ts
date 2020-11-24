/**
 *
 * Waits for given time
 *
 **/
export async function sleep(time: number = 0): Promise<void> {
  await Promise.resolve();
  if (time <= 0) return;
  return new Promise(res => setTimeout(() => res(), time));
}

/**
 *
 * Represents a task to do something which resolves `<T>`.
 *
 **/
export type Task<T, S> = (worker: S) => Promise<T>;

/**
 *
 * Allocates and executes tasks in parallel
 *
 * @param tasks - Generator function which yields next task
 * @param workers - Processors which deal each task
 * @returns List of results of the all tasks
 *
 **/
export async function runParallel<T, S>(tasks: () => AsyncGenerator<Task<T, S>, void>, workers: S[]) {
  const results: T[] = [];
  const p = workers.length;
  if (!p) throw new Error('No workers');
  const generator = tasks();
  await Promise.all(
    [...new Array(p).keys()].map(
      i =>
        new Promise<void>((res, rej) => {
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

/**
 *
 * Controller to command a {@link Queue}
 *
 **/
export interface QueueController<R> {
  /**
   *
   * Add a task request
   *
   **/
  push(request: R): void;

  /**
   *
   * Close the queue
   *
   **/
  close(): void;
}

/**
 *
 * Parameters to create {@link Queue}
 *
 **/
export type QueueOptions<R, T, S> = {
  initialRequests?: R[] | IterableIterator<R>;

  /**
   *
   * Creates a task from the given request
   *
   * @param request - Queued request object
   * @param controller - Commands to operate this queue instance
   * @returns A task object corresponding to the request
   *
   **/
  createTask(request: R, controller: QueueController<R>): Task<T, S>;

  /**
   *
   * If set true, the queue instance does not stop when the list of waiting requests gets empty.
   *
   **/
  allowEmpty?: boolean;
};

const cancelationToken = Symbol('cancel');

type Resolver<R> = {
  resolve: (req: R) => void;
  cancel: () => void;
};

/**
 *
 * Represents list of tasks waiting
 *
 **/
export class Queue<R, T, S> {
  private requestIdCounter = 0;
  private tobeContinued = true;
  private readonly futureRequests: Promise<R>[] = [];
  private readonly resolvers: Resolver<R>[] = [];
  private readonly requestingIds = new Set<string>();
  private readonly allowEmpty: boolean;
  private readonly createDelegationTask: (request: R, controller: QueueController<R>) => Task<T, S>;

  /**
   *
   * @param opt - See {@link QueueOptions}
   *
   **/
  constructor({ initialRequests, createTask, allowEmpty }: QueueOptions<R, T, S>) {
    this.createDelegationTask = createTask;
    this.allowEmpty = !!allowEmpty;
    if (initialRequests) {
      for (const req of initialRequests) {
        this.push(req);
      }
    }
  }

  /**
   *
   * Add a new request to this queue
   *
   * @param req - Request object
   *
   **/
  push(req: R) {
    if (this.resolvers.length) {
      const resolver = this.resolvers.shift() as Resolver<R>;
      resolver.resolve(req);
    } else {
      this.futureRequests.push(Promise.resolve(req));
    }
  }

  /**
   *
   * Ends to execute
   *
   *
   **/
  close() {
    this.tobeContinued = false;
    this.resolvers.forEach(({ cancel }) => cancel());
  }

  /**
   *
   * Creates a task generator
   *
   * @returns Generator function
   *
   **/
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

  /**
   *
   * Create {@link QueueController} instance corresponding to this queue
   *
   * @returns A queue controller
   *
   **/
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
}

/**
 *
 * Optional parameters for {@link createExecutionService}
 *
 **/
export type CreateExecutionServiceOptions = {
  /**
   *
   * If set true, the queue instance does not stop when the list of waiting requests gets empty.
   *
   **/
  allowEmpty?: boolean;
};

/**
 *
 * Executor for queued tasks in parallel
 *
 **/
export interface ExecutionService<R, T> extends QueueController<R> {
  /**
   *
   * Executes given tasks in parallel
   *
   **/
  execute(): Promise<T[]>;
}

/**
 *
 * Creates queue and executor from worker and initial request.
 *
 * @param workers - List of workers to perform tasks
 * @param initialRequests - Initial requests
 * @param createTask - Converts from a given request to a task performed by each worker
 * @param options - Option parameters
 * @returns {@link ExecutionService} instance
 *
 **/
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
