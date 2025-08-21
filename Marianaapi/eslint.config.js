// eslint.config.js
const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  // Ignore folders
  { ignores: ["dist", "node_modules", "build"] },

  // Backend JavaScript files (Node.js environment)
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs", // Enables `require` instead of ES modules
      globals: {
        ...globals.node, // ✅ Enables: process, require, module, __dirname, etc.
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["error", { varsIgnorePattern: "^(req|res|next|_" }],
      "no-console": "warn",
      "semi": ["error", "always"],
      "quotes": ["error", "single"],
    },
  },
];