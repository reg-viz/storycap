import picocolors from 'picocolors';

export type LogLevel = 'verbose' | 'silent' | 'normal';

export class Logger {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  color: any = picocolors;

  constructor(public level: LogLevel = 'normal') {
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(...msg: any[]) {
    if (this.level !== 'verbose') return;
    // eslint-disable-next-line no-console
    console.log.apply(console, [this.color.gray('debug'), ...msg]);
  }

  log(...msg: (string | number | boolean)[]) {
    if (this.level === 'silent') return;
    // eslint-disable-next-line no-console
    console.log.apply(console, [this.color.cyan('info'), ...msg]);
  }

  warn(...msg: (string | number | boolean)[]) {
    if (this.level === 'silent') return;
    // eslint-disable-next-line no-console
    console.error.apply(console, [this.color.yellow('warn'), ...msg]);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(...msg: any[]) {
    if (this.level === 'silent') return;
    // eslint-disable-next-line no-console
    console.error.apply(console, [this.color.red('error'), ...msg]);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errorStack(stack: any) {
    if (this.level === 'silent') return;
    // eslint-disable-next-line no-console
    console.error(stack);
  }

  write(d: string | Buffer) {
    if (this.level === 'silent') return;
    process.stdout.write(d);
  }

  tick() {
    if (this.level === 'silent') return;
    process.stdout.write('.');
  }
}
