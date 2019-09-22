declare module '@storybook/addons' {
  import { EventEmitter } from 'events';

  export interface StorybookChannel extends EventEmitter {}

  export interface StorybookAPI {
    selectStory(kind: string, story: string): void;
  }

  interface StorybookAddons {
    getChannel(): StorybookChannel;
    register(name: string, loader: (api: StorybookAPI) => void): void;
  }

  const storybookAddons: StorybookAddons;

  export default storybookAddons;
}
