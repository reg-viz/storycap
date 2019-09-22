import { withScreenshot as ReactWithScreenshot } from "./react/withScreenshot";

import { noopDecorator } from "./noop";
import { ScreenShotOptions } from "./types";

const getStorybookEnv = () => <string>(<any>window).STORYBOOK_ENV;

export interface WithScreenshot {
  <T = Function>(options?: Partial<ScreenShotOptions>): T;
}

const storybookEnv = getStorybookEnv();
let withScreenshot: WithScreenshot;

if (storybookEnv == null) {
  withScreenshot = <WithScreenshot>noopDecorator;
} else {
  switch (storybookEnv) {
    case "react":
      withScreenshot = <WithScreenshot>ReactWithScreenshot;
      break;
    default:
      throw new Error(`storybook-chrome-screenshot does not support "${storybookEnv}".`);
  }
}

export { withScreenshot };
