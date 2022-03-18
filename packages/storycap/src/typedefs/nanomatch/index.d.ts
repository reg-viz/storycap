// TODO nanomatch does not publish .d.ts
// https://github.com/micromatch/nanomatch/issues/21#issuecomment-898969680
declare module 'nanomatch' {
  interface MatchOptions {
    basename?: boolean;
    bash?: boolean;
    cache?: boolean;
    dot?: boolean;
    failglob?: boolean;
    ignore?: string | string[];
    matchBase?: boolean;
    nocase?: boolean;
    nodupes?: boolean;
    nonegate?: boolean;
    noglobstar?: boolean;
    nonull?: boolean;
    nullglob?: boolean;
    slash?: string | (() => string);
    star?: string | (() => string);
    /* https://github.com/jonschlinkert/snapdragon */
    snapdragon?: object; // a snapdragon instance:
    sourcemap?: boolean;
    unescape?: boolean;
    unixify?: boolean;
  }

  export const isMatch: (string: string, pattern: string, options?: MatchOptions) => boolean;
}
