#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import copyDir from 'copy-dir';
import { rimraf } from 'rimraf';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));

/**
 * This script sets up for Storybook examples.
 *
 * Because of Storybook addon channel restriction, storycap addon(client, e.g. register.js) code
 * should be put under each Storybook project's node_modules directory.
 *
 * This script does:
 *
 * - emulate to `npm i storycap` under the Storybook example project
 *   - copy package.json
 *   - copy built javascripts
 *   - create symlink .bin/storycap
 *
 */
async function main() {
  const { _ } = argv;
  const target = _[0];
  if (!target) {
    console.log(`Usage:\n\t${process.argv[1]} directory`);
    return 0;
  }
  const prjDir = path.resolve(import.meta.dirname, '../packages/storycap');
  const cwd = process.cwd();
  const dist = path.resolve(cwd, target, 'node_modules/storycap');
  if (prjDir === dist) {
    console.error(`target dir shold not be "${prjDir}".`);
    return 1;
  }
  rimraf.sync(dist);
  fs.mkdirSync(dist, { recursive: true });
  copyDir.sync(`${path.join(prjDir, 'lib')}`, path.join(dist, 'lib'), {});
  copyDir.sync(`${path.join(prjDir, 'lib-esm')}`, path.join(dist, 'lib-esm'), {});
  fs.copyFileSync(path.resolve(prjDir, 'package.json'), path.resolve(dist, 'package.json'));
  fs.copyFileSync(path.resolve(prjDir, 'register.js'), path.resolve(dist, 'register.js'));
  rimraf.sync(path.resolve(dist, '../.bin/storycap'));
  fs.mkdirSync(path.resolve(dist, '../.bin'), { recursive: true });
  fs.symlinkSync(path.resolve(prjDir, 'lib/node/cli.js'), path.resolve(dist, '../.bin/storycap'));
  fs.chmodSync(path.resolve(dist, '../.bin/storycap'), 0o775);
  return 0;
}

main()
  .then(code => process.exit(code))
  .catch(err => console.error(err));
