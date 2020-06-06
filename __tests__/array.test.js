// @flow

const {Ar, Cl, St, Mp, Mth} = require('..');
const {setup} = require('../test/test-util.js');

const {test, tru, eq, eqq, eqqq, not, throws} = setup(
  Ar.shallowEquals,
  Cl.deepEquals,
);

test('shallowEquals', () => {
  tru(Ar.shallowEquals([1, 2, 3], [1, 2, 3]));
  not.tru(Ar.shallowEquals([1, 2, 3], [2, 3]));
  not.tru(Ar.shallowEquals([1, 2], [1, 2, 3]));
});

test('deepEquals', () => {
  tru(Ar.deepEquals([[1, 2], 3], [[1, 2], 3]));
  not.tru(Ar.deepEquals([[1, 2, 3]], [[2, 3]]));
  not.tru(Ar.deepEquals([[1, 2]], [[1, 2], 3]));
});

test('Ar', async () => {
  eq(Ar(1, 2, 3), [1, 2, 3]);
  eqqq(Ar(), Ar());

  tru(Ar.isArray([]));
  tru(Ar.isArray(Ar()));
  not.tru(Ar.isArray(St()));
  not.tru(Ar.isArray(Mp()));

  eq(Ar.from([1, 2, 3]), [1, 2, 3]);
  eq(Ar.from(St(1, 2, 3)), [1, 2, 3]);

  eq(await Ar.fromAsync(St((async () => 1)(), (async () => 2)())), [1, 2]);

  eq(Ar.keys(St(1, 2, 3)), [1, 2, 3]);
  eq(Ar.keys(Mp({a: 1, b: 2, c: 3})), ['a', 'b', 'c']);

  eqq(Ar.entries(Mp({a: 1, b: 2, c: 3})), [['a', 1], ['b', 2], ['c', 3]]);

  eq(Ar.map([1, 2, 3], x => x * 2), [2, 4, 6]);
  eqqq(Ar.map(Ar(), x => x), Ar());
  eq(Ar.map(St(1, 2, 3), x => x * 2), [2, 4, 6]);
  eq(Ar.map(Mp({a: 1, b: 2, c: 3}), x => x * 2), [2, 4, 6]);

  eq(await Ar.mapAsync([1, 2, 3], async x => x * 2), [2, 4, 6]);

  eq(Ar.filter([1, 2, 3], Mth.isOdd), [1, 3]);

  eq(await Ar.filterAsync([1, 2, 3], async x => Mth.isOdd(x)), [1, 3]);

  eq(Ar.filterNulls([1, 2, null]), [1, 2]);

  eq(Ar.findIndices([1, 2, 3], Mth.isOdd), [0, 2]);

  eq(Ar.concat([1, 2], [3, 4]), [1, 2, 3, 4]);

  eq(Ar.flatten([[1, 2], [3, 4]]), [1, 2, 3, 4]);

  eq(Ar.flatMap([0, 3, 6], x => [x + 1, x + 2]), [1, 2, 4, 5, 7, 8]);

  eq(Ar.range(-1, 5), [-1, 0, 1, 2, 3, 4]);
  eq(Ar.range(1, 5, 2), [1, 3]);
  eq(Ar.range(3, 1), []);
  throws(() => Ar.range(1, 4, -2));

  eq(Ar.rangeInclusive(1, 2), [1, 2]);
  eq(Ar.rangeInclusive(1, 3, 2), [1, 3]);
  throws(() => Ar.rangeInclusive(1, 4, -2));

  eq(Ar.rangeDescending(5, 1, 2), [5, 3]);
  eq(Ar.rangeDescending(1, 3), []);
  throws(() => Ar.rangeDescending(2, 1, -1));

  eq(Ar.rangeDynamic(1, 2, 0.5), [1, 1.5, 2]);
  eq(Ar.rangeDynamic(2, 1, 0.5), [2, 1.5, 1]);
  throws(() => Ar.rangeDynamic(2, 1, -1));

  eq(Ar.repeat(1, 4), [1, 1, 1, 1]);

  eq(Ar.take([1, 2, 3], 2), [1, 2]);

  eq(Ar.drop([1, 2, 3], 2), [3]);

  eqq(Ar.splitAt([1, 2, 3], 2), [[1, 2], [3]]);

  eqq(Ar.chunks([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);

  eq(Ar.reverse([1, 2, 3]), [3, 2, 1]);

  eq(Ar.generate(2, n => (n < 64 ? [n, n * n] : null)), [2, 4, 16]);

  eqq(Ar.partition([1, 2, 3], Mth.isOdd), [[1, 3], [2]]);

  eq(Ar.sort(['c', 'a', 'b']), ['a', 'b', 'c']);
  eq(Ar.sort(['c', 'a', 'b'], (a, b) => a.length - b.length), ['c', 'a', 'b']);

  eq(Ar.numericalSort([3, 1, 2]), [1, 2, 3]);

  eq(Ar.fastSort(['c', 'a', 'b']), ['a', 'b', 'c']);

  eq(Ar.scan([1, 2, 3, 4], 1, (acc, x) => x + acc), [2, 4, 7, 11]);

  eq(Ar.slice([1, 2, 3, 4], 2), [3, 4]);
  eq(Ar.slice([1, 2, 3, 4], 2, 3), [3]);
  eq(Ar.slice([1, 2, 3, 4, 5], 2, -2), [3]);
  eq(Ar.slice(St(1, 2, 3, 4), 2), [3, 4]);
  eq(Ar.slice(St(1, 2, 3, 4), 2, 3), [3]);
  eq(Ar.slice(St(1, 2, 3, 4, 5), 2, -2), [3]);

  eq(Ar.splice([1, 2, 4, 5], 2, 0, 3), [1, 2, 3, 4, 5]);

  eq(Ar.takeWhile([1, 2, 3], Mth.isOdd), [1]);

  eq(Ar.dropWhile([1, 2, 3], Mth.isOdd), [2, 3]);

  eqq(Ar.span([1, 2, 3], Mth.isOdd), [[1], [2, 3]]);

  eqq(Ar.zip([1, 2, 3], ['a', 'b', 'c'], [5, 6, 7]), [
    [1, 'a', 5],
    [2, 'b', 6],
    [3, 'c', 7],
  ]);

  const times = (a, b, c) => a + b * c;
  eq(Ar.zipWith(times, [1, 2, 3], [5, 6, 7], [2, 4, 6]), [11, 26, 45]);
});
