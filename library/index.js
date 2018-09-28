// If debug available require it.
let debug; try { debug = require(`debug`)(`hoast-transform`); } catch(error) { debug = function() {}; }
// Node modules.
const assert = require(`assert`);
// Dependency modules.
const parse = require(`planckmatch/parse`),
	match = require(`planckmatch/match`);
const jstransformer = require(`jstransformer`),
	totransformer = require(`inputformat-to-jstransformer`);

// Cached transformers.
const transformers = {};

const validateOptions = function(options) {
	if (!options) {
		return; // Since no option is required.
	}
	
	assert(
		typeof(options) === `object`,
		`hoast-transform: options must be of type object.`
	);
	if (options.options) {
		assert(
			typeof(options.options) === `object`,
			`hoast-transform: options must be of type object.`
		);
	}
	
	if (options.patternOptions) {
		assert(
			typeof(options.patternOptions) === `object`,
			`hoast-transform: patternOptions must be of type object.`
		);
		if (options.patternOptions.all) {
			assert(
				typeof(options.patternOptions.all) === `boolean`,
				`hoast-transform: patternOptions.all must be of type boolean.`
			);
		}
	}
};

/**
 * Check if expressions match with the given value.
 * @param {String} value The string to match with the expressions.
 * @param {RegExps|Array} expressions The regular expressions to match with.
 * @param {Boolean} all Whether all patterns need to match.
 */
const isMatch = function(value, expressions, all) {
	// If no expressions return early as valid.
	if (!expressions) {
		return true;
	}
	
	const result = match(value, expressions);
	
	// If results is an array.
	if (Array.isArray(result)) {
		// Check whether all or just any will result in a match, and return the outcome.
		return all ? !result.includes(false) : result.includes(true);
	}
	
	// Otherwise result is a boolean and can be returned directly.
	return result;
};

/**
 * Matches the extension to the transformer.
 * @param {String} extension The file extension.
 */
const getTransformer = function(extension) {
	// If transformer already cached return that.
	if (extension in transformers) {
		return transformers[extension];
	}
	
	// Retrieve the transformer if available.
	const transformer = totransformer(extension);
	transformers[extension] = transformer ? jstransformer(transformer) : false;
	
	// Return transformer.
	return transformers[extension];
};

/**
 * Transforms files content.
 * @param {Object} options The module options.
 */
module.exports = function(options) {
	debug(`Initializing module.`);
	
	validateOptions(options);
	debug(`Validated options.`);
	options = Object.assign({
		options: {},
		patternOptions: {}
	}, options);
	
	const mod = async function(hoast, files) {
		await Promise.all(
			// Loop through files.
			files.map(function(file) {
				return new Promise(function(resolve) {
					debug(`Processing file: '${file.path}'.`);
					
					// Check if read module has been used.
					assert(
						file.content !== null,
						`hoast-transform: No content found on file, read module needs to be called before this.`
					);
					
					// Check if file content is text.
					if (file.content.type !== `string`) {
						debug(`File content not valid for processing.`);
						return resolve();
					}
					// Check against glob patterns.
					if (!isMatch(file.path, this.expressions, options.patternOptions.all)) {
						debug(`File path not valid for processing.`);
						return resolve();
					}
					
					debug(`File is valid for processing.`);
					
					// Sperate name and extensions.
					const [name, ...extensions] = file.path.split(`.`);
					const extensionsLength = extensions.length;
					// Combine metadata and file data.
					const data = Object.assign({}, hoast.options.metadata, file.frontmatter);
					
					for (let i = 0; i < extensionsLength; i++) {
						const extension = extensions.pop();
						
						// Use given engine or retrieve transformer automatically.
						const transformer = getTransformer(extension);
						if (!transformer) {
							debug(`No valid transformer found for extension '${extension}'.`);
							extensions.push(extension);
							break;
						}
						
						// Override extension if final extension.
						if (extensions.length === 0) {
							debug(`Final extension, replacing file extension with: '${transformer.outputFormat}'.`);
							extensions.push(transformer.outputFormat);
						}
						
						// Override content.
						file.content.data = transformer.render(file.content.data, options.options, data).body;
					}
					
					// Rename file with new extension.
					file.path = [name, ...extensions].join(`.`);
					
					debug(`Rendered file.`);
					resolve();
				});
			})
		);
	};
	
	mod.before = function() {
		debug(`Running module before.`);
		
		// Parse glob patterns into regular expressions.
		if (options.patterns) {
			this.expressions = parse(options.patterns, options.patternOptions, true);
			debug(`Patterns parsed into expressions: ${this.expressions}.`);
		}
	};
	
	return mod;
};