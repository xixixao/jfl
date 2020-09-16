// @flow

import {$Mp, $St, Mp, Mth} from '..';
import {eq, eqq, is, not, test, tru} from '../dev/test-setup.js';

test('equals', () => {
  tru(Mp.equals($Mp({a: 1, b: 2, c: 3}), $Mp({a: 1, b: 2, c: 3})));
  not.tru(Mp.equals($Mp({a: 1, b: 2, c: 3}), $Mp({b: 2, c: 3})));
  not.tru(Mp.equals($Mp({a: 1, b: 2}), $Mp({a: 1, b: 2, c: 3})));
});

test('equalsOrderIgnored', () => {
  tru(Mp.equalsOrderIgnored($Mp({a: 1, b: 2, c: 3}), $Mp({b: 2, c: 3, a: 1})));
  not.tru(Mp.equalsOrderIgnored($Mp({a: 1, b: 2, c: 3}), $Mp({b: 2, c: 3})));
  not.tru(Mp.equalsOrderIgnored($Mp({a: 1, b: 2}), $Mp({a: 1, b: 2, c: 3})));
});

test('equalsNested', () => {
  tru(Mp.equalsNested($Mp({a: [1, 2], b: 3}), $Mp({a: [1, 2], b: 3})));
  tru(Mp.equalsNested(Mp.of([1, 2], [3, 4]), Mp.of([1, 2], [3, 4])));
  not.tru(Mp.equalsNested($Mp({a: 1, b: 2, c: 3}), $Mp({b: 2, c: 3})));
  not.tru(Mp.equalsNested($Mp({a: [1, 2]}), $Mp({a: [1, 2], b: 3})));
});

test('$Mp', async () => {
  eq(
    $Mp({a: 1, b: 2, c: 3}),
    new Map([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]),
  );
});

test('of', () => {
  eqq(
    Mp.of([0, 1], [1, 1]),
    new Map([
      [0, 1],
      [1, 1],
    ]),
  );
});

test('from', () => {
  eq(Mp.from([1, 1]), Mp.of([0, 1], [1, 1]));
  eq(Mp.from($St(1, 2)), Mp.of([1, 1], [2, 2]));
});

test('fromAsync', async () => {
  eq(
    await Mp.fromAsync([(async () => 1)(), (async () => 2)()]),
    Mp.of([0, 1], [1, 2]),
  );
});

test('fromValues', () => {
  eq(
    Mp.fromValues([1, 2], value => `${value}`),
    $Mp({'1': 1, '2': 2}),
  );
});

test('fromKeys', () => {
  eq(
    Mp.fromKeys([1, 2], key => key * 2),
    Mp.of([1, 2], [2, 4]),
  );
});

test('fromKeysAsync', async () => {
  eq(
    await Mp.fromKeysAsync([1, 2], async key => key * 2),
    Mp.of([1, 2], [2, 4]),
  );
});

test('fromEntries', () => {
  eq(
    Mp.fromEntries([
      [1, 2],
      [3, 4],
    ]),
    Mp.of([1, 2], [3, 4]),
  );
  eq(Mp.fromEntries($St([1, 2], [3, 4])), Mp.of([1, 2], [3, 4]));
});

test('zip', () => {
  eq(Mp.zip([1, 2], [3, 4]), Mp.of([1, 3], [2, 4]));
});

test('toObject', () => {
  eq($Mp(Mp.toObject($Mp({a: 1, b: 2}))), $Mp({a: 1, b: 2}));
});

test('mutable', () => {
  const x = Mp.mutable($Mp({a: 1, b: 2, c: 3}));
  x.set('c', 4);
  eq(x, $Mp({a: 1, b: 2, c: 4}));
});

test('isMap', () => {
  tru(Mp.isMap($Mp()));
  tru(Mp.isMap(new Map([])));
  not.tru(Mp.isMap([]));
  not.tru(Mp.isMap($St()));
});

test('set', () => {
  eq(Mp.set($Mp({a: 1}), 'b', 2), $Mp({a: 1, b: 2}));
});

test('merge', () => {
  eq(Mp.merge($Mp({a: 1, b: 2}), $Mp({a: 2, c: 3})), $Mp({a: 2, b: 2, c: 3}));
});

test('getX', () => {
  is(Mp.getX($Mp({a: 2}), 'a'), 2);
});

test('diffByKey', () => {
  eq(Mp.diffByKey($Mp({a: 1, b: 2}), $Mp({b: 3}), $Mp({c: 4})), $Mp({a: 1}));
});

test('filter', () => {
  eq(
    Mp.filter($Mp({a: 1, b: 2}), x => Mth.isOdd(x)),
    $Mp({a: 1}),
  );
  eq(
    Mp.filter(Mp.of([0, 1], [3, 4]), (_, x) => Mth.isOdd(x)),
    Mp.of([3, 4]),
  );
});

test('filterAsync', async () => {
  eq(
    await Mp.filterAsync($Mp({a: 1, b: 2}), async x => Mth.isOdd(x)),
    $Mp({a: 1}),
  );
  eq(
    await Mp.filterAsync(Mp.of([0, 1], [3, 4]), async (_, x) => Mth.isOdd(x)),
    Mp.of([3, 4]),
  );
});

