const {readFile, writeFile} = require("fs/promises");

module.exports = () => async (template, source) => {
	const sourceComposerJson = JSON.parse((await readFile(source.path('composer.json'))).toString());
	const {
		'to-override': _,
		...requireDevWithoutPackage
	} = sourceComposerJson['require-dev'];

	await writeFile(source.path('composer.json'), JSON.stringify({
		...sourceComposerJson,
		'require-dev': requireDevWithoutPackage
	}));

	return {
		reserved: [],
	};
};
