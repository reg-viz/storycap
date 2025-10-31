/**
 *
 * @returns Whether current process runs in Storycap browser.
 *
 **/
export function isScreenshot() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(window as any).emitCapture;
}
