// @flow

const Ar = require('../array.js');
const St = require('../set.js');
const Mp = require('../map.js');
const Mth = require('../math.js');
const Cl = require('../collection.js');
const {setup} = require('../test/test-util.js');

const {expect, test, tru, eq, eqq, eqqq, not} = setup(
  Mp.shallowEquals,
  Cl.deepEquals,
);

test('shallowEquals', () => {
  tru(Mp.shallowEquals(Mp({a: 1, b: 2, c: 3}), Mp({a: 1, b: 2, c: 3})));
  not.tru(Mp.shallowEquals(Mp({a: 1, b: 2, c: 3}), Mp({b: 2, c: 3})));
  not.tru(Mp.shallowEquals(Mp({a: 1, b: 2}), Mp({a: 1, b: 2, c: 3})));
});

test('unorderedEquals', () => {
  tru(Mp.unorderedEquals(Mp({a: 1, b: 2, c: 3}), Mp({b: 2, c: 3, a: 1})));
  not.tru(Mp.unorderedEquals(Mp({a: 1, b: 2, c: 3}), Mp({b: 2, c: 3})));
  not.tru(Mp.unorderedEquals(Mp({a: 1, b: 2}), Mp({a: 1, b: 2, c: 3})));
});

test('deepEquals', () => {
  tru(Mp.deepEquals(Mp({a: [1, 2], b: 3}), Mp({a: [1, 2], b: 3})));
  tru(Mp.deepEquals(Mp.of([[1, 2], [3, 4]]), Mp.of([[1, 2], [3, 4]])));
  not.tru(Mp.deepEquals(Mp({a: 1, b: 2, c: 3}), Mp({b: 2, c: 3})));
  not.tru(Mp.deepEquals(Mp({a: [1, 2]}), Mp({a: [1, 2], b: 3})));
});

test('Mp', async () => {
  eq(Mp({a: 1, b: 2, c: 3}), new Map([['a', 1], ['b', 2], ['c', 3]]));

  tru(Mp.isMap(Mp()));
  tru(Mp.isMap(new Map([])));
  not.tru(Mp.isMap([]));
  not.tru(Mp.isMap(St()));

  eqq(Mp.of([[0, 1], [1, 1]]), Mp.of([[0, 1], [1, 1]]));

  eq(Mp.from([1, 1]), Mp.of([0, 1], [1, 1]));
  eq(Mp.from(St(1, 2)), Mp.of([1, 1], [2, 2]));

  eq(Mp.fromValues(Mp(1, 2, 3), Mp(2, 4), Mp(1, 4)), Mp(1, 2, 3, 4));

  eq(Mp.intersect(Mp(1, 2, 3), Mp(2, 4), Mp(1, 4)), Mp(2));

  eq(Mp.diff(Mp(1, 2, 3), Mp(2, 4), Mp(1, 4)), Mp(3));

  eq(Mp.map(Mp(1, 2, -2), Math.abs), Mp(1, 2));
  eqqq(Mp.map(Mp(), x => x), Mp());
  eq(Mp.map([1, 2, -2], Math.abs), Mp(1, 2));
  eq(Mp.map(Mp({a: 1, b: 2, c: -2}), Math.abs), Mp(1, 2));

  eq(await Mp.asyncMap(Mp(1, 2, -2), async x => Math.abs(x)), Mp(1, 2));

  eq(Mp.filter(Mp(1, 2, 3), Mth.isOdd), Mp(1, 3));

  eq(Mp.filterNulls(Mp(1, 2, null)), Mp(1, 2));
});
