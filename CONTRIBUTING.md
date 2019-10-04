# Contribution

<!-- toc -->

- [Setup](#setup)
- [E2E testing](#e2e-testing)
  - [All storybook versions](#all-storybook-versions)
  - [Single storybook](#single-storybook)

<!-- tocstop -->

## Setup

- Clone this repository
- `yarn --pure-lockfile`

## E2E testing

### All storybook versions

```sh
$ ./e2e.sh
```

When the command exit successfully, check `__screenshots__` dir. There should be captured PNG files.

### Single storybook

And `e2e.sh` also accepts a specific storybook example's name. For example:

```sh
$ ./e2e.sh examples/v4-simple
```
