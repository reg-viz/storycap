import { spawn } from 'child_process';
import qs from 'query-string';


class StorybookServer {
  constructor(server, url) {
    this.server = server;
    this.url = url;
  }

  getURL() {
    return this.url;
  }

  createURL(query) {
    return `${this.getURL()}${query ? `?${qs.stringify(query)}` : ''}`;
  }

  kill() {
    this.server.kill();
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

const startStorybookServer = (options, logger) => new Promise((resolve, reject) => {
  const { cmd, cwd } = options;
  const args = optionsToCommandArgs(options);
  const storybook = spawn(cmd, args, { cwd });
  const isStarted = (out) => {
    const str = out.toString().trim();
    const m = str.match(/Storybook started on => (https?:\/\/.+)/);

    if (m) {
      const s = new StorybookServer(storybook, m[1]);
      resolve(s);
    }
  };

  storybook.stdout.on('data', (out) => {
    isStarted(out);
  });

  storybook.stderr.on('data', (out) => {
    logger.log('STDERR', out.toString());
    isStarted(out);
  });

  storybook.on('error', (err) => {
    reject(err.toString());
  });
});


export default startStorybookServer;
