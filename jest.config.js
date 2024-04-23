export default {
	preset: "ts-jest",
	testEnvironment: "node",
	setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
	roots: ["<rootDir>/src", "<rootDir>/tests"],
	transform: {
		"^.+\\.ts?$": [
			"ts-jest",
			{
				useESM: true,
			},
		],
	},
	moduleNameMapper: {
		"^(\\.{1,2}/.*)\\.js$": "$1",
	},
	extensionsToTreatAsEsm: [".ts"],
	collectCoverage: true,
	collectCoverageFrom: ["./src/**"],
	coveragePathIgnorePatterns: ["src/github-action.ts", ".*__snapshots__/.*"],
	coverageThreshold: {
		global: {
			branches: 40,
			functions: 40,
			statements: 40,
		},
	},
};
