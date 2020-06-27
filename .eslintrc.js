module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  ignorePatterns: ['dist'],
  extends: ['eslint:recommended', 'prettier', 'prettier/flowtype'],
  parser: 'babel-eslint',
  plugins: ['flowtype'],
  rules: {
    'no-redeclare': 0,
    'no-undef': 0,
    'no-unused-vars': [
      'error',
      {varsIgnorePattern: '^_', argsIgnorePattern: '^_'},
    ],
    'no-constant-condition': ['error', {checkLoops: false}],
    'flowtype/use-flow-type': 1,
  },
  settings: {
    flowtype: {
      onlyFilesWithFlowAnnotation: true,
    },
  },
};
