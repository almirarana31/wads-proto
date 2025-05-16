import js from '@eslint/js';
import globals from 'globals';
import pluginReact from 'eslint-plugin-react';

export default [
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    ...js.configs.recommended,
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser
      },
    },
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'error'
    }
  },
  pluginReact.configs.flat.recommended,
];