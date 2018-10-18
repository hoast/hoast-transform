// Dependency modules.
const Hoast = require(`hoast`),
	test = require(`ava`);
// Custom module.
const Transform = require(`../library`);

/**
 * Emulates a simplified Hoast process for testing purposes.
 * @param {Object} options Hoast options.
 * @param {Function} mod Module function.
 * @param {Array of objects} files The files to process and return.
 */
const emulateHoast = async function(options, mod, files) {
	const hoast = Hoast(__dirname, options);
	
	if (mod.before) {
		await mod.before(hoast);
	}
	
	const temp = await mod(hoast, files);
	if (temp) {
		files = temp;
	}
	
	if (mod.after) {
		await mod.after(hoast);
	}
	
	return files;
};

test(`transform`, async function(t) {
	// Create dummy files.
	const files = [{
		path: `a.txt`,
		content: {
			type: `string`,
			data: `# title\ncontent`
		}
	}, {
		path: `b.md`,
		content: {
			type: `string`,
			data: `# title\ncontent`
		}
	}];
	
	// Expected outcome.
	const filesOutcome = [{
		path: `a.txt`,
		content: {
			type: `string`,
			data: `# title\ncontent`
		}
	}, {
		path: `b.html`,
		content: {
			type: `string`,
			data: `<h1>title</h1>\n<p>content</p>\n`
		}
	}];
	
	// Test module.
	await emulateHoast({}, Transform({
		patterns: `**/*.md`
	}), files);
	// Compare files.
	t.deepEqual(files, filesOutcome);
});