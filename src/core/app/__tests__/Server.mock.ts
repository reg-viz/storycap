import { EventEmitter } from 'events';
import { ReadableStream, ChildProcess } from '../Server';

export class MockReadableStream extends EventEmitter implements ReadableStream {}

export class MockChildProcess extends EventEmitter implements ChildProcess {
  stdout: MockReadableStream;
  stderr: MockReadableStream;
  killed: boolean = false;

  constructor() {
    super();
    this.stdout = new MockReadableStream();
    this.stderr = new MockReadableStream();
  }

  kill(signal?: string) {
    this.killed = true;
  }
}
