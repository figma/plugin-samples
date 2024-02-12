/* eslint-env node */
module.exports = {
  extends: ["eslint:recommended", "plugin:@figma/figma-plugins/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
  root: true,
};
