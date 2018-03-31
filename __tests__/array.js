// @flow

const Ar = require('../array.js');
const St = require('../set.js');
const Mp = require('../map.js');
const {setup} = require('../test/test-util.js');

const {test, tru, eq, eqq, not} = setup(Ar.shallowEquals);

test('shallowEquals', () => {
  tru(Ar.shallowEquals([1, 2, 3], [1, 2, 3]));
  not.tru(Ar.shallowEquals([1, 2, 3], [2, 3]));
  not.tru(Ar.shallowEquals([1, 2], [1, 2, 3]));
});

test('Ar', () => {
  eq(Ar(1, 2, 3), [1, 2, 3]);
  eqq(Ar(), Ar());

  eq(Ar.from([1, 2, 3]), [1, 2, 3]);
  eq(Ar.from(St(1, 2, 3)), [1, 2, 3]);

  eq(Ar.keys(St(1, 2, 3)), [1, 2, 3]);
  eq(Ar.keys(Mp({a: 1, b: 2, c: 3})), ['a', 'b', 'c']);
});
