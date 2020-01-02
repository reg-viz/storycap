import fs from 'fs';
import path from 'path';
import * as mkdirp from 'mkdirp';
import { MainOptions } from './types';
import sanitize from 'sanitize-filename';

export class FileSystem {
  constructor(private opt: MainOptions) {}

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
  save(kind: string, story: string, suffix: string[], buffer: Buffer) {
    const name = this.opt.flat
      ? sanitize((kind + '_' + story).replace(/\//g, '_'))
      : kind
          .split('/')
          .map(k => sanitize(k))
          .join('/') +
        '/' +
        sanitize(story);
    const filePath = path.join(this.opt.outDir, name + (suffix.length ? `_${suffix.join('_')}` : '') + '.png');
    return new Promise<string>((resolve, reject) => {
      mkdirp.sync(path.dirname(filePath));
      fs.writeFile(filePath, buffer, err => {
        if (err) reject(err);
        resolve(filePath);
      });
    });
  }
}
