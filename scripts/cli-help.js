#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const mark = "```";

const readme = fs.readFileSync(path.join(__dirname, "../README.md"), "utf8");

const [head, tmp] = readme.split("<!-- inject:clihelp -->");
const [_, tail] = tmp.split("<!-- endinject -->");

const help = execSync("node lib/node/cli.js --help");
const out = `${head}<!-- inject:clihelp -->
${mark}txt
${help}
${mark}
<!-- endinject -->${tail}`;

fs.writeFileSync(path.join(__dirname, "../README.md"), out, "utf8");
