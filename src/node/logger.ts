import chalk, { Chalk } from "chalk";

export type LogLevel = "verbose" | "silent" | "normal";

export class Logger {
  color: Chalk;

  constructor(public level: LogLevel = "normal") {
    this.color = new chalk.constructor({ level: 1 });
  }

  debug(...msg: any[]) {
    if (this.level !== "verbose") return;
    // eslint-disable-next-line no-console
    console.log.apply(console, [this.color.gray("debug"), ...msg]);
  }

  log(...msg: (string | number | boolean)[]) {
    if (this.level === "silent") return;
    // eslint-disable-next-line no-console
    console.log.apply(console, [this.color.cyan("info"), ...msg]);
  }

  warn(...msg: (string | number | boolean)[]) {
    if (this.level === "silent") return;
    // eslint-disable-next-line no-console
    console.error.apply(console, [this.color.yellow("warn"), ...msg]);
  }

  error(...msg: any[]) {
    if (this.level === "silent") return;
    // eslint-disable-next-line no-console
    console.error.apply(console, [this.color.red("error"), ...msg]);
  }

  errorStack(stack: any) {
    if (this.level === "silent") return;
    // eslint-disable-next-line no-console
    console.error(stack);
  }

  write(d: string | Buffer) {
    if (this.level === "silent") return;
    process.stdout.write(d);
  }

  tick() {
    if (this.level === "silent") return;
    process.stdout.write(".");
  }
}
