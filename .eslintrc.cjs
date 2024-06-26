module.exports = {
	env: {
		node: true,
	},
	ignorePatterns: ["dist/**/*"],
	extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint"],
	root: true,
	rules: {
		"no-mixed-spaces-and-tabs": ["error", "smart-tabs"],
		"@typescript-eslint/no-explicit-any": "off",
	},
};
