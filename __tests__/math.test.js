// @flow

import {Mth, $Mp} from '..';
import {is, test, throws, tru, not, nil} from '../dev/test-setup.js';

test('isOdd', () => {
  tru(Mth.isOdd(-3));
  tru(Mth.isOdd(1));
  not.tru(Mth.isOdd(2));
  not.tru(Mth.isOdd(-10));
});

test('isEven', () => {
  not.tru(Mth.isEven(-3));
  not.tru(Mth.isEven(1));
  tru(Mth.isEven(2));
  tru(Mth.isEven(-10));
});

test('pmod', () => {
  is(Mth.pmod(-13, 5), 2);
});

test('idiv', () => {
  is(Mth.idiv(10, 3), 3);
});

test('divx', () => {
  is(Mth.divx(9, 3), 3);
  throws(() => Mth.divx(9, 0));
});

test('idivx', () => {
  is(Mth.idivx(10, 3), 3);
  throws(() => Mth.idivx(9, 0));
});

test('min', () => {
  is(Mth.min($Mp({a: 5, b: 2, c: 8})), 2);
  nil(Mth.min([]));
});

test('minBy', () => {
  nil(Mth.minBy([], n => -n));
  is(
    Mth.minBy([1, 2], n => -n),
    2,
  );
  is(
    Mth.minBy([1, null], n => (n == null ? 1000 : n)),
    1,
  );
});

test('max', () => {
  is(Mth.max($Mp({a: 5, b: 2, c: 8})), 8);
  nil(Mth.max([]));
});

test('maxBy', () => {
  nil(Mth.maxBy([], n => -n));
  is(
    Mth.maxBy([1, 2], n => -n),
    1,
  );
  is(
    Mth.maxBy([1, null], n => (n == null ? -1000 : n)),
    1,
  );
});

test('mean', () => {
  is(Mth.mean($Mp({a: 1, b: 36, c: 2})), 13);
  nil(Mth.mean([]));
});

test('median', () => {
  is(Mth.median($Mp({a: 1, b: 36, c: 2})), 2);
  is(Mth.median($Mp({a: 1, b: 36, c: 2, d: 3})), 2.5);
  nil(Mth.median([]));
});

test('sum', () => {
  is(Mth.sum([1, 2, 3]), 6);
});

test('product', () => {
  is(Mth.product([]), 1);
  is(Mth.product([2, 3, 4]), 24);
});

test('fromBase', () => {
  is(Mth.fromBase('01000', 2), 8);
  throws(() => Mth.fromBase('0100a', 2));
  throws(() => Mth.fromBase('a0100', 2));
  throws(() => Mth.fromBase('0100', 1));
  throws(() => Mth.fromBase('', 2));
  throws(() => Mth.fromBase('A', 10));
  is(Mth.fromBase('A', 11), 10);
  is(Mth.fromBase('a', 11), 10);
  throws(() => Mth.fromBase('B', 11));
  throws(() => Mth.fromBase('b', 11));
  is(Mth.fromBase('Z', 36), 35);
});

test('baseConvert', () => {
  is(Mth.baseConvert('01000', 2, 4), '20');
  throws(() => Mth.baseConvert('0100', 1, 4));
  throws(() => Mth.baseConvert('0100', 2, 38));
});

test('toBase', () => {
  is(Mth.toBase(42, 3), '1120');
});
