# Storybook Chrome Screenshot addon

[storybook]: https://github.com/storybooks/storybook
[puppeteer]: https://github.com/GoogleChrome/puppeteer

![DEMO](https://raw.githubusercontent.com/tsuyoshiwada/storybook-chrome-screenshot/artwork/demo.gif)

> A [Storybook][storybook] addon, Save the screenshot image of your stories! via [Puppeteer][puppeteer].

`storybook-chrome-screenshot` takes a screenshot and saves it.  
It is primarily responsible for image generation necessary for Visual Testing such as `reg-viz`.




## Table of Contents

* [How it works](#how-it-works)
* [Getting Started](#getting-started)
  * [Installation](#installation)
  * [Register Addon](#register-addon)
  * [Setup your stories](#setup-your-stories)
  * [Run `storybook-chrome-screenshot` Command](#run-storybook-chrome-screenshot-command)
* [API](#api)
  * [withScreenshot(options = {})](#withscreenshotoptions--)
  * [setScreenshotOptions(options = {})](#setscreenshotoptionsoptions--)
  * [getScreenshotOptions()](#getscreenshotoptions)
* [Command Line Options](#command-line-options)
* [TODO](#todo)
* [Contibute](#contibute)
  * [Development](#development)
    * [`npm run storybook`](#npm-run-storybook)
    * [`npm run screenshot`](#npm-run-screenshot)
    * [`npm run build`](#npm-run-build)
    * [`npm run dev`](#npm-run-dev)
* [License](#license)




## How it works

`storybook-chrome-screenshot` executes [Storybook][storybook] in a child process and accesses the launched page using [Puppeteer][puppeteer]. It is a very simple mechanism.  
For that reason, you can easily shoot screenshots by simply creating a story that works with the browser.




## Getting Started

It is very easy to introduce `storybook-chrome-screenshot` in your project.



### Installation

First install `storybook-chrome-screenshot`.

```bash
$ npm install --save-dev storybook-chrome-screenshot
```

> **Note:** Please do not use globally but let it operate locally.



### Register Addon

Next, register Addon.

**.storybook/addons.js**

```javascript
// Other addons...
import 'storybook-chrome-screenshot/register';
```



### Setup your stories

Create a story with [withScreenshot](#withscreenshotoptions--).

```javascript
import React from 'react';
import { storiesOf } from '@storybook/react';
import { withScreenshot } from 'storybook-chrome-screenshot';
import Button from './Button';

storiesOf('Button', module)
  .add('with text',
    withScreenshot()(() => (
      <Button>Text</Button>
    ))
  );
```



### Run `storybook-chrome-screenshot` Command

Open `package.json` and add a `screenshot` script for run `storybook-chrome-screenshot` command.

```json
{
  "scripts": {
    "screenshot": "storybook-chrome-screenshot -p 9001 -c .storybook"
  }
}
```

> **Note:** Parameters such as ports and configuration files should match the parameters of the `Storybook` you are currently using.

After that, just run the `npm run screenshot` command, shotting a component wrapped with [withScreenshot](#withscreenshotoptions--) and save the images.

```bash
$ npm run screenshot
```



### Support for addDecorator

Or by using `addDecorator ()`, it is possible to shotting all the decorated stories.

```javascript
import { withScreenshot } from 'storybook-chrome-screenshot';

storiesOf('Button', module)
  .addDecorator(withScreenshot({
    /* ...options */
  }))
  .add('with primary', () => (
    <Button primary>Primary Button</Button>
  ))
  .add('with secondary', () => (
    <Button secondary>Secondary Button</Button>
  ));
```




## API

### withScreenshot(options = {})

Notify [Puppeteer][puppeteer] of the story wrapped in this function and let it recognize it as the target of the screenshot.

The following objects of `options` can be specified.

```javascript
{
  delay: 0,               // Delay milliseconds when shooting screenshots
  viewport: {             // Browser's viewport when shooting screenshots. (See: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagesetviewportviewport)
    width: 1024,
    height: 768,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    isLandscape: false,
  },
}
```


### setScreenshotOptions(options = {})

Sets the default value of the option used with `withScreenshot()`.  
It is useful for changing Viewport of all stories.

**Example: .storybook/config.js**

```javascript
import { setScreenshotOptions } from 'storybook-chrome-screenshot';

setScreenshotOptions({
  viewport: {
    width: 768,
    height: 400,
    deviceScaleFactor: 2,
  },
});
```


### getScreenshotOptions()

Get the current option used with `withScreenshot()`.

```javascript
import { getScreenshotOptions } from 'storybook-chrome-screenshot';

console.log(getScreenshotOptions);
// => Current options...
```




## Command Line Options

```bash
$ $(npm bin)/storybook-chrome-screenshot --help

  Usage: storybook-chrome-screenshot [options]


  Options:

    -V, --version                 output the version number
    -p, --port [number]           Storybook server port (Default 9001)
    -h, --host [string]           Storybook server host (Default "localhost")
    -s, --static-dir <dir-names>  Directory where to load static files from
    -c, --config-dir [dir-name]   Directory where to load Storybook configurations from (Default ".storybook")
    -o, --output-dir [dir-name]   Directory where screenshot images are saved (Default "__screenshots__")
    --browser-timeout [number]    Timeout milliseconds when Puppeteer opens Storybook. (Default 30000)
    --silent                      Suppress standard output
    --debug                       Enable debug mode.
    -h, --help                    output usage information
```




## TODO

The following tasks remain. Contributes are welcome :smiley:

* [x] Global Options.
* [ ] Shooting at an arbitrary timing.
* [ ] Support for [Vue.js](https://github.com/vuejs/vue).




## Contibute

1. Fork it!
1. Create your feature branch: `git checkout -b my-new-feature`
1. Commit your changes: `git commit -am 'Add some feature'`
1. Push to the branch: `git push origin my-new-feature`
1. Submit a pull request :muscle:

Bugs, feature requests and comments are more than welcome in the [issues](https://github.com/tsuyoshiwada/storybook-chrome-screenshot/issues).



### Development

We will develop using the following npm scripts.


#### `npm run storybook`

Launch the stories in the `example` directory.  
You can access [Storybook][storybook] by opening http://localhost:9001 in your browser.


#### `npm run screenshot`

Shotting a story in the `example` directory and save it in the` __screenshots__` directory.


#### `npm run build`

Transpile the source code of the `src` directory using [babel](https://github.com/babel/babel).


#### `npm run dev`

It monitors the source code in the `src` directory and transpiles it if there is a change.



## License

[MIT © tsuyoshiwada](./LICENSE)

