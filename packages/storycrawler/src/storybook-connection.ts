import * as cp from 'child_process';
import waitOn = require('wait-on');
import { StorybookServerTimeoutError, InvalidUrlError } from './errors';
import { Logger } from './logger';

function waitServer(url: string, timeout: number) {
  if (!url.startsWith('http')) {
    throw new InvalidUrlError(url);
  }
  const resource = url.startsWith('https') ? url.replace(/^https/, 'https-get') : url.replace(/^http/, 'http-get');
  return new Promise((resolve, reject) => {
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

export class StorybookConnection {
  private proc?: cp.ChildProcess;
  private _status: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' = 'DISCONNECTED';
  constructor(private opt: StorybookConnectionOptions, private logger: Logger = new Logger('silent')) {}

  get url() {
    return this.opt.storybookUrl;
  }

  get status() {
    return this._status;
  }

  async connect() {
    this._status = 'CONNECTING';
    this.logger.log(`Wait for connecting storybook server ${this.logger.color.green(this.opt.storybookUrl)}.`);
    if (this.opt.serverCmd) {
      const [cmd, ...args] = this.opt.serverCmd.split(/\s+/);
      const stdio = this.logger.level === 'verbose' ? [0, 1, 2] : [];
      this.proc = cp.spawn(cmd, args, { stdio });
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
