import { JSCoverageEntry, Protocol } from 'puppeteer-core';
import merge from 'v8-coverage-merge';

type Coverage = Protocol.Profiler.ScriptCoverage;

export default function mergeCoverages(entries: JSCoverageEntry[]): Coverage[] | undefined {
  const merged = merge(entries.map(entry => entry.rawScriptCoverage).filter((entry): entry is Coverage => !!entry));
  return merged;
}
