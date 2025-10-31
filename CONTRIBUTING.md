# Contribution

<!-- toc -->

- [Directory structure](#directory-structure)
- [Setup](#setup)
- [Lint and format](#lint-and-format)
- [Build](#build)
  - [Build all packages](#build-all-packages)
  - [Build a specific package](#build-a-specific-package)
- [Unit test](#unit-test)
  - [Test all packages](#test-all-packages)
  - [Test a specific package](#test-a-specific-package)
- [E2E test](#e2e-test)
  - [All Storybook versions](#all-storybook-versions)
  - [Single Storybook](#single-storybook)
- [Update documents' ToC and CLI usage section](#update-documents-toc-and-cli-usage-section)

<!-- tocstop -->

## Directory structure

This repository adopts mono-repo structure using Lerna.

Each package has the following role:

- `packages/storycap` : Contains Storycap's main application source code. This packages has a responsibility for capturing screenshots and depends on `storycrawler`.
- `packages/storycrawler` : Contains basic utilities source to build a crawler for Storybook. This package should have functions to connect Storybook, launch Puppeteer processes, and manage parallel asynchronous tasks.

## Setup

Clone this repository and execute the following:

```sh
$ yarn --frozen-lockfile
```

## Lint and format

```sh
$ yarn lint     # runs eslint
$ yarn format   # runs prettier --write
```

## Build

### Build all packages

```sh
$ yarn build
```

### Build a specific package

```sh
$ cd packages/<package-name>
$ yarn build
# or
$ yarn run tsc -p tsconfig.build.json
```

## Unit test

### Test all packages

```sh
$ yarn test
```

### Test a specific package

```sh
$ cd packages/<package-name>
$ yarn test
# or
$ yarn run jest
```

## E2E test

### All Storybook versions

```sh
$ ./e2e.sh
```

When the command exit successfully, check `__screenshots__` dir. There should be captured PNG files.

### Single Storybook

And `e2e.sh` also accepts a specific storybook example's name. For example:

```sh
$ ./e2e.sh examples/v4-simple
```

## Update documents' ToC and CLI usage section

We insert ToC and CLI usage section to some Markdown files(e.g. README.md) using script. If you touch `*.md` files or add an option to CLI, please exec the following command when you stage the changes:

```sh
$ yarn doc
```
