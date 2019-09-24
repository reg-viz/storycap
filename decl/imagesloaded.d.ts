// Note
// @types/imagesloaded dependes on jQuery.d.ts and TypeScript@^3.6 throw compilation error for jQuery.d.ts, so we monkey-patched this declaration.
declare module "imagesloaded" {
  function imagesloaded(elm: Element, cb: Function): void;
  export default imagesloaded;
}
