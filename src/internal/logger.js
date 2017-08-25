import chalk from 'chalk';
import clear from 'clear';
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

  section(color, title, message) {
    this.clear();
    this.log(`${createTitle(color, title)} ${message}`);
  }

  /* eslint-disable no-console, class-methods-use-this */
  error(message) {
    console.log();
    console.log(`${createTitle('red', 'ERROR')} ${message}`);
    console.log();
  }
  /* eslint-enable */
}
