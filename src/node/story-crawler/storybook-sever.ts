import * as cp from "child_process";
import waitOn = require("wait-on");
import { StorybookServerTimeoutError, InvalidUrlError } from "./errors";
import { Logger } from "./logger";

function waitServer(url: string, timeout: number) {
  if (!url.startsWith("http")) {
    throw new InvalidUrlError(url);
  }
  const resource = url.startsWith("https") ? url.replace(/^https/, "https-get") : url.replace(/^http/, "http-get");
  return new Promise((resolve, reject) => {
    waitOn({ resources: [resource], timeout }, err => {
      if (err) {
        if (err.message === "Timeout") {
          return reject(new StorybookServerTimeoutError(timeout));
        }
        return reject(err);
      }
      resolve();
    });
  });
}

export interface StorybookServerOptions {
  storybookUrl: string;
  serverCmd?: string;
  serverTimeout: number;
}

export class StorybookServer {
  private proc?: cp.ChildProcess;
  constructor(private opt: StorybookServerOptions, private logger: Logger) {}

  async launchIfNeeded() {
    this.logger.log(`Wait for connecting storybook server ${this.logger.color.green(this.opt.storybookUrl)}.`);
    if (this.opt.serverCmd) {
      const [cmd, ...args] = this.opt.serverCmd.split(/\s+/);
      const stdio = this.logger.level === "verbose" ? [0, 1, 2] : [];
      this.proc = cp.spawn(cmd, args, { stdio });
      this.logger.debug("Server process created", this.proc.pid);
    }
    await waitServer(this.opt.storybookUrl, this.opt.serverTimeout);
    if (this.opt.serverCmd) {
      this.logger.debug("Storybook server started");
    } else {
      this.logger.debug("Found Storybook server");
    }
  }

  async shutdown() {
    if (!this.proc) return;
    try {
      this.logger.debug("Shutdown storybook server", this.proc.pid);
      this.proc.kill("SIGINT");
    } catch (e) {
      // nothing todo
    }
  }
}
