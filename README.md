# Fancy Logger
> A no brainer fancy logger used by AdonisJs

[![npm-image]][npm-url] ![][typescript-image] [![license-image]][license-url]

AdonisJs has various command line utilities including [ace](https://github.com/adonisjs/ace). (A framework to create CLI applications). We make use of this module to make sure that all parts of the framework output logs with consistent formatting.

A big thanks to the creator of [signale](https://github.com/klaussinani/signale) for being an inspiration for this module.

We didn't used signale coz of following reasons:

1. AdonisJs uses kleur for colorizing strings and signale uses chalk. We want to avoid loading many color libraries.
2. Signale is beyond static logging and we don't need all those those features.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of contents

- [Usage](#usage)
- [API Docs](#api-docs)
- [Maintainers](#maintainers)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usage
Install the package from npm registry as follows:

```sh
npm i @poppinss/fancy-logs

# yarn
yarn add @poppinss/fancy-logs
```

and use it as follows

```ts
import fancyLogger from '@poppinss/fancy-logs'

fancyLogger.success('Operation successful')
fancyLogger.info('Hello from L59')
fancyLogger.pending('Write release notes for %s', '1.2.0')
fancyLogger.fatal(new Error('Unable to acquire lock'))
fancyLogger.watch('Recursively watching build directory...')
fancyLogger.complete({
  prefix: '[task]',
  message: 'Fix issue #59',
})
```

![](./fancy-logs.png)

## API Docs
Following are the autogenerated files via Typedoc

* [API](docs/README.md)

## Maintainers
[Harminder virk](https://github.com/thetutlage)

[npm-image]: https://img.shields.io/npm/v/@poppinss/chokidar-ts.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/@poppinss/chokidar-ts "npm"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript

[license-url]: LICENSE.md
[license-image]: https://img.shields.io/aur/license/pac.svg?style=for-the-badge
