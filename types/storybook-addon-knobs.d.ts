declare module '@storybook/addon-knobs/react' {
  import * as React from 'react';

  export function withKnobs(storyFn: Function, context: { kind: string, story: string }): React.ReactElement<any>;

  export function boolean(name: string, value: boolean): boolean;

  export function text(name: string, value: string | null): string;

  export function select<T>(name: string, options: { [s: string]: T }, value: string): T;
  export function select<T>(name: string, options: T[], value: T): T;
}
