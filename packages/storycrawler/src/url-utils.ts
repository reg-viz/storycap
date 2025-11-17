/**
 *
 * Completes the URL to the iframe with stories with `search` and `hash` parts of the connection URL
 *
 * @param connectionUrl - An absolute URL to the Storybook web site
 * @param relativeIframeUrl - A relative URL to the iframe with stories
 * @returns An absolute URL to the iframe with stories with `search` and `hash` parts of the connection URL
 *
 **/
export function completeIframeUrl(connectionUrl: string, relativeIframeUrl: string): string {
  const connectionUrlObject = new URL(connectionUrl);
  // Treat the connection URL as a URL to a directory, when appending
  // the relative path to it. The original implementation just appended
  // '/iframe.html' to the connection URL.
  if (!connectionUrlObject.pathname.endsWith('/')) {
    connectionUrlObject.pathname += '/';
  }
  const iframeUrlObject = new URL(relativeIframeUrl, connectionUrlObject.href);
  const { search: iframeSearch } = iframeUrlObject;
  let { search: connectionSearch } = connectionUrlObject;
  // Append the search part from the connection URL to the iframe URL
  if (connectionSearch) {
    if (iframeSearch) {
      connectionSearch = '&' + connectionSearch.slice(1);
    }
    iframeUrlObject.search += connectionSearch;
  }
  // Set the hash part from the connection URL to the iframe URL
  iframeUrlObject.hash = connectionUrlObject.hash;
  return iframeUrlObject.href;
}
