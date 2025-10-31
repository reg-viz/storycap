#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import markdownToc from 'markdown-toc';

function addToc(markdownFilename) {
  const content = fs.readFileSync(path.join(import.meta.dirname, '..', markdownFilename), 'utf8');
  const contentWithToc = markdownToc.insert(content);
  fs.writeFileSync(path.join(import.meta.dirname, '..', markdownFilename), contentWithToc, 'utf8');
}

['README.md', 'MIGRATION.md', 'CONTRIBUTING.md', 'packages/storycrawler/README.md'].forEach(addToc);
