// If debug available require it.
let debug; try { debug = require(`debug`)(`hoast-transform`); } catch(error) { debug = function() {}; }
// Dependency modules.
const jstransformer = require(`jstransformer`),
	totransformer = require(`inputformat-to-jstransformer`);

// Cached transformers.
const transformers = {};

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
					if (file.content === null) {
						debug(`File content not set, read module needs to be called before this.`);
						return;
					}
					
					// Check if file content is text.
					if (file.content.type !== `string`) {
						debug(`File content not valid for processing.`);
						return resolve();
					}
					// Check against glob patterns.
					if (!hoast.helpers.matchExpressions(file.path, this.expressions, options.patternOptions.all)) {
						debug(`File path not valid for processing.`);
						return resolve();
					}
					
					debug(`File is valid for processing.`);
					
					// Separate name and extensions.
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
	
	mod.before = function(hoast) {
		// Parse glob patterns into regular expressions.
		if (options.patterns) {
			this.expressions = hoast.helpers.parsePatterns(options.patterns, options.patternOptions, true);
			debug(`Patterns parsed into expressions: ${this.expressions}.`);
		}
	};
	
	return mod;
};