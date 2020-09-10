/**
 *
 * @returns Whether current process runs in Storycap browser.
 *
 **/
export function isScreenshot() {
  return !!(window as any).emitCapture;
}
