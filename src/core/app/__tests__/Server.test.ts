import { SpawnOptions } from 'child_process';
import { Server } from '../Server';
import { cliOptions } from './cli-options.mock';
import { MockChildProcess } from './Server.mock';
import { factory } from './Terminal.mock';

describe('Server', () => {
  it('Should be handle storybook server', async () => {
    const opts = {
      ...cliOptions,
      host: 'localhost',
      port: 3030
    };

    const { term } = factory(false, false);
    const calls: { command: string; args: string[]; options: SpawnOptions }[] = [];
    const proc = new MockChildProcess();
    const spawn = (command: string, args?: string[], options?: SpawnOptions) => {
      calls.push({
        command,
        args: args != null ? args : [],
        options: options != null ? options : {}
      });

      return proc;
    };

    const server = new Server(opts, term, spawn);

    expect(server.getURL()).toBe('');

    // start
    await Promise.all([
      server.start(),
      new Promise((resolve) => {
        proc.stderr.emit('data', new Buffer('Storybook started on => http://localhost:3030'));
        resolve();
      })
    ]);

    expect(calls).toHaveLength(1);
    expect(calls[0].command).toBe('start-storybook');
    expect(calls[0].args).toEqual([
      '-p',
      opts.port.toString(),
      '-c',
      opts.configDir,
      '-h',
      opts.host
    ]);
    expect(calls[0].options).toEqual({ cwd: opts.cwd });
    expect(server.getURL()).toBe('http://localhost:3030');

    // stop
    expect(proc.killed).toBe(false);
    server.stop();
    expect(proc.killed).toBe(true);
  });
});
