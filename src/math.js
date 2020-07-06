/**
 * @flow
 *
 * This module provides functions which complement methods of `Math` and
 * `Number` built-ins or operate on collections (`Array`s,
 * `Map`s, `Set`s) and return numbers.
 *
 * @ex import {Cl} from 'jfl'
 */

'use strict';

import type {Collection, KeyedCollection} from './types.flow';
import * as Ar from './array';
import * as Cl from './collection';

/// Check

/**
 * Returns true when `n` is an odd integer.
 *
 * @time O(1)
 * @space O(1)
 * @ex Mth.isOdd(-3) // true
 * @see Mth.isEven
 */
export function isOdd(n: number): boolean {
  return n % 2 !== 0;
}

/**
 * Returns true when `n` is an even integer.
 *
 * @time O(1)
 * @space O(1)
 * @ex Mth.isEven(-10) // true
 * @see Mth.isOdd
 */
export function isEven(n: number): boolean {
  return n % 2 === 0;
}

/// Operators

/**
 * Returns the remainder of dividing `numerator` by `divisor`, unlike
 * the `%` operator the result will always be positive.
 *
 * @time O(1)
 * @space O(1)
 * @ex Mth.pmod(-13, 5) // 2
 */
export function pmod(numerator: number, divisor: number): number {
  return ((numerator % divisor) + divisor) % divisor;
}

/**
 * Returns the integer division of `numerator` by `divisor`.
 *
 * @time O(1)
 * @space O(1)
 * @ex Mth.idiv(10, 3) // 3
 * @see Mth.idivx
 */
export function idiv(numerator: number, divisor: number): number {
  return Math.floor(numerator / divisor);
}

/**
 * Returns the result of dividing `numerator` by `divisor`. Throws an error
 * if `divisor` is 0.
 *
 * @time O(1)
 * @space O(1)
 * @ex Mth.divx(5, 0) // throws an error
 * @see Mth.idivx
 */
export function divx(numerator: number, divisor: number): number {
  if (divisor === 0) {
    throw new Error('Expected divisor to not be 0, but it was');
  }
  return numerator / divisor;
}

/**
 * Returns the integer division of `numerator` by `divisor`. Throws an error
 * if `divisor` is 0.
 *
 * @time O(1)
 * @space O(1)
 * @ex Mth.idivx(10, 0) // throws an error
 * @see Mth.idiv
 */
export function idivx(numerator: number, divisor: number): number {
  if (divisor === 0) {
    throw new Error('Expected divisor to not be 0, but it was');
  }
  return Math.floor(numerator / divisor);
}

/// Collections

/**
 * Returns the smallest of all values in `collection`, null if it's empty.
 *
 * @time O(n)
 * @space O(1)
 * @ex Mth.min($Mp({a: 5, b: 2, c: 8})) // 2
 * @ex Mth.min([]) // null
 * @see Mth.minBy, Mth.max
 */
export function min(collection: Collection<number>): ?number {
  const valueIterator = collection.values();
  const firstIteration = valueIterator.next();
  if (firstIteration.done) {
    return null;
  }
  let minValue = firstIteration.value;
  for (const value of valueIterator) {
    minValue = Math.min(minValue, value);
  }
  return minValue;
}

/**
 * Returns the last item in `collection` for which `valueFn` returns
 * the smallest number, null if `collection` is empty.
 *
 * @time O(n)
 * @space O(1)
 * @ex Mth.minBy([1, 2], n => -n) // 2
 * @ex Mth.minBy([], n => -n) // null
 * @see Mth.min, Mth.maxBy
 */
export function minBy<K, V>(
  collection: KeyedCollection<K, V>,
  valueFn: (V, K) => number,
): ?V {
  const valueIterator = collection.entries();
  const firstIteration = valueIterator.next();
  if (firstIteration.done) {
    return null;
  }
  const [firstKey, firstItem] = firstIteration.value;
  let minItem = firstItem;
  let minValue = valueFn(firstItem, firstKey);
  for (const [key, item] of collection.entries()) {
    const value = valueFn(item, key);
    if (value <= minValue) {
      minValue = value;
      minItem = item;
    }
  }
  return minItem;
}

/**
 * Returns the largest of all values in `collection`, null if it's empty.
 *
 * @time O(n)
 * @space O(1)
 * @ex Mth.max($Mp({a: 5, b: 2, c: 8})) // 8
 * @ex Mth.max([]) // null
 * @see Mth.maxBy, Mth.min
 */
export function max(collection: Collection<number>): ?number {
  const valueIterator = collection.values();
  const firstIteration = valueIterator.next();
  if (firstIteration.done) {
    return null;
  }
  let maxValue = firstIteration.value;
  for (const value of valueIterator) {
    maxValue = Math.max(maxValue, value);
  }
  return maxValue;
}

/**
 * Returns the last item in `collection` for which `valueFn` returns the largest
 * number, null if `collection` is empty.
 *
 * @time O(n)
 * @space O(1)
 * @ex Mth.maxBy([1, 2], n => -n) // 1
 * @ex Mth.maxBy([], n => -n) // null
 * @see Mth.max, Mth.minBy
 */
