<div style="text-align: center;">
  <a title="Version master branch" href="https://github.com/hoast/hoast-transform#readme" target="_blank" rel="noopener">
    <img src="https://img.shields.io/github/package-json/v/hoast/hoast-transform.svg?label=master&style=flat-square"/>
  </a>
  <a title="Version npm package" href="https://npmjs.com/package/hoast-transform" target="_blank" rel="noopener">
    <img src="https://img.shields.io/npm/v/hoast-transform.svg?label=npm&style=flat-square"/>
  </a>
  <a title="License agreement" href="https://github.com/hoast/hoast-transform/blob/master/LICENSE" target="_blank" rel="noopener">
    <img src="https://img.shields.io/github/license/hoast/hoast-transform.svg?style=flat-square"/>
  </a>
  <a title="Travis-ci build statis" href="https://travis-ci.org/hoast/hoast-transform" target="_blank" rel="noopener">
    <img src="https://img.shields.io/travis-ci/hoast/hoast-transform.svg?branch=master&style=flat-square"/>
  </a>
  <a title="Open issues on GitHub" href="https://github.com/hoast/hoast-transform/issues" target="_blank" rel="noopener">
    <img src="https://img.shields.io/github/issues/hoast/hoast-transform.svg?style=flat-square"/>
  </a>
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

* `options` **{{Object}}**: Options given to the [JSTransformer](https://github.com/jstransformers/jstransformer#readme).
	* Default: `{}`
* `patterns` **{Array|strings}**: A string or an array of strings which gets used to match files using glob patterns. See [nanomatch](https://github.com/micromatch/nanomatch#readme) for more details on the patterns.
	* Required: `no`

### Example

**CLI**

```json
{
  "modules": {
    "read": {},
    "hoast-transform": {
      "patterns": "**/*.md"
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
    patterns: `**/*.md`
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

## License

[ISC license](https://github.com/hoast/hoast-transform/blob/master/LICENSE)