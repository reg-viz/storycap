import { SpawnOptions } from 'child_process';
import { CLIOptions } from '../../models/options';
import { Terminal } from './Terminal';

export interface ReadableStream {
  on(event: 'data', listener: (buf: string | Buffer) => void): this;
}

export interface ChildProcess {
  stdout: ReadableStream;
  stderr: ReadableStream;
  killed: boolean;
  kill(signal?: string): void;
  on(event: 'error', listener: (err: Error) => void): this;
}

export interface CommandExecutor {
  (command: string, args?: string[], options?: SpawnOptions): ChildProcess;
}

export class Server {
  private options: CLIOptions;
  private terminal: Terminal;
  private spawn: CommandExecutor;
  private url: string | null = null;
  private proc: ChildProcess | null = null;

  public constructor(options: CLIOptions, terminal: Terminal, spawn: CommandExecutor) {
    this.options = options;
    this.terminal = terminal;
    this.spawn = spawn;
  }

  private static optionsToCommandArgs(options: CLIOptions) {
    const args = ['-p', options.port.toString(), '-c', options.configDir];

    if (options.host !== '' && options.host != null) {
      args.push('-h', options.host);
    }

    if (options.staticDir !== '' && options.staticDir != null) {
      args.push('-s', options.staticDir);
    }

    return args;
  }

  private static matchServerURL(buffer: string | Buffer) {
    const str = buffer.toString().trim();
    const m = str.match(/Storybook started on => (https?:\/\/.+)/);

    if (m == null) {
      return null;
    }

    return m[1];
  }

  public start() {
    return new Promise((resolve, reject) => {
      const { cwd, cmd } = this.options;
      const args = Server.optionsToCommandArgs(this.options);
      const proc = this.spawn(cmd, args, { cwd });
      const assignAndResolveIfNeeded = (buf: string | Buffer) => {
        const url = Server.matchServerURL(buf);
        if (url != null) {
          this.url = url;
          this.proc = proc;
          this.terminal.log('Storybook URL', url);
          resolve();
        }
      };

      this.terminal.log('Command Arguments', args.join(' '));

      proc.stdout.on('data', (buf) => {
        this.terminal.log('STDOUT', buf.toString().trim());
        assignAndResolveIfNeeded(buf);
      });

      proc.stderr.on('data', (buf) => {
        this.terminal.log('STDERR', buf.toString().trim());
        assignAndResolveIfNeeded(buf);
      });

      proc.on('error', (err) => {
        reject(err.message);
      });
    });
  }

  public getURL() {
    return this.url !== null ? this.url : '';
  }

  public stop() {
    if (this.proc !== null && !this.proc.killed) {
      this.proc.kill();
    }
  }
}
