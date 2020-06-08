module.exports = {
  retainLines: true,
  plugins: [
    "@babel/plugin-proposal-export-namespace-from",
    "@babel/plugin-transform-flow-strip-types",
  ],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
};
