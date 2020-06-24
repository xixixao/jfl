// @flow

const flowRemoveTypes = require('flow-remove-types');
const createFilter = require('rollup-pluginutils').createFilter;

export default function (options: any) {
  options = options || {};
  const filter = createFilter(options.include, options.exclude);

  return {
    name: 'flow-remove-types',
    transform: function (code: any, id: any) {
      if (filter(id)) {
        const transformed = flowRemoveTypes(
          code.replace(/: %checks/, ''),
          options,
        );
        return {
          code: transformed.toString(),
          map: transformed.generateMap(),
        };
      }
    },
  };
}
