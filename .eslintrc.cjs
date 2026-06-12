module.exports = {
  root: true,
  env: { browser: true, node: true, es2020: true },
  parser: "./scripts/eslint-typescript-parser.cjs",
  extends: [
    "eslint:recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs", "node_modules"],
  plugins: ["react-refresh"],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true, allowExportNames: ["useToast"] },
    ],
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
};
