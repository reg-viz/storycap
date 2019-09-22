import { EventEmitter } from 'events';
import { ChildProcess, ReadableStream } from '../Server';

export class MockReadableStream extends EventEmitter implements ReadableStream {}

export class MockChildProcess extends EventEmitter implements ChildProcess {
  public stdout: MockReadableStream;
  public stderr: MockReadableStream;
  public killed: boolean = false;

  public constructor() {
    super();
    this.stdout = new MockReadableStream();
    this.stderr = new MockReadableStream();
  }

  public kill(_signal?: string) {
    this.killed = true;
  }
}
