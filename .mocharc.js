module.exports = {
  extension: ['js'],
  package: './package.json',
  reporter: 'spec',
  spec: 'tests/**/*.spec.js',
  ui: 'bdd',
  'watch-files': ['tests/**/*.spec.js'],
  'watch-ignore': ['node_modules'],
};
