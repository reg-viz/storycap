# Migration

<!-- toc -->

- [From storybook-chrome-screenshot 1.x to storycap](#from-storybook-chrome-screenshot-1x-to-storycap)
  - [Replace dependency](#replace-dependency)
  - [Replace decorators](#replace-decorators)
  - [Move global options from `setScreentshotOptions` to `withScreenshot`](#move-global-options-from-setscreentshotoptions-to-withscreenshot)
  - [Modify screenshot options](#modify-screenshot-options)
  - [CLI usage](#cli-usage)
  - [CLI options](#cli-options)
  - [Other deprecated features](#other-deprecated-features)
- [From zisui 1.x to storycap](#from-zisui-1x-to-storycap)
  - [Replace dependency](#replace-dependency-1)
  - [Simple mode](#simple-mode)
  - [Managed mode for React](#managed-mode-for-react)

<!-- tocstop -->

## From storybook-chrome-screenshot 1.x to storycap

### Replace dependency

```sh
$ npm uninstall storybook-chrome-screenshot
$ npm install storycap
```

And edit SB addons installation:

```js
/* .storybook/addons.js */

//import 'storybook-chrome-screenshot/register';
import 'storycap/register';
```

### Replace decorators

`initScreenshot` decorator is already deleted so you should remove it from your SB configuration.

```js
/* Before */
/* .storybook/config.js */

import { addDecorator } from '@storybook/react';
import { initScreenshot, withScreenshot } from 'storybook-chrome-screenshot';

addDecorator(initScreenshot());
addDecorator(
  withScreenshot({
    /* Some options... */
  }),
);
```

```js
/* After */
/* .storybook/config.js */

import { addDecorator } from '@storybook/react';
import { withScreenshot } from 'storycap';

addDecorator(
  withScreenshot({
    /* Some options... */
  }),
);
```

You should replace import path if you configure screenshot behavior in each story:

```js
import React from 'react';
import { storiesOf } from '@storybook/react';
// import { withScreenshot } from 'storybook-chrome-screenshot';
import { withScreenshot } from 'storycap'; // <-
import { Button } from './Button';

storiesOf('Button', module)
  .addDecorator(withScreenshot())
  .add('with default style', () => <Button>Default</Button>);
```

### Move global options from `setScreentshotOptions` to `withScreenshot`

SCS's `setScreentshotOptions` API is already deleted. Use `withScreenshot` instead of it.

```js
/* Before */
/* .storybook/config.js */
import { setScreenshotOptions } from 'storybook-chrome-screenshot';

setScreenshotOptions({
  viewport: {
    width: 768,
    height: 400,
    deviceScaleFactor: 2,
  },
});
```

```js
/* After */
/* .storybook/config.js */
import { addDecorator } from '@storybook/react';
import { withScreenshot } from 'storycap';

addDecorator(
  withScreenshot({
    viewport: {
      width: 768,
      height: 400,
      deviceScaleFactor: 2,
    },
  }),
);
```

### Modify screenshot options

Some fields of the argument of `withScreenshot` are deprecated.

- `namespace` field is deleted. If you want to add suffix to eace story, use `defaultVariantSuffix`
- `filePattern` field is deleted
- `viewport` field can't accepts `Array`. If you want set multiple viewports, use `viewports` field or `--viewport` CLI option

### CLI usage

storycap CLI accepts only Storybook's URL and you can boot local Storybook server with `--serverCmd` option.

```sh
# Before
$ storybook-chrome-screenshot -p 8080 -h localhost -s ./public
```

```sh
# After
$ storycap http://localhost:8080 --serverCmd "start-storybook -p 8080 -h localhost -s ./public"
```

### CLI options

Some CLI options of storybook-chrome-screenshot are deprecated.

- `--browser-timeout`: Use `--serverTimeout` instead of it
- `--filter-kind`, `--filter-story`: Use `--include` instead of them

### Other deprecated features

We dropped supporting knobs. You can write story with corresponding properties if you want to capture overwriting stories' props.

## From zisui 1.x to storycap

### Replace dependency

```sh
$ npm uninstall zisui
$ npm install storycap
```

### Simple mode

All you need is change CLI name :smile:

```sh
# Before

$ zisui http://your.storybook.com
```

```sh
# After

$ storycap http://your.storybook.com
```

All CLI options of _zisui_ are available with Storycap.

### Managed mode for React

You had the following if you use zisui managed mode.

```js
/* .storybook/addons.js */

import 'zisui/register';
```

You should replace it:

```js
/* .storybook/addons.js */

import 'storycap/register';
```

And you should edit `.storybook/config.js`:

```js
/* .storybook/config.js */

import { addDecorator } from '@storybook/react';
import { withScreenshot } from 'zisui';

addDecorator(withScreenshot({
  // Some screenshot options...
});
```

You should replace it as the following:

```js
/* .storybook/config.js */

import { addDecorator } from '@storybook/react';
import { withScreenshot } from 'storycap';

addDecorator(withScreenshot({
  // Some screenshot options...
});
```

**Remarks**: Storycap accepts [Storybook's global parameters notation](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#options-addon-deprecated), so `addParameters` is recommended if you use Storybook v5.0 or later:

```js
/* .storybook/config.js */

import { addDecorator, addParameters } from '@storybook/react';
import { withScreenshot } from 'storycap';

addDecorator(withScreenshot);
addParameters({
  screenshot: {
    // Some screenshot options...
  },
});
```
