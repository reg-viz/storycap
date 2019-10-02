# Migration

## From storybook-chrome-screenshot 1.x to storycap

## From zisui 1.x to storycap

### Simple mode

You should only change CLI name :smile:

```sh
# Before

$ zisui http://your.storybook.com
```

```sh
# After

$ storycap http://your.storybook.com
```

All CLI options of _zisui_ are available with storycap.

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

And You should edit `.storybook/config.js`:

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

And storycap accepts [SB's global parameters notation](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#options-addon-deprecated), so you can configure as the following too:

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
