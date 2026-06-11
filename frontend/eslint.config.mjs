import js from "@eslint/js";

const browserGlobals = {
  alert: "readonly",
  confirm: "readonly",
  console: "readonly",
  document: "readonly",
  FormData: "readonly",
  localStorage: "readonly",
  window: "readonly",
};

const nodeGlobals = {
  __dirname: "readonly",
};

export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: browserGlobals,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: "module",
      },
    },
    rules: {
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["vite.config.js"],
    languageOptions: {
      globals: nodeGlobals,
    },
  },
];
