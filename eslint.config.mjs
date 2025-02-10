import globals from 'globals'
import pluginJs from '@eslint/js'
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs'
    }
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      }
    }
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error'
    }
  },
  pluginJs.configs.recommended,
  pluginPrettierRecommended,
  {
    rules: {
      eqeqeq: ['error', 'smart'],
      'no-async-promise-executor': 'off',
      'no-console': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none', ignoreRestSiblings: true }],
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-const': 'error',
      quotes: ['error', 'single', { avoidEscape: true }]
    }
  },
  {
    files: ['importer-db-staging-sampletaker/**/*.js', 'manual-testing-helper-tool/**/*.js'],
    rules: {
      'no-console': 'off'
    }
  }
]
