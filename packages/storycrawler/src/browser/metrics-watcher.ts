import { Page, Metrics } from 'puppeteer';
import { sleep } from '../async-utils';

export class MetricsWatcher {
  private length = 3;
  private previous: Metrics[] = [];

  constructor(private page: Page, private count: number = 1000) {}

  async waitForStable() {
    for (let i = 0; i < this.count; ++i) {
      if (await this.check()) return i;
      await sleep(20);
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
