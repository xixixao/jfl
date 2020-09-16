// @flow

import {$Mp, $St, Mth, St} from '..';
import {eq, eqq, is, not, test, tru} from '../dev/test-setup.js';

test('equals', () => {
  tru(St.equals($St(1, 2, 3), $St(1, 2, 3)));
  not.tru(St.equals($St(1, 2, 3), $St(2, 3)));
  not.tru(St.equals($St(1, 2), $St(1, 2, 3)));
});

test('equalsOrderIgnored', () => {
  tru(St.equalsOrderIgnored($St(1, 2, 3), $St(2, 3, 1)));
  not.tru(St.equalsOrderIgnored($St(1, 2, 3), $St(2, 3)));
  not.tru(St.equalsOrderIgnored($St(1, 2), $St(1, 2, 3)));
});

test('equalsNested', () => {
  tru(St.equalsNested($St([1, 2], 3), $St([1, 2], 3)));
  not.tru(St.equalsNested($St([1, 2, 3]), $St([2, 3])));
  not.tru(St.equalsNested($St([1, 2]), $St([1, 2], 3)));
});

test('$St', async () => {
  eq($St(1, 2, 3), new Set([1, 2, 3]));
});

test('from', () => {
  eq(St.from([2, 1, 2, 3]), $St(2, 1, 3));
  eq(St.from($Mp({a: 1, b: 2, c: 3})), $St(1, 2, 3));
});

test('keys', () => {
  eq(St.keys([2, 1, 2, 3]), $St(0, 1, 2, 3));
  eq(St.keys($Mp({a: 1, b: 2, c: 3})), $St('a', 'b', 'c'));
  eq(St.keys($St('a', 'b', 'c')), $St('a', 'b', 'c'));
});

test('fromAsync', async () => {
  eq(await St.fromAsync($St((async () => 1)(), (async () => 2)())), $St(1, 2));
});

test('mutable', () => {
  const x = St.mutable($St(1, 2, 3));
  x.add(4);
  eq(x, $St(1, 2, 3, 4));
});

test('isSet', () => {
  tru(St.isSet($St()));
  tru(St.isSet(new Set()));
  not.tru(St.isSet([]));
  not.tru(St.isSet($Mp()));
});

test('add', () => {
  eq(St.add($St(1, 2, 3), 4), $St(1, 2, 3, 4));
});

test('union', () => {
  eq(St.union($St(1, 2, 3), $St(2, 4), $St(1, 4)), $St(1, 2, 3, 4));
});

test('intersect', () => {
  eq(St.intersect($St(1, 2, 3), $St(2, 4), $St(1, 4, 2)), $St(2));
});

test('diff', () => {
  eq(St.diff($St(1, 2, 3), $St(2, 4), $St(1, 4)), $St(3));
});

test('flatten', () => {
  eq(St.flatten([$St(1, 2, 3), $St(2, 4), $St(1, 4)]), $St(1, 2, 3, 4));
});

test('filter', () => {
  eq(
    St.filter($St(1, 2, 3), x => Mth.isOdd(x)),
    $St(1, 3),
  );
});

test('filterAsync', async () => {
  eq(await St.filterAsync([1, 2, 3], async x => Mth.isOdd(x)), $St(1, 3));
});

test('filterNulls', () => {
  eq(St.filterNulls($St(1, 2, null)), $St(1, 2));
});

test('filterKeys', () => {
  eq(
    St.filterKeys($Mp({a: 1, b: 2, c: 3}), x => Mth.isOdd(x)),
    $St('a', 'c'),
  );
});

test('map', () => {
  eq(St.map($St(1, 2, -2), Math.abs), $St(1, 2));
  is(
    St.map($St(), x => x),
    $St(),
  );
  eq(St.map([1, 2, -2], Math.abs), $St(1, 2));
  eq(St.map($Mp({a: 1, b: 2, c: -2}), Math.abs), $St(1, 2));
});

test('mapAsync', async () => {
  eq(await St.mapAsync($St(1, 2, -2), async x => Math.abs(x)), $St(1, 2));
});

test('mapFlat', () => {
  eq(
    St.mapFlat([1, 2], x => [x - 1, x]),
    $St(0, 1, 2),
  );
});

test('remove', () => {
  eq(St.remove($St(1, 2, 3), 2), $St(1, 3));
});

test('chunk', () => {
  eqq(St.chunk([4, 2, 3, 4, 5, 6], 2), [$St(4, 2), $St(3, 5), $St(6)]);
});

test('partition', () => {
  eqq(
    St.partition([1, 2, 3, 2], n => Mth.isOdd(n)),
    [$St(1, 3), $St(2)],
  );
});
