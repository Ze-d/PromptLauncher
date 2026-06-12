// Lightweight ESLint parser for this repo's TypeScript/TSX sources.
// It strips TypeScript syntax with the local TypeScript compiler, then lets
// ESLint's default parser (espree) build the AST used by the existing rules.
const espree = require("espree");
const ts = require("typescript");

function parseForESLint(code, options = {}) {
  const isDeclaration = options.filePath?.endsWith(".d.ts");
  const source = isDeclaration ? "export {};" : code;
  const result = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
    fileName: isDeclaration ? undefined : options.filePath,
  });

  const ast = espree.parse(result.outputText, {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
    loc: true,
    range: true,
    tokens: true,
    comment: true,
  });

  return { ast };
}

module.exports = { parseForESLint };
