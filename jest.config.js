module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  transform: {
    "\\.tsx?$": "ts-jest",
    "\\.jsx?$": "babel-jest",
  },
  collectCoverage: true,
  collectCoverageFrom: ["./src/**"],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40,
      statements: 40,
    },
  },
};
