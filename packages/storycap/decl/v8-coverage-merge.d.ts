declare module 'v8-coverage-merge' {
  import { Protocol } from 'puppeteer-core';
  function merge(coverages: Protocol.Profiler.ScriptCoverage[]): Protocol.Profiler.ScriptCoverage[];
  export default merge;
}
