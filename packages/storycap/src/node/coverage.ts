import { JSCoverageEntry, Protocol } from 'puppeteer-core';
import merge from 'v8-coverage-merge';
import http from 'http';
import path from 'path';
import v8toIstanbul from 'v8-to-istanbul';

const httpGet = (url: string) => {
  return new Promise<string>((resolve, reject) => {
    http
      .get(url, res => {
        res.setEncoding('utf8');
        let body = '';
        res.on('data', chunk => (body += chunk));
        res.on('end', () => resolve(body));
      })
      .on('error', reject);
  });
};

type Coverage = Protocol.Profiler.ScriptCoverage;

export default async function mergeCoverages(entries: JSCoverageEntry[], coveragePath: string): Promise<any> {
  const merged = Object.values(
    entries
      .map(entry => entry.rawScriptCoverage)
      .filter((entry): entry is Coverage => !!entry)
      .reduce<Record<string, Coverage>>((acc, entry) => {
        if (!acc[entry.url]) {
          acc[entry.url] = entry;
          return acc;
        }
        acc[entry.url] = merge(acc[entry.url], entry);
        return acc;
      }, {} as Record<string, Coverage>),
  );
  const returned: Record<string, any> = {};
  for (const entry of merged) {
    const source = await httpGet(entry.url);
    const map = await httpGet(`${entry.url}.map`);

    const converter = v8toIstanbul(entry.url, undefined, {
      source,
      originalSource: '',
      sourceMap: {
        sourcemap: JSON.parse(map),
      },
    });
    await converter.load();
    converter.applyCoverage(entry.functions);
    const asIstanbul = converter.toIstanbul();
    Object.entries(asIstanbul).forEach(([key, value]) => {
      const fullPath = path.resolve(coveragePath);
      value.path = fullPath + value.path;
      returned[fullPath + key] = value;
    });
  }

  return returned;
}
