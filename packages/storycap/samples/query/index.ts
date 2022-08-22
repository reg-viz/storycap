import { time, ChromeChannel } from '../../../storycrawler';
import { main } from '../../src/node/main';
import { MainOptions } from '../../src/node/types';
import { Logger } from '../../src/node/logger';

const logger = new Logger('verbose');

const opt = {
  serverOptions: {
    storybookUrl: 'http://localhost:6006',
    serverCmd: '',
    serverTimeout: 20_000,
  },
  outDir: '__screenshots__',
  flat: false,
  include: ['Example/Button/Primary'],
  exclude: [],
  delay: 0,
  viewports: ['800x600'],
  parallel: 4,
  captureTimeout: 5_000,
  captureMaxRetryCount: 3,
  metricsWatchRetryCount: 1000,
  viewportDelay: 300,
  reloadAfterChangeViewport: false,
  stateChangeDelay: 0,
  disableCssAnimation: true,
  disableWaitAssets: false,
  chromiumChannel: '*' as ChromeChannel,
  chromiumPath: '',
  launchOptions: '{ "args": ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"] }',
  logger,
  additionalQuery: 'path=/story/example-button--primary&args=primary:false',
} as MainOptions;

time(main(opt))
  .then(([numberOfCaptured, duration]) => {
    logger.log(
      `Screenshot was ended successfully in ${logger.color.green(duration + ' msec')} capturing ${logger.color.green(
        numberOfCaptured + '',
      )} PNGs.`,
    );
    process.exit(0);
  })
  .catch(error => {
    if (error instanceof Error) {
      logger.error(error.message);
      logger.errorStack(error.stack);
    } else {
      logger.error(error);
    }
    process.exit(1);
  });
