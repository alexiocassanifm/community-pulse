import { dirname } from "path";
import { fileURLToPath } from "url";
import nextConfig from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
  {
    ignores: [".next/**", "node_modules/**"],
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs}"],
    plugins: {
      "@next/next": nextConfig,
      react: reactPlugin,
      "react-hooks": hooksPlugin,
    },
    rules: {
      ...nextConfig.configs.recommended.rules,
      ...nextConfig.configs["core-web-vitals"].rules,
      ...reactPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      ...hooksPlugin.configs.recommended.rules,
      "react-hooks/static-components": "off",
      "react-hooks/set-state-in-effect": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
