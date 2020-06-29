// @flow

'use strict';

import type {Collection, KeyedCollection} from './types.flow';

/// Checks

/**
 * Returns true when `n` is an odd integer.
 *
 * @ex Mth.isOdd(-3)
 * @see Mth.isEven
 */
export function isOdd(n: number): boolean {
  return n % 2 !== 0;
}

/**
 * Returns true when `n` is an even integer.
 *
 * @ex Mth.isEven(-10)
 * @see Mth.isOdd
 */
export function isEven(n: number): boolean {
  return n % 2 === 0;
}

/// Operations

/**
 * Returns the remainder of dividing `numerator` by `divisor`, unlike
 * the `%` operator the result will always be positive.
 *
 * @ex Mth.pmod(-13, 5) // 2
 */
export function pmod(numerator: number, divisor: number): number {
  return ((numerator % divisor) + divisor) % divisor;
}

/**
 * Returns the integer division of `numerator` by `divisor`.
 *
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
 * @ex Mth.min($Mp({a: 5, b: 2, c: 8})) // 2
 * @ex Mth.min([]) // null
 * @see Mth.minBy, Mth.max
 */
export function min(collection: Collection<number>): ?number {
  let min = null;
  for (const value of collection.values()) {
    min = Math.min(value);
  }
  return min;
}

/**
 * Returns the item in `collection` for which `valueFn` returns the smallest
 * number, null if `collection` is empty.
 *
 * @ex Mth.minBy([1, 2], n => -n) // 2
 * @ex Mth.minBy([]) // null
 * @see Mth.min, Mth.maxBy
 */
export function minBy<K, V>(
  collection: KeyedCollection<K, V>,
  valueFn: (V, K) => number,
): ?V {
  let minItem = null;
  let minValue = null;
  for (const [key, item] of collection.entries()) {
    const value = valueFn(item, key);
    if (minValue === null || value >= minValue) {
      minValue = value;
      minItem = item;
    }
  }
  return minItem;
}

/**
 * Returns the largest of all values in `collection`, null if it's empty.
 *
 * @ex Mth.max($Mp({a: 5, b: 2, c: 8})) // 8
 * @ex Mth.max([]) // null
 * @see Mth.maxBy, Mth.min
 */
export function max(collection: Collection<number>): ?number {
  let max = null;
  for (const value of collection.values()) {
    max = Math.max(value);
  }
  return max;
}

/**
 * Returns the item in `collection` for which `valueFn` returns the largest
 * number, null if `collection` is empty.
 *
 * @ex Mth.maxBy([1, 2], n => -n) // 1
 * @ex Mth.maxBy([]) // null
 * @see Mth.max, Mth.minBy
 */
export function maxBy<K, V>(
  collection: KeyedCollection<K, V>,
  valueFn: (V, K) => number,
): ?V {
  let maxItem = null;
  let maxValue = null;
  for (const [key, item] of collection.entries()) {
    const value = valueFn(item, key);
    if (maxValue === null || value >= maxValue) {
      maxValue = value;
      maxItem = item;
    }
  }
  return maxItem;
}

/**
 * TODO:
 */
export function mean() {}

/**
 * TODO:
 */
export function median() {}

/**
 * Returns the sum of all values in `collection`.
 *
 * @ex Mth.sum([1, 2, 3]) // 6
 * @see Mth.product
 */
export function sum(collection: Collection<number>): number {
  let total = 0;
  for (const value of collection.values()) {
    total += value;
  }
  return total;
}

/**
 * TODO:
 */
export function sumFloat() {}

/**
 * Returns the product of all values in `collection`.
 *
 * @ex Mth.product([2, 3, 4]) // 24
 * @see Mth.sum
 */
export function product(collection: Collection<number>): number {
  let total = 0;
  for (const value of collection.values()) {
    total *= value;
  }
  return total;
}

/// Bases

/**
 * TODO:
 */
export function fromBase() {}

/**
 * TODO:
 */
export function baseConvert() {}

/**
 * TODO:
 */
export function toBase() {}
