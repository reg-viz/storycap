import { runParallel, sleep, createQueueService, Queue, Task } from "./async-utils";

const createRunner = (runnerName: string) => ({
  async run(taskId: string, time: number = 0) {
    await sleep(time);
    return `${runnerName}_${taskId}`;
  },
});

describe(runParallel, () => {
  it("shuld run 1 task", async () => {
    async function* tasks(): AsyncGenerator<Task<string, ReturnType<typeof createRunner>>, void> {
      yield async runner => await runner.run("t0");
    }

    const result = await runParallel(tasks, [createRunner("r0")]);
    expect(result).toEqual(["r0_t0"]);
  });

  it("shuld run tasks with runners", async () => {
    async function* tasks(): AsyncGenerator<Task<string, ReturnType<typeof createRunner>>, void> {
      yield async runner => await runner.run("t0");
      yield async runner => await runner.run("t1", 10);
      yield async runner => await runner.run("t2");
    }

    const result = await runParallel(tasks, [createRunner("r0"), createRunner("r1")]);
    expect(result).toEqual(["r0_t0", "r0_t2", "r1_t1"]);
  });
});

describe(Queue, () => {
  it("shuld be used with runParallel", done => {
    const queue = new Queue<string, string, ReturnType<typeof createRunner>>({
      createTask(req) {
        return async runner => runner.run(req);
      },
    });
    queue.push("t0");
    runParallel(queue.tasks.bind(queue), [createRunner("r0")]).then(result => {
      expect(result).toEqual(["r0_t0", "r0_t1"]);
      done();
    });
    sleep(10).then(() => queue.push("t1"));
    sleep(20).then(() => queue.disconnect());
  });
});

describe(createQueueService, () => {
  it("should create runnable object", done => {
    const { queue, run } = createQueueService([createRunner("r0")], ["t0"], req => runner => runner.run(req));
    run().then(result => {
      expect(result).toEqual(["r0_t0", "r0_t1"]);
      done();
    });
    sleep(10).then(() => queue.push("t1"));
    sleep(20).then(() => queue.disconnect());
  });
});
