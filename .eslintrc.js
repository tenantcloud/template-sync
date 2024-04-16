module.exports = {
  env: {
    node: true,
  },
  ignorePatterns: ["dist/**/*"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  root: true,
};
