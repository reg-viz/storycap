import chalk from 'chalk';
import * as _ from 'lodash';
import ProgressBar from 'progress';
import { Writer } from '../../models/terminal';
import { pascalize } from '../utils';

export class Terminal {
  private stdout: Writer;
  private stderr: Writer;
  private silent: boolean;
  private debug: boolean;
  private ciMode: boolean;
  private progressCounter: { current: number; total: number } | null = null;
  private progressbar: ProgressBar | null = null;

  public constructor(
    stdout: Writer,
    stderr: Writer,
    silent: boolean,
    debug: boolean,
    ciMode: boolean
  ) {
    this.stdout = stdout;
    this.stderr = stderr;
    this.silent = silent;
    this.debug = debug;
    this.ciMode = ciMode;
  }

  public echo(...args: {}[]) {
    if (!this.silent) {
      this.stdout.write(`${args.join(' ')}\n`);
    }

    return this;
  }

  public log(title: string, ...args: {}[]) {
    if (this.debug) {
      this.echo(this.createTitle('blue', 'DEBUG'), chalk.blue(`[${title}]`), ...args);
    }

    return this;
  }

  public section(color: string, title: string, message: string) {
    this.clear();
    this.echo(`${this.createTitle(color, title)} ${message}`);

    return this;
  }

  public blank(repeat: number = 1) {
    for (let i = 0; i < repeat; i += 1) {
      this.echo();
    }

    return this;
  }

  public clear() {
    if (!this.silent && !this.debug && !this.ciMode) {
      this.stdout.write('\x1b[2J');
      this.stdout.write('\x1b[0f');
    } else if (this.debug) {
      this.blank(2);
    }

    return this;
  }

  public error(message: string) {
    this.stderr.write(`\n\n${this.createTitle('red', 'ERROR')} ${message}\n\n`);

    return this;
  }

  public progressStart(format: string, total: number) {
    if (!this.silent) {
      if (this.ciMode) {
        this.progressCounter = {
          current: 0,
          total
        };
      } else if (!this.debug) {
        this.progressbar = new ProgressBar(format, {
          complete: '=',
          incomplete: ' ',
          width: 40,
          total
        });
      }
    }

    return this.progressRender();
  }

  public progressStop() {
    if (this.progressCounter != null) {
      this.progressCounter = null;
    } else if (this.progressbar != null) {
      this.progressbar.terminate();
    }

    return this;
  }

  public progressTick() {
    if (this.progressCounter != null) {
      this.progressCounter.current += 1;
      this.progressRender();
    } else if (this.progressbar != null) {
      this.progressbar.tick();
    }

    return this;
  }

  private progressRender() {
    if (this.progressCounter != null) {
      const { current, total } = this.progressCounter;
      const paddedCurrent = _.padStart(`${current}`, `${total}`.length, ' ');
      this.stdout.write(`  ${paddedCurrent}/${total} (${Math.round((current / total) * 100)} %)\n`);
    } else if (this.progressbar != null) {
      this.progressbar.render();
    }

    return this;
  }

  private createTitle(color: string, title: string) {
    const fn = (<any>chalk.black)[`bg${pascalize(color)}`];

    return fn == null ? '' : fn(` ${title} `);
  }
}
