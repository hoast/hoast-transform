<div align="center">
  
  [![npm package @latest](https://img.shields.io/npm/v/hoast-transform.svg?label=npm@latest&style=flat-square&maxAge=3600)](https://npmjs.com/package/hoast-transform)
  [![npm package @next](https://img.shields.io/npm/v/hoast-transform/next.svg?label=npm@next&style=flat-square&maxAge=3600)](https://npmjs.com/package/hoast-transform/v/next)
  
  [![Travis-ci status](https://img.shields.io/travis-ci/hoast/hoast-transform.svg?branch=master&label=test%20status&style=flat-square&maxAge=3600)](https://travis-ci.org/hoast/hoast-transform)
  [![CodeCov coverage](https://img.shields.io/codecov/c/github/hoast/hoast-transform/master.svg?label=test%20coverage&style=flat-square&maxAge=3600)](https://codecov.io/gh/hoast/hoast-transform)
  
  [![License agreement](https://img.shields.io/github/license/hoast/hoast-transform.svg?style=flat-square&maxAge=86400)](https://github.com/hoast/hoast-transform/blob/master/LICENSE)
  [![Open issues on GitHub](https://img.shields.io/github/issues/hoast/hoast-transform.svg?style=flat-square&maxAge=86400)](https://github.com/hoast/hoast-transform/issues)
  
</div>

# hoast-transform

Transform the content of files based on the extension.

> As the name suggest this is a [hoast](https://github.com/hoast/hoast#readme) module. The module has been based of [metalsmith-in-place](https://github.com/metalsmith/metalsmith-in-place#readme).

## Usage

Install [hoast-transform](https://npmjs.com/package/hoast-transform) using [npm](https://npmjs.com).

```
$ npm install hoast-transform
```

### Parameters

* `options`: Options given to the [JSTransformer](https://github.com/jstransformers/jstransformer#readme).
  * Type: `Object`
	* Default: `{}`
* `patterns`: Glob patterns to match file paths with. If the engine function is set it will only give the function any files matching the pattern.
  * Type: `String` or `Array of strings`
	* Required: `no`
* `patternOptions`: Options for the glob pattern matching. See [planckmatch options](https://github.com/redkenrok/node-planckmatch#options) for more details on the pattern options.
  * Type: `Object`
  * Default: `{}`
* `patternOptions.all`: This options is added to `patternOptions`, and determines whether all patterns need to match instead of only one.
  * Type: `Boolean`
  * Default: `false`

### Example

**CLI**

```json
{
  "modules": {
    "read": {},
    "hoast-transform": {
      "patterns": "*.md"
 	  }
  }
}
```

**Script**

```javascript
const Hoast = require(`hoast`);
const read = Hoast.read,
      transform = require(`hoast-transform`);

Hoast(__dirname)
  .use(read())
  .use(transform({
    patterns: `*.md`
  }))
  .process();
```

> In the examples the markdown files will be transformed to HTML.

## Troubleshooting

If you are having problems with the module please [enable debugging](https://github.com/hoast/hoast#debugging) to have a closer look.

**File not valid for processing.**
* The file is not utf-8 encoded.
* The file path does not match any of the patterns.

**No valid transformer found for extension <extension>.**
* Check if the JSTransformer associated with the extension is installed.