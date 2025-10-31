import { defineConfig } from 'eslint/config';
import javascript from '@eslint/js';
import typescript from 'typescript-eslint';
import prettier from 'eslint-config-prettier/flat';

export default defineConfig(
  javascript.configs.recommended,
  typescript.configs.recommended,
  prettier,
  {
    ignores: ['**/examples/**', '**/scripts/**'],
    rules: {
      'no-eval': 'error',
      'no-debugger': 'error',
      'no-console': 'error',
      'no-duplicate-imports': 'error',
      'no-var': 'error',
      'no-unsafe-finally': 'error',
      'prefer-const': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'object-curly-spacing': ['error', 'always'],
      'no-trailing-spaces': ['error', { ignoreComments: true }],
      '@typescript-eslint/no-use-before-define': 'error',
      '@typescript-eslint/no-namespace': 'error'
    },
  }
);
