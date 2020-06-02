// @flow

const {Ar, Cl, St, Mp, Mth} = require('..');
const {setup} = require('../test/test-util.js');

const {expect, test, tru, eq, eqq, eqqq, not} = setup(
  St.shallowEquals,
  Cl.deepEquals,
);

test('shallowEquals', () => {
  tru(St.shallowEquals(St(1, 2, 3), St(1, 2, 3)));
  not.tru(St.shallowEquals(St(1, 2, 3), St(2, 3)));
  not.tru(St.shallowEquals(St(1, 2), St(1, 2, 3)));
});

test('unorderedEquals', () => {
  tru(St.unorderedEquals(St(1, 2, 3), St(2, 3, 1)));
  not.tru(St.unorderedEquals(St(1, 2, 3), St(2, 3)));
  not.tru(St.unorderedEquals(St(1, 2), St(1, 2, 3)));
});

test('deepEquals', () => {
  tru(St.deepEquals(St([1, 2], 3), St([1, 2], 3)));
  not.tru(St.deepEquals(St([1, 2, 3]), St([2, 3])));
  not.tru(St.deepEquals(St([1, 2]), St([1, 2], 3)));
});

test('St', async () => {
  eq(St(1, 2, 3), new Set([1, 2, 3]));

  tru(St.isSet(St()));
  tru(St.isSet(new Set([])));
  not.tru(St.isSet([]));
  not.tru(St.isSet(Mp()));

  eq(St.from([2, 1, 2, 3]), St(2, 1, 3));
  eq(St.from(Mp({a: 1, b: 2, c: 3})), St(1, 2, 3));

  eq(await St.fromAsync(St((async () => 1)(), (async () => 2)())), St(1, 2));

  eq(St.union(St(1, 2, 3), St(2, 4), St(1, 4)), St(1, 2, 3, 4));

  eq(St.intersect(St(1, 2, 3), St(2, 4), St(1, 4, 2)), St(2));

  eq(St.diff(St(1, 2, 3), St(2, 4), St(1, 4)), St(3));

  eq(St.map(St(1, 2, -2), Math.abs), St(1, 2));
  eqqq(St.map(St(), x => x), St());
  eq(St.map([1, 2, -2], Math.abs), St(1, 2));
  eq(St.map(Mp({a: 1, b: 2, c: -2}), Math.abs), St(1, 2));

  eq(await St.mapAsync(St(1, 2, -2), async x => Math.abs(x)), St(1, 2));

  eq(St.filter(St(1, 2, 3), Mth.isOdd), St(1, 3));

  eq(await St.filterAsync([1, 2, 3], async x => Mth.isOdd(x)), St(1, 3));

  eq(St.filterNulls(St(1, 2, null)), St(1, 2));
});
