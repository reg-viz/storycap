/**
 *
 * @returns Puppeteer device discriptors
 *
 */
export async function getDeviceDescriptors() {
  const { default: pc } = await import('puppeteer-core')
  const dd = pc.devices;
  return Object.values(dd);
}
