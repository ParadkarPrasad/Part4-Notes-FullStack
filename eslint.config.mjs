import globals from "globals";
import stylisticJs from '@stylistic/eslint-plugin-js'
import path from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import pluginJs from "@eslint/js";

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({baseDirectory: __dirname, recommendedConfig: pluginJs.configs.recommended});

export default [
  {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: { globals: globals.browser }},
  ...compat.extends("airbnb-base"),
  {
    plugins: {
      '@stylistic/js': stylisticJs
    },
    ignores:['dist', 'node_modules'],
  
  rules: {
    '@stylistic/js/indent': [
      'error',
      2
    ],
   '@stylistic/js/no-trailing-spaces': "error",
   '@stylistic/js/arrow-spacing': "error",
   '@stylistic/js/object-curly-spacing': ["error", "always"],
   '@stylistic/js/linebreak-style': ["error", "unix"],
   '@stylistic/js/semi': ["error", "always"],
   '@stylistic/js/quotes': ["error", "single"],
   'no-console': 0
  }
}
];