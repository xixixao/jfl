// @flow

import {$Ar, $Mp, $St, Ar, Mth, Mp} from '..';
import {test, tru, eq, eqq, is, not, throws} from '../dev/test-setup.js';

test('equals', () => {
  tru(Ar.equals([1, 2, 3], [1, 2, 3]));
  not.tru(Ar.equals([1, 2, 3], [2, 3]));
  not.tru(Ar.equals([1, 2], [1, 2, 3]));
});

test('equalsNested', () => {
  tru(Ar.equalsNested([[1, 2], 3], [[1, 2], 3]));
  not.tru(Ar.equalsNested([[1, 2, 3]], [[2, 3]]));
  not.tru(Ar.equalsNested([[1, 2]], [[1, 2], 3]));
});

test('$Ar', () => {
  eq($Ar(1, 2, 3), [1, 2, 3]);
  is($Ar(), $Ar());
});

test('from', () => {
  eq(Ar.from([1, 2, 3]), [1, 2, 3]);
  eq(Ar.from($St(1, 2, 3)), [1, 2, 3]);
});

test('fromAsync', async () => {
  eq(await Ar.fromAsync($St((async () => 1)(), (async () => 2)())), [1, 2]);
});

test('keys', () => {
  eq(Ar.keys($St(1, 2, 3)), [1, 2, 3]);
  eq(Ar.keys($Mp({a: 1, b: 2, c: 3})), ['a', 'b', 'c']);
});

test('entries', () => {
  eqq(Ar.entries($Mp({a: 1, b: 2, c: 3})), [
    ['a', 1],
    ['b', 2],
    ['c', 3],
  ]);
});

test('range', () => {
  eq(Ar.range(-1, 5), [-1, 0, 1, 2, 3, 4]);
  eq(Ar.range(1, 5, 2), [1, 3]);
  eq(Ar.range(3, 1), []);
  throws(() => Ar.range(1, 4, -2));
});

test('rangeInclusive', () => {
  eq(Ar.rangeInclusive(1, 2), [1, 2]);
  eq(Ar.rangeInclusive(1, 3, 2), [1, 3]);
  throws(() => Ar.rangeInclusive(1, 4, -2));
});

test('rangeDescending', () => {
  eq(Ar.rangeDescending(5, 1, 2), [5, 3]);
  eq(Ar.rangeDescending(1, 3), []);
  throws(() => Ar.rangeDescending(2, 1, -1));
});

test('rangeDynamic', () => {
  eq(Ar.rangeDynamic(1, 2, 0.5), [1, 1.5, 2]);
  eq(Ar.rangeDynamic(2, 1, 0.5), [2, 1.5, 1]);
  throws(() => Ar.rangeDynamic(2, 1, -1));
});

test('repeat', () => {
  eq(Ar.repeat('a', 4), ['a', 'a', 'a', 'a']);
});

test('fill', () => {
  eq(
    Ar.fill(4, i => i * 2),
    [0, 2, 4, 6],
  );
});

test('fillAsync', async () => {
  eq(await Ar.fillAsync(4, async i => i * 2), [0, 2, 4, 6]);
});

test('generate', () => {
  eq(
    Ar.generate(2, n => (n < 64 ? [n, n * n] : null)),
    [2, 4, 16],
  );
});

test('mutable', () => {
  const x = Ar.mutable($Mp({a: 1, b: 2, c: 3}));
  x.push(4);
  eqq(x, [1, 2, 3, 4]);
});

test('isArray', () => {
  tru(Ar.isArray([]));
  tru(Ar.isArray($Ar()));
  not.tru(Ar.isArray($St()));
  not.tru(Ar.isArray($Mp()));
});

test('filter', () => {
  eq(
    Ar.filter([1, 2, 3], n => Mth.isOdd(n)),
    [1, 3],
  );
});

test('filterAsync', async () => {
  eq(await Ar.filterAsync([1, 2, 3], async n => Mth.isOdd(n)), [1, 3]);
});

test('filterNulls', () => {
  eq(Ar.filterNulls([1, 2, null]), [1, 2]);
});

test('filterKeys', () => {
  eq(
    Ar.filterKeys([1, 2, 3], n => Mth.isOdd(n)),
    [0, 2],
  );
});

test('unique', () => {
  eq(Ar.unique([]), []);
  eq(Ar.unique([1, 1, 2]), [1, 2]);
});

test('uniqueBy', () => {
  eq(
    Ar.uniqueBy([2, 5, 6, 3], n => n % 3),
    [5, 3],
  );
});

test('takeFirst', () => {
  eq(Ar.takeFirst([1, 2, 3], 2), [1, 2]);
  throws(() => Ar.takeFirst([1], -1));
});

test('dropFirst', () => {
  eq(Ar.dropFirst([1, 2, 3], 2), [3]);
  throws(() => Ar.dropFirst([1], -1));
});

test('takeLast', () => {
  eq(Ar.takeLast([1, 2, 3], 2), [2, 3]);
});

test('dropLast', () => {
  eq(Ar.dropLast([1, 2, 3], 2), [1]);
});

test('takeFirstWhile', () => {
  eq(
    Ar.takeFirstWhile([1, 2, 3], n => Mth.isOdd(n)),
    [1],
  );
});

test('dropFirstWhile', () => {
  eq(
    Ar.dropFirstWhile([1, 5, 7, 2, 3], n => Mth.isOdd(n)),
    [2, 3],
  );
});

test('takeLastWhile', () => {
  eq(
    Ar.takeLastWhile([1, 2, 3, 4, 6, 5, 7], n => Mth.isOdd(n)),
    [5, 7],
  );
});

test('dropLastWhile', () => {
  eq(
    Ar.dropLastWhile([1, 2, 3, 4, 6, 5, 7], n => Mth.isOdd(n)),
    [1, 2, 3, 4, 6],
  );
});

