import fs from 'fs/promises';
import path from 'path';
import { MainOptions } from './types.js';
import sanitize from 'sanitize-filename';

export class FileSystem {
  constructor(private opt: MainOptions) {}

  private getPath(kind: string, story: string, suffix: string[], extension: string) {
    const name = this.opt.flat
      ? sanitize((kind + '_' + story).replace(/\//g, '_'))
      : kind
          .split('/')
          .map(k => sanitize(k))
          .join('/') +
        '/' +
        sanitize(story);
    const filePath = path.join(this.opt.outDir, name + (suffix.length ? `_${suffix.join('_')}` : '') + extension);

    return filePath;
  }

  /**
   *
   * Save captured buffer as a PNG image.
   *
   * @param kind - Story kind
   * @param story - Name of this story
   * @param suffix - File name suffix
   * @param buffer - PNG image buffer to save
   * @returns Absolute file path
   *
   **/
  async saveScreenshot(kind: string, story: string, suffix: string[], buffer: Buffer) {
    const filePath = this.getPath(kind, story, suffix, '.png');

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);

    return filePath;
  }

  /**
   *
   * Save captured tracing buffer as a json file.
   *
   * @param kind - Story kind
   * @param story - Name of this story
   * @param suffix - File name suffix
   * @param buffer - PNG image buffer to save
   * @returns Absolute file path
   *
   **/
  async saveTrace(kind: string, story: string, suffix: string[], buffer: Buffer) {
    const filePath = this.getPath(kind, story, [...suffix, 'trace'], '.json');

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);

    return filePath;
  }
}
