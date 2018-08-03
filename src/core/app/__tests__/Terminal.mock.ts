import { Writer } from '../../../models/terminal';
import { Terminal } from '../Terminal';

export class MockWriter implements Writer {
  public list: string[] = [];

  public write(msg: string) {
    this.list.push(msg);

    return true;
  }

  public clear() {
    this.list = [];
  }
}

export const factory = (silent: boolean, debug: boolean, ciMode: boolean = false) => {
  const stdout = new MockWriter();
  const stderr = new MockWriter();

  return {
    stdout,
    stderr,
    term: new Terminal(stdout, stderr, silent, debug, ciMode),
    clear: () => {
      stdout.clear();
      stderr.clear();
    }
  };
};
