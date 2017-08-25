import chalk from 'chalk';
import clear from 'clear';
import { Spinner } from '@tsuyoshiwada/cli-spinner';
import { pascalize } from './utils';

const log = console.log; // eslint-disable-line no-console

export const createTitle = (color, title) => (
  chalk.black[`bg${pascalize(color)}`](` ${title} `)
);

export default class Logger {
  constructor(silent) {
    this.silent = silent;
  }

  clear(force = false) {
    if (!this.silent || force) {
      clear();
    }

    if (this.spinner) {
      this.spinner.stop(true);
    }
  }

  log(...args) {
    if (!this.silent) {
      log(...args);
    }
  }

  blank(repeat = 1) {
    for (let i = 0; i < repeat; i += 1) {
      this.log();
    }
  }

  section(color, title, message, useSpinner = false) {
    const output = `${createTitle(color, title)} ${message}`;

    this.clear();

    if (useSpinner && !this.silent) {
      this.spinner = new Spinner({
        text: `${output} %s  `,
        color: 'cyan',
      });
      this.spinner.setSpinnerString(18);
      this.spinner.start();
    } else {
      this.log(output);
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
