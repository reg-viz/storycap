import type { Viewport } from 'puppeteer-core';

/**
 *
 * @returns Puppeteer device discriptors
 *
 */
export function getDeviceDescriptors() {
  const pc = require('puppeteer-core');
  const dd = (pc.KnownDevices || pc.devices) as Record<string, { name: string; viewport: Viewport }>;
  return Object.values(dd);
}
