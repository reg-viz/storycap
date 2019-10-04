#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const toc = require('markdown-toc');

function addToc(markdownFilename) {
  const content = fs.readFileSync(path.join(__dirname, '..', markdownFilename), 'utf8');
  const contentWithToc = toc.insert(content);
  fs.writeFileSync(path.join(__dirname, '..', markdownFilename), contentWithToc, 'utf8');
}

['README.md', 'MIGRATION.md', 'CONTRIBUTING.md'].forEach(addToc);
