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

