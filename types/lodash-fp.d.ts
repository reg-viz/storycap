/* tslint:disable:no-any */
// NOTE: Once the type definition of `lodash/fp` is published it needs to be replaced.
declare module 'lodash/fp' {
  export function flattenDepth(depth: number): Function;
  export function flowRight(fn: Function, mapper: Function): Function;
  export function map(fn: Function): Function;
}