test('filterNulls', () => {
  eq(Mp.filterNulls([1, null, 3]), Mp.of([0, 1], [2, 3]));
});

test('selectKeys', () => {
  eq(Mp.selectKeys($Mp({a: 1, b: 2, c: 3}), ['c', 'b']), $Mp({c: 3, b: 2}));
  eq(
    Mp.selectKeys($Mp({a: 1, b: 2, c: 3}), ['c', 'b', 'd', 'c']),
    $Mp({c: 3, b: 2}),
  );
});

test('unique', () => {
  eq(Mp.unique($Mp({a: 1, b: 2, c: 1})), $Mp({c: 1, b: 2}));
});

test('uniqueBy', () => {
  eq(
    Mp.uniqueBy($Mp({a: 1, b: 2, c: 3}), x => Mth.isOdd(x)),
    $Mp({c: 3, b: 2}),
  );
});

test('takeFirst', () => {
  eq(Mp.takeFirst($Mp({a: 1, b: 2, c: 3}), 2), $Mp({a: 1, b: 2}));
});

test('dropFirst', () => {
  eq(Mp.dropFirst($Mp({a: 1, b: 2, c: 3}), 2), $Mp({c: 3}));
});

test('map', () => {
  eq(
    Mp.map($Mp({a: 1, b: 2}), x => x * 2),
    $Mp({a: 2, b: 4}),
  );
});

test('mapAsync', async () => {
  eq(await Mp.mapAsync($Mp({a: 1, b: 2}), async x => x * 2), $Mp({a: 2, b: 4}));
});

test('mapMaybe', () => {
  eq(
    Mp.mapMaybe($Mp({a: 2}), x => (Mth.isOdd(x) ? x : null)),
    $Mp(),
  );
  eq(
    Mp.mapMaybe($Mp({a: 2, b: 3, c: 5}), x => (Mth.isOdd(x) ? x : undefined)),
    $Mp({b: 3, c: 5}),
  );
});

test('mapFlat', () => {
  eq(
    Mp.mapFlat([1, 3], n => Mp.of([n + 1, 'a'])),
    Mp.of([2, 'a'], [4, 'a']),
  );
  eq(
    Mp.mapFlat([1, 3], n => Mp.of([n + 1, 'a'], [n + 2, 'b'])),
    Mp.of([2, 'a'], [3, 'b'], [4, 'a'], [5, 'b']),
  );
});

test('mapToEntries', () => {
  eq(
    Mp.mapToEntries(['a', 'b'], (x, i) => [x, i]),
    $Mp({a: 0, b: 1}),
  );
});

test('pull', () => {
  eq(
    Mp.pull(
      [2, 3],
      n => n - 2,
      n => n ** 2,
    ),
    Mp.of([0, 4], [1, 9]),
  );
});

test('group', () => {
  eqq(Mp.group([1, 1, 3]), Mp.of([1, [1, 1]], [3, [3]]));
  eqq(
    Mp.group([1, 2, 3], n => n % 2),
    Mp.of([1, [1, 3]], [0, [2]]),
  );
  eqq(
    Mp.group([1, 2, 3], (_, i) => i % 2),
    Mp.of([0, [1, 3]], [1, [2]]),
  );
  eqq(
    Mp.group(
      [1, 2, 3],
      n => n % 2,
      (_, i) => i,
    ),
    Mp.of([1, [0, 2]], [0, [1]]),
  );
});

test('flip', () => {
  eq(Mp.flip($Mp({a: 'A', b: 'B'})), $Mp({A: 'a', B: 'b'}));
});

test('countValues', () => {
  eq(Mp.countValues($Mp({a: 'x', b: 'x', c: 'y'})), $Mp({x: 2, y: 1}));
});
test('flatten', () => {
  eq(Mp.flatten([$Mp({a: 1}), $Mp({b: 2, c: 3})]), $Mp({a: 1, b: 2, c: 3}));
});

test('chunk', () => {
  eqq(Mp.chunk($Mp({a: 1, b: 2, c: 3}), 2), [$Mp({a: 1, b: 2}), $Mp({c: 3})]);
});

test('partition', () => {
  eqq(
    Mp.partition($Mp({a: 2}), x => Mth.isOdd(x)),
    [$Mp(), $Mp({a: 2})],
  );
});

test('reverse', () => {
  eq(Mp.reverse($Mp({a: 1, b: 2, c: 3})), $Mp({c: 3, b: 2, a: 1}));
});

test('sort', () => {
  eq(Mp.sort($Mp({a: 3, b: 1, c: 2})), $Mp({b: 1, c: 2, a: 3}));
});

test('sort', () => {
  eq(Mp.sort($Mp({x: 'c', y: 'b', z: 'a'})), $Mp({z: 'a', y: 'b', x: 'c'}));
});

test('sortBy', () => {
  eq(
    Mp.sortBy($Mp({a: 3, b: 4, c: 2}), n => n % 3),
    $Mp({a: 3, b: 4, c: 2}),
  );
});