test('chunk', () => {
  eqq(Ar.chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
});
test('partition', () => {
  eqq(
    Ar.partition([1, 2, 3], n => Mth.isOdd(n)),
    [[1, 3], [2]],
  );
});
test('slice', () => {
  eq(Ar.slice([1, 2, 3, 4], 2), [3, 4]);
  eq(Ar.slice([1, 2, 3, 4], 2, 3), [3]);
  eq(Ar.slice([1, 2, 3, 4, 5], 2, -2), [3]);
  eq(Ar.slice([1, 2, 3, 4, 5], -2, -1), [4]);
  eq(Ar.slice($St(1, 2, 3, 4), 2), [3, 4]);
  eq(Ar.slice($St(1, 2, 3, 4), 2, 3), [3]);
  eq(Ar.slice($St(1, 2, 3, 4, 5), 2, -2), [3]);
  eq(Ar.slice($St(1, 2, 3, 4, 5), -2, -1), [4]);
});

test('splice', () => {
  eq(Ar.splice([1, 2, 4, 5], 2, 0, 3), [1, 2, 3, 4, 5]);
  eq(Ar.splice([1, 2, 3, 4], 1, 2, 5, 6), [1, 5, 6, 4]);
});

test('splitAt', () => {
  eqq(Ar.splitAt([1, 2, 3], 2), [[1, 2], [3]]);
});

test('span', () => {
  eqq(
    Ar.span([1, 2, 3], n => Mth.isOdd(n)),
    [[1], [2, 3]],
  );
});

test('prepend', () => {
  eq(Ar.prepend([2, 3], 1), [1, 2, 3]);
});

test('append', () => {
  eq(Ar.append([2, 3], 1), [2, 3, 1]);
});

test('concat', () => {
  eq(Ar.concat([1, 2], [3, 4]), [1, 2, 3, 4]);
});

test('flatten', () => {
  eq(
    Ar.flatten([
      [1, 2],
      [3, 4],
    ]),
    [1, 2, 3, 4],
  );
});

test('zip', () => {
  eqq(Ar.zip([1, 2, 3], ['a', 'b', 'c'], [5, 6, 7]), [
    [1, 'a', 5],
    [2, 'b', 6],
    [3, 'c', 7],
  ]);

  eqq(Ar.zip([1, 2, 3], ['a', 'b', 'c', 'd'], [5, 6, 7, 8, 9, 10]), [
    [1, 'a', 5],
    [2, 'b', 6],
    [3, 'c', 7],
  ]);
});

test('zipWith', () => {
  eq(
    Ar.zipWith((a, b, c) => a + b * c, [1, 2, 3], [5, 6, 7], [2, 4, 6]),
    [11, 26, 45],
  );
});

test('unzip', () => {
  eqq(
    Ar.unzip([
      [1, 'a', 5],
      [2, 'b', 6],
      [3, 'c', 7],
    ]),
    [
      [1, 2, 3],
      ['a', 'b', 'c'],
      [5, 6, 7],
    ],
  );
});

test('product', () => {
  eqq(Ar.product([1], ['a', 'b', 'c'], [5, 6]), [
    [1, 'a', 5],
    [1, 'b', 5],
    [1, 'c', 5],
    [1, 'a', 6],
    [1, 'b', 6],
    [1, 'c', 6],
  ]);
});

test('map', () => {
  eq(
    Ar.map([1, 2, 3], x => x * 2),
    [2, 4, 6],
  );
  is(
    Ar.map($Ar(), x => x),
    $Ar(),
  );
  eq(
    Ar.map($St(1, 2, 3), x => x * 2),
    [2, 4, 6],
  );
  eq(
    Ar.map($Mp({a: 1, b: 2, c: 3}), x => x * 2),
    [2, 4, 6],
  );
});

test('mapAsync', async () => {
  eq(await Ar.mapAsync([1, 2, 3], async x => x * 2), [2, 4, 6]);
});

test('mapMaybe', () => {
  eq(
    Ar.mapMaybe([1, 2, 3, 5], x => (Mth.isOdd(x) ? x * 3 : null)),
    [3, 9, 15],
  );
});

test('mapFlat', () => {
  eq(
    Ar.mapFlat([0, 3, 6], x => [x + 1, x + 2]),
    [1, 2, 4, 5, 7, 8],
  );
});

test('scan', () => {
  eq(
    Ar.scan([1, 2, 3, 4], 1, (acc, x) => x + acc),
    [2, 4, 7, 11],
  );
});

test('reverse', () => {
  eq(Ar.reverse([1, 2, 3]), [3, 2, 1]);
});

test('sort', () => {
  eq(Ar.sort(['c', 'a', 'b']), ['a', 'b', 'c']);
  eq(Ar.sort([3, 1, 2]), [1, 2, 3]);
  // The sort is stable
  eq(
    Ar.sort(['c', 'a', 'b'], (a, b) => a.length - b.length),
    ['c', 'a', 'b'],
  );
  eq(
    Ar.sort(
      Mp.of([2, 'a'], [0, 'b'], [1, 'c']),
      (_a, _b, aKey, bKey) => aKey - bKey,
    ),
    ['b', 'c', 'a'],
  );
});

test('sortBy', () => {
  eq(
    Ar.sortBy([1, 5, 3, 2], n => n % 3),
    [3, 1, 5, 2],
  );
  eq(
    Ar.sortBy(Mp.of([2, 'a'], [4, 'b'], [0, 'c']), (_c, n) => n % 3),
    ['c', 'b', 'a'],
  );
});

test('sortUnstable', () => {
  eq(Ar.sortUnstable(['c', 'a', 'b']), ['a', 'b', 'c']);
});
