import { spawn } from 'child_process';
import mkdirp from 'mkdirp';
import puppeteer from 'puppeteer';


class StorybookServer {
  constructor(server, url) {
    this._server = server;
    this._url = url;
  }

  getURL() {
    return this._url;
  }

  kill() {
    this._server.kill();
  }
}


const optionsToCommandArgs = (options) => {
  const args = [
    '-p', options.port,
    '-c', options.configDir,
  ];

  if (options.host) {
    args.push('-h', options.host);
  }

  if (options.staticDir) {
    args.push('-s', options.staticDir);
  }

  return args;
};

const startStorybookServer = (options) => new Promise((resolve, reject) => {
  const { cmd, cwd } = options;
  const args = optionsToCommandArgs(options);
  const storybook = spawn(cmd, args, { cwd });

  storybook.stdout.on('data', (out) => {
    const str = out.toString().trim();
    const m = str.match(/^Storybook started on => (https?:\/\/.+)$/);

    if (m) {
      const s = new StorybookServer(storybook, m[1]);
      resolve(s);
    }
  });

  storybook.stderr.on('data', (out) => {
    // console.log('STDERR: ', out.toString());
  });

  storybook.on('error', (err) => {
    reject(err.toString());
  });
});


export default startStorybookServer;
