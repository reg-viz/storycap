import type { Viewport } from 'puppeteer-core';

/**
 *
 * Device name and viewport information
 *
 **/
export interface DeviceDescriptor {
  name: string;
  viewport: Viewport;
}

/**
 *
 * @returns Device descriptors
 *
 */
export function getDeviceDescriptors(): DeviceDescriptor[] {
  const puppeteer = require('puppeteer-core') as {
    KnownDevices?: Record<string, { viewport: Viewport }>;
    devices?: Record<string, { viewport: Viewport }>;
  };
  // Older Puppeteer versions expose the descriptors as `devices`.
  const devices = puppeteer.KnownDevices ?? puppeteer.devices!;
  return Object.entries(devices).map(([name, device]) => ({ name, viewport: device.viewport }));
}
