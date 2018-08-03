import { EventEmitter } from 'events';

export type StorybookEnv = 'react' | 'angular' | 'vue';

export interface Group {
  kind: string;
  stories: string[];
}

export interface Channel extends EventEmitter {}

export interface API {
  selectStory(kind: string, story: string): void;
}
