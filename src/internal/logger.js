import chalk from 'chalk';
import clear from 'clear';
import { Spinner } from '@tsuyoshiwada/cli-spinner';
import { pascalize } from './utils';

const log = console.log; // eslint-disable-line no-console

export const createTitle = (color, title) => (
  chalk.black[`bg${pascalize(color)}`](` ${title} `)
);

export default class Logger {
  constructor(silent, debug) {
    this.silent = silent;
    this.debug = debug;
  }

  clear() {
    if (!this.debug && !this.silent) {
      clear();
    } else if (this.debug) {
      this.blank(2);
    }

    if (this.spinner) {
      this.spinner.stop(true);
    }
  }

  echo(...args) {
    if (!this.silent) {
      log(...args);
    }
  }

  log(title, ...args) {
    if (this.debug) {
      this.echo(
        `${createTitle('blue', 'DEBUG')}`,
        chalk.blue(`[${title}]`),
        ...args,
      );
    }
  }

  blank(repeat = 1) {
    for (let i = 0; i < repeat; i += 1) {
      this.echo();
    }
  }

  section(color, title, message, useSpinner = false) {
    const output = `${createTitle(color, title)} ${message}`;

    this.clear();

    if (useSpinner && !this.silent && !this.debug) {
      this.spinner = new Spinner({
        text: `${output} %s  `,
        color: 'cyan',
      });
      this.spinner.setSpinnerString(18);
      this.spinner.start();
    } else {
      this.echo(output);
    }
  }

  /* eslint-disable no-console, class-methods-use-this */
  error(message) {
    console.log();
    console.log(`${createTitle('red', 'ERROR')} ${message}`);
    console.log();
  }
  /* eslint-enable */
}
