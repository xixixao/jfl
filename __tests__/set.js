// @flow

const Ar = require('../array.js');
const St = require('../set.js');
const Mp = require('../map.js');
const {setup} = require('../test/test-util.js');

const {test, tru, eq, not} = setup(Ar.shallowEquals);

test('shallowEquals', () => {
  tru(St.shallowEquals(St(1, 2, 3), St(1, 2, 3)));
  not.tru(St.shallowEquals(St(1, 2, 3), St(2, 3)));
  not.tru(St.shallowEquals(St(1, 2), St(1, 2, 3)));
});

test('St', () => {
  eq(St(1, 2, 3), new Set([1, 2, 3]));
  eq(St.from([2, 1, 2, 3]), St(1, 2, 3));
  eq(Ar.from(Mp({a: 1, b: 2, c: 3})), [1, 2, 3]);
});
