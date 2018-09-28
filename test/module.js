// Dependency modules.
const test = require(`ava`);
// Custom module.
const Transform = require(`../library`);

test(`transform`, async function(t) {
	// Create module options.
	const options = {
		patterns: `**/*.md`
	};
	
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
	const transform = Transform(options);
	await transform({
		options:{}
	}, files);
	// Compare files.
	t.deepEqual(files, filesOutcome);
});