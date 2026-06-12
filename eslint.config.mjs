import tsParser from '@typescript-eslint/parser';
import tseslint from '@typescript-eslint/eslint-plugin';
import obsidianmd from 'eslint-plugin-obsidianmd';

const tsEslintConfig = tseslint.configs['flat/recommended-type-checked'];
const obsidianConfig = obsidianmd.configs.recommended;

export default [
  {
    ignores: ['node_modules/**', 'main.js', 'eslint.config.mjs'],
  },
  ...tsEslintConfig,
  ...obsidianConfig,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: new URL('.', import.meta.url).pathname,
        sourceType: 'module',
      },
    },
    rules: {
      'no-console': 'warn',
    },
  },
];
