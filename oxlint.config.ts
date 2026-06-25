import { defineConfig } from 'oxlint'

export default defineConfig({
  plugins: ['import', 'typescript', 'unicorn', 'vitest'],
  options: {
    typeAware: true,
    typeCheck: true,
  },
  env: {
    browser: true,
  },
  ignorePatterns: ['**/*.js', '**/*.map', '**/*.d.ts', 'coverage'],
  categories: {
    correctness: 'error',
    suspicious: 'error',
  },
  rules: {
    'eslint/eqeqeq': 'error',
    'eslint/no-shadow': 'off', // Too picky
    'eslint/no-unused-vars': 'off', // Rely on TypeScript compiler instead

    'import/no-named-as-default': 'off', // Too picky
    'import/no-unassigned-import': 'off', // Does not recognize CSS imports

    'typescript/no-base-to-string': 'off', // Too picky
    'typescript/no-floating-promises': 'warn', // Too many errors
    'typescript/no-explicit-any': 'warn', // Too many errors
    'typescript/no-unnecessary-type-assertion': 'warn', // Too many errors
    'typescript/no-unsafe-type-assertion': 'warn', // Too many errors
    'typescript/unbound-method': 'off', // Too picky

    'unicorn/explicit-length-check': 'warn',
    'unicorn/no-array-sort': 'off', // Risk of backward-compatibility break

    'vitest/consistent-test-it': ['error', { fn: 'it' }],
    'vitest/expect-expect': 'off', // Does not work with our `assertVisual` utility function
    'vitest/no-alias-methods': 'error',
    'vitest/no-conditional-in-test': 'warn',
    'vitest/no-identical-title': 'error',
    'vitest/prefer-describe-function-title': 'warn',
    'vitest/prefer-equality-matcher': 'error',
    'vitest/prefer-hooks-in-order': 'error',
    'vitest/prefer-to-contain': 'error',
    'vitest/prefer-to-have-length': 'error',
    'vitest/valid-title': 'off', // Rely on https://oxc.rs/docs/guide/usage/linter/rules/vitest/prefer-describe-function-title
  },
})
