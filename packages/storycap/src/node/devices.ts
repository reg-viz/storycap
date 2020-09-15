import type { Viewport } from 'puppeteer-core';

/**
 *
 * @returns Puppeteer device discriptors
 *
 */
export function getDeviceDescriptors() {
  const dd = require('puppeteer-core').devices as Record<string, { name: string; viewport: Viewport }>;
  return Object.values(dd);
}
