// .eslintrc.cjs
module.exports = {
  root: true,
  extends: ['expo', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['node_modules', 'dist', 'build'],
  rules: {
    // Allège pour dev rapide
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    // si elles continuent d’apparaître malgré la MAJ, coupe-les:
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/no-wrapper-object-types': 'off',
    // si tu as des require dans des fichiers non-TS:
    '@typescript-eslint/no-var-requires': 'off',
  },
  overrides: [
  {
    files: ['*.config.js', 'metro.config.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
        },
    } ,
 ],
};

