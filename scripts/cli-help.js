#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const mark = '```';

const readme = fs.readFileSync(path.join(import.meta.dirname, '../README.md'), 'utf8');

const [head, tmp] = readme.split('<!-- inject:clihelp -->');
const [_, tail] = tmp.split('<!-- endinject -->');

const help = execSync('node packages/storycap/lib/node/cli.js --help').toString();
const out = `${head}<!-- inject:clihelp -->
${mark}txt
${help}
${mark}
<!-- endinject -->${tail}`;

fs.writeFileSync(path.join(import.meta.dirname, '../README.md'), out, 'utf8');
