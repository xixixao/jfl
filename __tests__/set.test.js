// @flow

import {$Mp, $St, Mth, St} from '..';
import {eq, is, not, test, tru} from '../dev/test-setup.js';

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

test('isSet', () => {
  tru(St.isSet($St()));
  tru(St.isSet(new Set()));
  not.tru(St.isSet([]));
  not.tru(St.isSet($Mp()));
});

test('from', () => {
  eq(St.from([2, 1, 2, 3]), $St(2, 1, 3));
  eq(St.from($Mp({a: 1, b: 2, c: 3})), $St(1, 2, 3));
});

test('fromAsync', async () => {
  eq(await St.fromAsync($St((async () => 1)(), (async () => 2)())), $St(1, 2));
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

test('flaten', () => {
  eq(St.flatten([$St(1, 2, 3), $St(2, 4), $St(1, 4)]), $St(1, 2, 3, 4));
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

test('filter', () => {
  eq(St.filter($St(1, 2, 3), Mth.isOdd), $St(1, 3));
});

test('filterAsync', async () => {
  eq(await St.filterAsync([1, 2, 3], async x => Mth.isOdd(x)), $St(1, 3));
});

test('filterNulls', () => {
  eq(St.filterNulls($St(1, 2, null)), $St(1, 2));
});
