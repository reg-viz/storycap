import * as cp from "child_process";
import waitOn = require("wait-on");
import { MainOptions } from "./types";
import { StorybookServerTimeoutError, InvalidUrlError } from "./errors";

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

export class StorybookServer {
  private proc?: cp.ChildProcess;
  constructor(private opt: MainOptions) {}

  async launchIfNeeded() {
    this.opt.logger.log(`Wait for connecting storybook server ${this.opt.logger.color.green(this.opt.storybookUrl)}.`);
    if (this.opt.serverCmd) {
      const [cmd, ...args] = this.opt.serverCmd.split(/\s+/);
      const stdio = this.opt.logger.level === "verbose" ? [0, 1, 2] : [];
      this.proc = cp.spawn(cmd, args, { stdio });
      this.opt.logger.debug("Server process created", this.proc.pid);
    }
    await waitServer(this.opt.storybookUrl, this.opt.serverTimeout);
    if (this.opt.serverCmd) {
      this.opt.logger.debug("Storybook server started");
    } else {
      this.opt.logger.debug("Found Storybook server");
    }
  }

  async shutdown() {
    if (!this.proc) return;
    try {
      this.opt.logger.debug("Shutdown storybook server", this.proc.pid);
      this.proc.kill("SIGINT");
    } catch (e) {
      // nothing todo
    }
  }
}
