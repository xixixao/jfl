'use strict';

const flowRemoveTypes = require('flow-remove-types');

module.exports = {
  process: (src, filename) => flowRemoveTypes(src).toString(),
};
