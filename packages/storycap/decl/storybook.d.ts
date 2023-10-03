declare module '@storybook/addons' {
  import { EventEmitter } from 'events';

  export interface API {
    raw?: () => { id: string; kind: string; name: string }[];
    getStorybook(): { kind: string; stories: { name: string }[] }[];
  }

  export interface StoryKind {
    kind: string;
    stories: string[];
  }

  export class Channel extends EventEmitter {
    on(name: 'setStories', listener: (event: { stories: StoryKind[] }) => void): this;
    once(name: 'setStories', listener: (event: { stories: StoryKind[] }) => void): this;
  }

  export interface Addons {
    register(name: string, callback: (api: API) => void): void;
    getChannel(): Channel;
  }

  interface MakeDecorator {
    (options: {
      name: string;
      parameterName: string;
      skipIfNoParametersOrOptions: boolean;
      allowDeprecatedUsage: boolean;
      wrapper: (getStory: any, context: any, args: { parameters: any; options: any }) => any;
    }): Function;
  }

  // Note:
  // Storybook v4 does not export makeDecorator function.
  export const makeDecorator: MakeDecorator | undefined;

  export const addons: Addons;
}
