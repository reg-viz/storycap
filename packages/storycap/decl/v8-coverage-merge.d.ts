declare module 'v8-coverage-merge' {
  import { Protocol } from 'puppeteer-core';
  function merge(
    a: Protocol.Profiler.ScriptCoverage,
    b: Protocol.Profiler.ScriptCoverage,
  ): Protocol.Profiler.ScriptCoverage;
  export default merge;
}