export function maxBy<K, V>(
  collection: KeyedCollection<K, V>,
  valueFn: (V, K) => number,
): ?V {
  const valueIterator = collection.entries();
  const firstIteration = valueIterator.next();
  if (firstIteration.done) {
    return null;
  }
  const [firstKey, firstItem] = firstIteration.value;
  let maxItem = firstItem;
  let maxValue = valueFn(firstItem, firstKey);
  for (const [key, item] of collection.entries()) {
    const value = valueFn(item, key);
    if (value >= maxValue) {
      maxValue = value;
      maxItem = item;
    }
  }
  return maxItem;
}

/**
 * Returns the mean (average) of all values in `collection`, null if it's empty.
 *
 * @time O(n)
 * @space O(1)
 * @ex Mth.mean($Mp({a: 1, b: 36, c: 2})) // 13
 * @ex Mth.mean([]) // null
 * @see Mth.median, Mth.min, Mth.max
 */
export function mean(collection: Collection<number>): ?number {
  const size = Cl.count(collection);
  if (size === 0) {
    return null;
  }
  return sum(collection) / size;
}

/**
 * Returns the median (middle) of all values in `collection`, null if
 * it's empty.
 *
 * It the `collection` has an even number of items, the result will be the
 * average of the two middle values.
 *
 * @time Worst case O(n^2)
 * @space O(n)
 * @ex Mth.median($Mp({a: 1, b: 36, c: 2})) // 2
 * @ex Mth.median($Mp({a: 1, b: 36, c: 2, d: 3})) // 2.5
 * @ex Mth.median([]) // null
 * @see Mth.mean, Mth.min, Mth.max
 */
export function median(collection: Collection<number>): ?number {
  const sorted = Ar.sortUnstable(collection);
  const size = sorted.length;
  if (size === 0) {
    return null;
  }
  const middleIndex = idiv(size, 2);
  if (size % 2 === 0) {
    return (sorted[middleIndex - 1] + sorted[middleIndex]) / 2;
  }
  return sorted[middleIndex];
}

/**
 * Returns the sum of all values in `collection`.
 *
 * @time O(n)
 * @space O(1)
 * @ex Mth.sum([1, 2, 3]) // 6
 * @see Mth.product, sumFloat
 */
export function sum(collection: Collection<number>): number {
  let total = 0;
  for (const value of collection.values()) {
    total += value;
  }
  return total;
}

/**
 * Returns the product of all values in `collection`, 1 if it's empty.
 *
 * @time O(n)
 * @space O(1)
 * @ex Mth.product([2, 3, 4]) // 24
 * @ex Mth.product([]) // 1
 * @see Mth.sum
 */
export function product(collection: Collection<number>): number {
  let total = 1;
  for (const value of collection.values()) {
    total *= value;
  }
  return total;
}

/// Bases

/**
 * Returns an integer parsed from a valid `string` representation in given `base`, throws otherwise.
 *
 * `base` must be an integer between 2 and 36, throws otherwise.
 *
 * For bases greater than 10, characters A-Z can indicate numerals greater
 * than 9. `A` can stand for 10, `B` for 11 and so on up to `Z` for numeral 35.
 *
 * @time O(n)
 * @space O(1)
 * @ex Mth.fromBase('01000', 2) // 8
 * @ex Mth.fromBase('a01000', 2) // throws
 * @ex Mth.fromBase('01000a', 2) // throws
 * @ex Mth.fromBase('01000', 1) // throws
 */
export function fromBase(string: string, base: number): number {
  if (base < 2 || base > 36) {
    throw new RangeError(
      `Expected \`base\` between 2 and 36, but got \`${base}\``,
    );
  }
  if (!baseRegex(base).test(string)) {
    throw new Error(
      `Expected a valid representation in \`base\` \`${base}\`, but got \`${string}\``,
    );
  }
  return parseInt(string, base);
}

function baseRegex(base: number): RegExp {
  return new RegExp(
    `^[0-${
      base <= 10
        ? base - 1
        : `9A-${String.fromCharCode(54 + base)}a-${String.fromCharCode(
            86 + base,
          )}`
    }]+$`,
  );
}

/**
 * Returns a string representation in `resultBase` of a number parsed
 * from a `string` representation in given `inputBase`.
 *
 * `inputBase` and `resultBase` must be integers between 2 and 36, throws
 * otherwise.
 *
 * For bases greater than 10, characters A-Z can indicate numerals greater
 * than 9. `A` can stand for 10, `B` for 11 and so on up to `Z` for numeral 35.
 *
 * @time O(n)
 * @space O(1)
 * @ex Mth.baseConvert('01000', 2, 4) // '20'
 * @ex Mth.baseConvert('01000', 1, 4) // throws
 * @ex Mth.baseConvert('01000', 2, 38) // throws
 */
export function baseConvert(
  string: string,
  inputBase: number,
  resultBase: number,
): string {
  return toBase(fromBase(string, inputBase), resultBase);
}

/**
 * Returns a string representation of `number` in given `base`.
 *
 * `base` must be an integer between 2 and 36, throws otherwise.
 *
 * For bases greater than 10, characters A-Z indicate numerals greater
 * than 9. `A` stands for 10, `B` for 11 and so on up to `Z` for numeral 35.
 *
 * @time O(n)
 * @space O(1)
 * @ex Mth.toBase(42, 3) // '1120'
 */
export function toBase(number: number, base: number): string {
  return number.toString(base);
}
