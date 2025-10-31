/**
 *
 * @returns Puppeteer device discriptors
 *
 */
export async function getDeviceDescriptors() {
  const pc = await import('puppeteer-core')
  const dd = pc.KnownDevices;
  return Object.values(dd);
}
