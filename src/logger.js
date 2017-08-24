import chalk from 'chalk';
import clear from 'clear';
import { pascalize } from './utils';

export const createTitle = (color, title) => (
  chalk.black[`bg${pascalize(color)}`](` ${title} `)
);

export default class Logger {
  constructor(silent) {
    this.silent = silent;
  }

  clear() {
    if (!this.silent) {
      clear();
    }
  }

  log(...args) {
    if (!this.silent) {
      console.log(...args);
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

  error(message) {
    console.log();
    console.log(`${createTitle('red', 'ERROR')} ${message}`);
    console.log();
  }
}
