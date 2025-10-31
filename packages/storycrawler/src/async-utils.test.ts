import { describe, it, expect } from '@jest/globals';
import { runParallel, sleep, createExecutionService, Queue, Task } from './async-utils';

const createWorker = (workerName: string | number) => ({
  async process(taskId: string, time: number = 0) {
    await sleep(time);
    return `${workerName}_${taskId}`;
  },
});

describe(runParallel, () => {
  it('should return empty when task generator yield nothing', async () => {
    async function* tasks(): AsyncGenerator<Task<string, ReturnType<typeof createWorker>>, void> {}

    const result = await runParallel(tasks, [createWorker('w0')]);
    expect(result).toEqual([]);
  });

  it('should run 1 task with 1 worker', async () => {
    async function* tasks(): AsyncGenerator<Task<string, ReturnType<typeof createWorker>>, void> {
      yield async worker => await worker.process('t0');
    }

    const result = await runParallel(tasks, [createWorker('w0')]);
    expect(result).toEqual(['w0_t0']);
  });

  it('should run multiple tasks with multiple workers in parallel', async () => {
    async function* tasks(): AsyncGenerator<Task<string, ReturnType<typeof createWorker>>, void> {
      for (let i = 0; i < 10; i++) {
        yield async worker => await worker.process(`t${i}`, 20);
      }
    }

    const start = Date.now();
    const result = await runParallel(tasks, [...new Array(4).keys()].map(createWorker));
    const end = Date.now();
    expect(result.length).toEqual(10);
    expect(end - start <= 200).toBeTruthy();
  });
});

describe(Queue, () => {
  it('should be closed automatically when allowEmpty is not set', done => {
    const queue = new Queue<string, string, ReturnType<typeof createWorker>>({
      allowEmpty: false,
      createTask(req) {
        return async worker => worker.process(req, 10);
      },
    });
    queue.push('t0');
    runParallel(queue.tasks.bind(queue), [createWorker('w0')]).then(result => {
      expect(result).toEqual(['w0_t0', 'w0_t1']);
      done();
    });
    sleep(5).then(() => queue.push('t1'));
  });

  it('should be shutdown when close is called if tasks are remaining', done => {
    const queue = new Queue<string, string, ReturnType<typeof createWorker>>({
      allowEmpty: false,
      createTask(req) {
        return async worker => worker.process(req, 10);
      },
    });
    queue.push('t0');
    queue.push('t1');
    sleep(5).then(() => queue.close());
    runParallel(queue.tasks.bind(queue), [createWorker('w0')]).then(result => {
      expect(result).toEqual(['w0_t0']);
      done();
    });
  });

  it('should be closed manually when allowEmpty is set', done => {
    const queue = new Queue<string, string, ReturnType<typeof createWorker>>({
      allowEmpty: true,
      createTask(req) {
        return async worker => worker.process(req);
      },
    });
    queue.push('t0');
    runParallel(queue.tasks.bind(queue), [createWorker('w0')]).then(result => {
      expect(result).toEqual(['w0_t0', 'w0_t1']);
      done();
    });
    sleep(1).then(() => queue.push('t1'));
    sleep(2).then(() => queue.close());
  });
});

describe(createExecutionService, () => {
  it('should create executable object', done => {
    const service = createExecutionService([createWorker('w0')], ['t0'], req => worker => worker.process(req), {
      allowEmpty: true,
    });
    service.execute().then(result => {
      expect(result).toEqual(['w0_t0', 'w0_t1']);
      done();
    });
    sleep(1).then(() => service.push('t1'));
    sleep(2).then(() => service.close());
  });
});
