import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactPlugin from "eslint-plugin-react";
import tseslint from "typescript-eslint";

export default [
	js.configs.recommended,
	...tseslint.configs.recommended,

	{
		ignores: [
			"dist",
			"node_modules",
			".git",
			"coverage",
			"*.min.js",
			"src/e2e",
			"server",
			"tailwind.config.js",
		],
	},

	{
		files: ["**/*.{ts,tsx}"],
		ignores: ["vite.config.ts", "vitest.config.ts", "playwright.config.ts"],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				projectService: true,
				ecmaFeatures: { jsx: true },
			},
			globals: {
				...globals.browser,
				...globals.es2020,
				...globals.node,
			},
		},
		plugins: {
			react: reactPlugin,
		},
		rules: {
			"react/jsx-uses-react": "off",
			"no-undef": "off",
			"no-console": "off",
			"prefer-const": "off",
			"no-var": "off",
			"no-unused-vars": "off",
			"no-async-promise-executor": "off",
			"no-useless-catch": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/no-empty-object-type": "off",
			"@typescript-eslint/ban-ts-comment": "off",
			"@typescript-eslint/no-require-imports": "off",
		},
	},

	{
		files: ["vite.config.ts", "vitest.config.ts", "playwright.config.ts"],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				ecmaVersion: "latest",
			},
		},
		rules: {
			"no-undef": "off",
			"no-unused-vars": "off",
			"@typescript-eslint/ban-ts-comment": "off",
		},
	},

	{
		files: ["**/*.js", "**/*.cjs"],
		languageOptions: {
			globals: globals.node,
		},
	},

	{
		files: ["src/test/**/*"],
		languageOptions: {
			globals: { ...globals.jest, ...globals.vitest },
		},
	},

	{
		plugins: { "react-hooks": reactHooks },
		rules: {
			"react-hooks/preserve-manual-memoization": "off",
			"react-hooks/set-state-in-effect": "off",
			"react-hooks/exhaustive-deps": "off",
		},
	},
];
