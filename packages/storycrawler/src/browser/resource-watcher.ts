import { Page } from 'puppeteer';

interface AssetRequestMetadata {
  resolve(): void;
  resolved: Promise<void>;
}

/**
 *
 * Helper to wait until requesting assets are resolved
 *
 * @example
 *
 * ```ts
 * class Worker {
 *   constructor() {
 *     this.resourceWatcher = new ResourceWatcher(this.page).init();
 *   }
 *   async someTask() {
 *     this.resourceWatcher.clear();
 *     await this.doSomething(this.page); // Trigger some HTTP requests
 *     await this.resourceWatcher.waitForRequestsComplete();
 *   }
 * }
 * ```
 *
 **/
export class ResourceWatcher {
  private resolvedAssetsMap = new Map<string, AssetRequestMetadata>();
  private requestedAssetUrls = new Set<string>();

  /**
   *
   * @param page - Puppeteer page object
   *
   **/
  constructor(private page: Page) {}

  /**
   *
   * Registers listeners to the Puppeteer page object.
   *
   * @returns The ResourceWatcher instance itself
   *
   **/
  init() {
    const setAsResolved = (url: string) => {
      const metadata = this.resolvedAssetsMap.get(url);
      if (!metadata) return;
      metadata.resolve();
    };
    this.page.on('request', request => {
      const url = request.url();
      if (request.method() !== 'GET') return;
      this.requestedAssetUrls.add(url);
      if (this.resolvedAssetsMap.has(url)) return;
      let resolve: () => void = () => {};
      const resolved = new Promise<void>(res => (resolve = res));
      const metadata: AssetRequestMetadata = {
        resolve,
        resolved,
      };
      this.resolvedAssetsMap.set(url, metadata);
    });

    this.page.on('requestfinished', req => setAsResolved(req.url()));
    this.page.on('requestfailed', req => setAsResolved(req.url()));
    this.page.on('response', res => {
      const contentType = res.headers()['content-type'];
      if (contentType && contentType.indexOf('text/event-stream') !== -1) {
        setAsResolved(res.url());
      }
    });
    return this;
  }

  /**
   *
   * Clears requested URLs to wait for.
   *
   **/
  clear() {
    this.requestedAssetUrls = new Set();
  }

  /**
   *
   * @returns URLs requested
   *
   **/
  getRequestedUrls() {
    const urls = [...this.requestedAssetUrls.values()];
    return urls;
  }

  /**
   *
   * Waits until the all resource requests are finished.
   *
   **/
  async waitForRequestsComplete() {
    const urls = this.getRequestedUrls();
    await Promise.all(
      urls
        .map(url => this.resolvedAssetsMap.get(url))
        .filter(m => !!m)
        .map(m => m!.resolved),
    );
    return urls;
  }
}
