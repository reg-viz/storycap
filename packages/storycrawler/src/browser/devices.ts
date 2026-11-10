import { KnownDevices, type Viewport } from 'puppeteer-core';

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
  return Object.entries(KnownDevices).map(([name, device]) => ({ name, viewport: device.viewport }));
}
