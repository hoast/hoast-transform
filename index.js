// Node modules.
const assert = require('assert');
// Dependency modules.
const jstransformer = require('jstransformer'),
	  nanomatch = require('nanomatch'),
	  totransformer = require('inputformat-to-jstransformer');
// If debug available require it.
let debug; try { debug = require('debug')('hoast-transform'); } catch(error) { debug = function() {}; }

// Cached transformers.
const transformers = {};

/**
 * Matches the extension to the transformer.
 * @param {String} extension The file extension.
 */
const getTransformer = function(extension) {
	// If transformer already cached return that.
	if (extension in transformers) {
		return transformers[clear];
	}
	
	// Retrieve the transformer if available.
	const transformer = totransformer(extension);
	transformers[extension] = transformer ? jstransformer(transformer) : false;
	
	// Return transformer.
	return transformers[extension];
};

const validateOptions = function(options) {
	assert(typeof(options) === 'object', 'hoast.transform: options must be of type object.');
	if (options.options) {
		assert(typeof(options.options) === 'object', 'hoast-transform: options must be of type object.');
	}
	if (options.patterns) {
		assert(Array.isArray(options.patterns)  && options.patterns.length, 'hoast-transform: patterns needs must be specified and an array of strings.');
	}
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
		patterns: []
	}, options);
	
	return async function(hoast, files) {
		await Promise.all(
			// Loop through files.
			files.map(function(file) {
				return new Promise(function(resolve) {
					debug(`Processing file: '${file.path}'.`);
					
					assert(file.content !== null, 'hoast-transform: No content found on file, read module needs to be called before this.');
					// Has to be a string and patterns if specified.
					if (file.content.type !== 'string' || (options.patterns.length > 0 && !nanomatch.any(file.path, options.patterns))) {
						debug(`File not valid for processing.`);
						return resolve();
					}
					debug(`File content is valid.`);
					
					// Sperate name and extensions.
					const [name, ...extensions] = file.path.split('.');
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
					file.path = [name, ...extensions].join('.');
					
					debug(`Rendered file.`);
					resolve();
				})
			})
		);
	};
};