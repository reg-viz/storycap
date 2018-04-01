[api]: https://github.com/tsuyoshiwada/storybook-chrome-screenshot/tree/develop#api
[#1]: https://github.com/tsuyoshiwada/storybook-chrome-screenshot/issues/1
[#3]: https://github.com/tsuyoshiwada/storybook-chrome-screenshot/issues/3
[#4]: https://github.com/tsuyoshiwada/storybook-chrome-screenshot/issues/4
[#5]: https://github.com/tsuyoshiwada/storybook-chrome-screenshot/issues/5
[#6]: https://github.com/tsuyoshiwada/storybook-chrome-screenshot/issues/6
[#7]: https://github.com/tsuyoshiwada/storybook-chrome-screenshot/issues/7
[#8]: https://github.com/tsuyoshiwada/storybook-chrome-screenshot/issues/8
[#9]: https://github.com/tsuyoshiwada/storybook-chrome-screenshot/issues/9
[#10]: https://github.com/tsuyoshiwada/storybook-chrome-screenshot/issues/10
[#12]: https://github.com/tsuyoshiwada/storybook-chrome-screenshot/issues/12
[#14]: https://github.com/tsuyoshiwada/storybook-chrome-screenshot/issues/14
[#22]: https://github.com/tsuyoshiwada/storybook-chrome-screenshot/issues/22
[#24]: https://github.com/tsuyoshiwada/storybook-chrome-screenshot/issues/24
[#34]: https://github.com/tsuyoshiwada/storybook-chrome-screenshot/pull/34
[#35]: https://github.com/tsuyoshiwada/storybook-chrome-screenshot/pull/35


## 1.1.0

> 0000-00-00

### New features

* Support for Knobs integration :tada:  ([#35][#35])
    - [@jessepinho](https://github.com/jessepinho), Thank you for feature proposal !!
    - **NOTE:** Angular is unsupported until Issue [here](https://github.com/storybooks/storybook/issues/3042) is resolved.
    - Knobs integration frameworks
        + React
        + Vue.js

### Minor changes

* Parallelize shooting of chunked Stories.
* Update dependencies & devDependencies.


## 1.0.1

> 2018-03-14

### Minor changes

* Log when something is wrong. (Thanks [@kogai](https://github.com/kogai) !!)


## 1.0.0

> 2018-01-11

First major release :tada:

### New features

* Support for Vue.js :tada: :tada:

### Breaking changes

* Change interface of `initScreenshot()`.
    - Changed to function execution in order to avoid destructive change when it came to receive options as with withScreenshot in the future.

### Minor changes

* Change output format capture in CI environment.


## 0.10.0

> 2018-01-07

### Minor changes

* Switch to TypeScript from Babel.
* Update dependencies & devDependencies.
* package structure.
    - Refactoring.
    - It is easy to deal with various frameworks.
    - We plan support to Vue.js in the future.
* Add unit testing.
* Add E2E testing. [#24][#24] Thank you [@Quramy](https://github.com/Quramy) !!
* Fix document.
* Update output format.


## 0.9.0

> 2018-01-03

### Bugfix

* Fix puppeteer launch on Linux based CI. Thank you [@Quramy](https://github.com/Quramy) !!


## 0.9.0

> 2018-01-03

* Angular Support :tada:  Thank you [@Quramy](https://github.com/Quramy) !


## 0.8.2

> 2017-12-29

### Bugfix

* Fix crash bug with storybook v3.3.x


## 0.8.1

> 2017-12-22

### Bugfix

* Broken storybook ... [#12][#12]
    - Revert feature `module` in package.json.


## 0.8.0

> 2017-12-10

### New features

* Add `initScreenshot` API. [#14][#14]

### Bugfix

* Fix capturing process in the big projects [#14][#14], [#10][#10]

### Big thanks

* [@alexeybondarenko](https://github.com/alexeybondarenko)


## 0.7.0

> 2017-12-06

### New features

* Add module entry to `package.json`. ([#12][#12]) 
    - Thank you [@marcobiedermann](https://github.com/marcobiedermann) !


## 0.6.1

> 2017-10-18

### Bugfix

* Fixed a bug that screenshot was not taken when using `addDecorator`. ([#10][#10])


## 0.6.0

> 2017-09-28

### New features

* Add parallel CLI options. ([#7][#7])
    - `--parallel`
    - By launching multiple Page instances of Puppeteer, you can expect a slight improvement in performance.
* Add injection scripts CLI options. ([#8][#8])
    - `--inject-files`
    - You can now inject any script you like when shooting screenshots.

### Minor changes

* Add source maps to production build. ([#9][#9])


## 0.5.0

> 2017-09-10

### New features

* Add filter CLI options. ([#4][#4])
    - `--filter-kind`
    - `--filter-story`
    - Use RegExp to narrow down the stories to shoot.
* Add support for multiple viewport. ([#5][#5])
    - Allowed `array` as the value of `viewport`.

### Minor changes

* Add error report when using addDecorator illegally. ([#6][#6])

### Bugfix

* Shooting stops when `isMobile` or` hasTouch` is specified.

### Big thanks

* [@gcazaciuc](https://github.com/gcazaciuc)


## 0.4.0

> 2017-09-04

### New features

* Add support for `addDecorator()`. ([#3][#3])  
  Thanks for [@gcazaciuc](https://github.com/gcazaciuc).


## 0.3.0

> 2017-09-03

### New features

* Add `--debug` CLI options.
  - In debug mode, browser console, stdsrr, contents being processed are output.


## 0.2.0

> 2017-08-31

### New features

* Add `--browser-timeout` CLI Options. ([#1][#1])  
  Thanks for [@gcazaciuc](https://github.com/gcazaciuc).

### Bugfix

* Fix bug that processes will remain when an error occurs. ([#1][#1])


## 0.1.0

> 2017-08-29

### New features

* Add `setScreenshotOptions()`.
* Add `getScreenshotOptions()`.
* Please refer to the [docs][api] for details.


## 0.0.1

> 2017-08-25

First release :tada:

