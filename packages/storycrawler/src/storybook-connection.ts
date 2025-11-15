import * as cp from 'child_process';
import waitOn from 'wait-on';
import { StorybookServerTimeoutError, InvalidUrlError } from './errors.js';
import { Logger } from './logger.js';

function waitServer(url: string, timeout: number) {
  if (!url.startsWith('http')) {
    throw new InvalidUrlError(url);
  }
  const resource = url.startsWith('https') ? url.replace(/^https/, 'https-get') : url.replace(/^http/, 'http-get');
  return new Promise<void>((resolve, reject) => {
    waitOn({ resources: [resource], timeout }, err => {
      if (err) {
        if (err.message === 'Timeout') {
          return reject(new StorybookServerTimeoutError(timeout));
        }
        return reject(err);
      }
      resolve();
    });
  });
}

export interface StorybookConnectionOptions {
  storybookUrl: string;
  serverCmd?: string;
  serverTimeout?: number;
}

export type StorybookConnectionStatus = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED';

/**
 *
 * Represents a connection to Storybook server
 *
 * @example
 *
 * ```ts
 * const connection = new StorybookConnection({ storybookUrl: 'http://localhost:9009' });
 * await connection.connect();
 * ```
 *
 * You can boot Storybook server via `serverCmd`
 *
 * ```ts
 * const connection = new StorybookConnection({
 *   storybookUrl: 'http://localhost:9009',
 *   serverCmd: 'start-storybook -p 9009',
 * });
 * await connection.connect();
 * ```
 *
 **/
export class StorybookConnection {
  static spawnCmd(command: string, options?: cp.SpawnOptions) {
    const opt: cp.SpawnOptions = {
      ...(options || {}),
      shell: true,
    };
    const [cmd, ...args] = command.split(/\s+/);
    return cp.spawn(cmd, args, opt);
  }

  private proc?: cp.ChildProcess;
  private _status: StorybookConnectionStatus = 'DISCONNECTED';

  /**
   *
   * @param opt Options for construction
   * @param logger Logger instance
   *
   **/
  constructor(
    private opt: StorybookConnectionOptions,
    private logger: Logger = new Logger('silent'),
  ) {}

  /**
   *
   * @returns URL of Storybook server connecting
   *
   **/
  get url() {
    return this.opt.storybookUrl;
  }

  /**
   *
   * @returns {@link StorybookConnectionStatus}
   *
   **/
  get status() {
    return this._status;
  }

  /**
   *
   * Connect Storybook server
   *
   * @returns Promise of the connection that resolves after connected
   *
   * @remarks
   * If the connection has `serverCmd`, this method boots the server as a child process.
   *
   **/
  async connect() {
    this._status = 'CONNECTING';
    this.logger.log(`Wait for connecting storybook server ${this.logger.color.green(this.opt.storybookUrl)}.`);
    if (this.opt.serverCmd) {
      const stdio = this.logger.level === 'verbose' ? [0, 1, 2] : [];
      this.proc = StorybookConnection.spawnCmd(this.opt.serverCmd, { stdio });
      this.logger.debug('Server process created', this.proc.pid);
    }
    await waitServer(this.opt.storybookUrl, this.opt.serverTimeout || 10_000);
    if (this.opt.serverCmd) {
      this.logger.debug('Storybook server started');
    } else {
      this.logger.debug('Found Storybook server');
    }
    this._status = 'CONNECTED';
    return this;
  }

  /**
   *
   * Disconnect to the Storybook server.
   *
   * @remarks
   * If the connection has `serverCmd`, this method shutdowns it.
   *
   **/
  async disconnect() {
    if (!this.proc) return;
    try {
      this.logger.debug('Shutdown storybook server', this.proc.pid);
      this.proc.kill('SIGINT');
    } catch (e) {
      // nothing todo
    }
    this._status = 'DISCONNECTED';
  }
}
