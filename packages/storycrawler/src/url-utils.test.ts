import { describe, it, expect } from '@jest/globals';
import { completeIframeUrl } from './url-utils';

describe(completeIframeUrl, () => {
  it('concatenates URLs with no search and hash parts', () => {
    expect(completeIframeUrl('http://localhost:6006', 'iframe.html')).toEqual('http://localhost:6006/iframe.html');
  });

  it('appends iframe URL to a URL with a root path', () => {
    expect(completeIframeUrl('http://localhost:6006/', 'iframe.html')).toEqual('http://localhost:6006/iframe.html');
  });

  it('appends iframe URL to a URL with a directory path', () => {
    expect(completeIframeUrl('http://localhost:6006/storybook', 'iframe.html')).toEqual(
      'http://localhost:6006/storybook/iframe.html',
    );
  });

  it('appends iframe URL to a URL with a directory path ending with slash', () => {
    expect(completeIframeUrl('http://localhost:6006/storybook/', 'iframe.html')).toEqual(
      'http://localhost:6006/storybook/iframe.html',
    );
  });

  it('appends iframe URL with a search part', () => {
    expect(completeIframeUrl('http://localhost:6006', 'iframe.html?foo=bar')).toEqual(
      'http://localhost:6006/iframe.html?foo=bar',
    );
  });

  it('appends iframe URL with a search part to connection URL with a search part', () => {
    expect(completeIframeUrl('http://localhost:6006?screenshots', 'iframe.html?foo=bar')).toEqual(
      'http://localhost:6006/iframe.html?foo=bar&screenshots',
    );
  });

  it('appends iframe URL with no search part to connection URL with a search part', () => {
    expect(completeIframeUrl('http://localhost:6006?screenshots', 'iframe.html')).toEqual(
      'http://localhost:6006/iframe.html?screenshots',
    );
  });

  it('appends iframe URL to connection URL with a hash part', () => {
    expect(completeIframeUrl('http://localhost:6006#screenshot', 'iframe.html')).toEqual(
      'http://localhost:6006/iframe.html#screenshot',
    );
  });

  it('appends iframe URL to connection URL with search and hash parts', () => {
    expect(completeIframeUrl('http://localhost:6006?foo=bar#screenshot', 'iframe.html')).toEqual(
      'http://localhost:6006/iframe.html?foo=bar#screenshot',
    );
  });
});
