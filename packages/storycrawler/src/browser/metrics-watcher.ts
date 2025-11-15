import type { Page, Metrics } from 'puppeteer-core';
import { sleep } from '../async-utils.js';

/**
 *
 * Helper to detect whether browser's rendering pipeline is stable
 *
 * @example
 *
 * ```ts
 * async function someTask() {
 *   const watcher = new MetricsWatcher(previewBrowser.page);
 *   await watcher.waitForStable();
 *   doSomething(previewBrowser.page);
 * }
 * ```
 *
 **/
export class MetricsWatcher {
  private length = 3;
  private previous: Metrics[] = [];

  constructor(
    private page: Page,
    private count: number = 1000,
  ) {}

  /**
   *
   * Waits until the page's rendering process is stable.
   *
   * @remarks
   * This method checks the following counts get steady:
   *
   * - The number of DOM nodes
   * - The number of calculation style
   * - The number of calculation layout
   *
   **/
  async waitForStable() {
    for (let i = 0; i < this.count; ++i) {
      if (await this.check()) return i;
      await sleep(16);
    }
    return this.count;
  }

  private async check() {
    const current = await this.page.metrics();
    if (this.previous.length < this.length) return this.next(current);
    if (this.diff('Nodes')) return this.next(current);
    if (this.diff('RecalcStyleCount')) return this.next(current);
    if (this.diff('LayoutCount')) return this.next(current);
    return true;
  }

  private diff(k: keyof Metrics) {
    for (let i = 1; i < this.previous.length; ++i) {
      if (this.previous[i][k] !== this.previous[0][k]) return true;
    }
    return false;
  }

  private next(m: Metrics) {
    this.previous.push(m);
    this.previous = this.previous.slice(-this.length);
    return false;
  }
}
