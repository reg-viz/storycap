declare module "wait-on" {
  type Opt = {
    resources: string[],
    delay?: number;
    interval?: number;
    timeout?: number;
    window?: number;
  };
  function waitOn(opt: Opt, cb: (err: any) => void): void;
  export = waitOn;
}
