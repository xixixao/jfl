/**
 * @flow
 *
 * This module provides functions which operate on collections (`Array`s,
 * `Map`s, `Set`s) and return read-only (immutable) `Array`s.
 *
 * @ex import {Ar, $Ar} from 'jfl'
 */

'use strict';

import type {Collection, KeyedCollection, $Array} from './types.flow';

import {defaultCompareFn} from './_internal';
import * as Cl from './collection';
import * as Mp from './map';

const EMPTY = []; // Returned whenever we can return an empty array

function m<V>(array: $Array<V>): $Array<V> {
  return array.length === 0 ? EMPTY : array;
}

/// Construct

/**
 * Create an `Array`.
 *
 * Prefer array literal `[1, 2, 3]`. This function always returns a
 * reference to the same empty array when called with no arguments.
 *
 * @time O(n)
 * @space O(n)
 * @ex $Ar(1, 2, 3) // [1, 2, 3]
 * @alias create, constructor, new
 * @see Ar.from, $St, $Mp
 */
export function $Ar<V>(...args: $Array<V>): $Array<V> {
  return m(args);
}

/**
 * Convert any `collection` of values to an `Array` of values.
 *
 * Note that this is not a way to clone an Array, if passed an `Array`, the same
 * array will be returned.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.from(Set(1, 2, 3)) // [1, 2, 3]
 * @ex Ar.from(Mp({a: 1, b: 2, c: 3})) // [1, 2, 3]
 * @alias values, fromValues
 * @see Ar
 */
export function from<V>(collection: Collection<V>): $Array<V> {
  if (isArray(collection)) {
    return (collection: any);
  }
  return m(Array.from(collection.values()));
}

/**
 * Convert any `collection` of awaitable promises of values to a single
 * promise of an `Array` of values.
 *
 * @time O(n)
 * @space O(n)
 * @ex await Ar.fromAsync([(async () => 1)(), (async () => 2)()]) // [1, 2]
 * @alias all
 * @see Ar.from
 */
export function fromAsync<V>(
  collection: Collection<Promise<V>>,
): Promise<$Array<V>> {
  return Promise.all(from(collection));
}

/**
 * Convert any `collection` with keys to an `Array` of keys.
 *
 * Notably the keys of a `Set` are just its values. The keys of an `Array` are
 * its indices.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.keys([5, 6]) // [0, 1]
 * @ex Ar.keys($Mp({a: 2, b: 3})) // ['a', 'b']
 * @ex Ar.keys($St(3, 4) // [3, 4]
 * @see Ar.from, St.keys
 */
export function keys<K>(collection: KeyedCollection<K, any>): $Array<K> {
  return m(Array.from(collection.keys()));
}

/**
 * Convert any `collection` with keys to an `Array` of key value pairs.
 *
 * Notably the keys of a `Set` are just its values. The keys of an `Array` are
 * its indices.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.entries([5, 6]) // [[0, 5], [1, 6]]
 * @ex Ar.entries($Mp({a: 2, b: 3})) // [['a', 2], ['b', 3]]
 * @ex Ar.entries($St(3, 4) // [[3, 3], [4, 4]]
 * @see Ar.from
 */
export function entries<K, V>(
  collection: KeyedCollection<K, V>,
): $Array<[K, V]> {
  return m(Array.from(collection.entries()));
}

/**
 * Create an `Array` of numbers.
 *
 * The start of the range is inclusive, the end is exclusive. By default
 * increments by 1.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.range(1, 6) // [1, 2, 3, 4, 5]
 * @ex Ar.range(-0.5, 0.51, 0.5) // [-0.5, 0, 0.5]
 * @see Ar.rangeInclusive, Ar.rangeDescending, Ar.rangeDynamic
 */
export function range(
  fromInclusive: number,
  toExclusive: number,
  step?: number = 1,
): $Array<number> {
  if (step < 0) {
    throw new Error(
      `\`step\` must be a positive number, got \`${step}\` instead.`,
    );
  }
  const result = [];
  let current = fromInclusive;
  while (current < toExclusive) {
    result.push(current);
    current += step;
  }
  return m(result);
}

/**
 * Create an `Array` of numbers.
 *
 * A version of `Ar.range` where the end is inclusive.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.rangeInclusive(-0.5, 0.5, 0.5) // [-0.5, 0, 0.5]
 * @see Ar.range
 */
export function rangeInclusive(
  fromInclusive: number,
  toInclusive: number,
  step?: number = 1,
): $Array<number> {
  if (step < 0) {
    throw new Error(
      `\`step\` must be a positive number, got \`${step}\` instead.`,
    );
  }
  const result = [];
  let current = fromInclusive;
  while (current <= toInclusive) {
    result.push(current);
    current += step;
  }
  return m(result);
}

/**
 * Create an `Array` of numbers.
 *
 * A version of `Ar.range` where the array of numbers has decreasing order. By
 * default increments by -1.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.rangeDescending(5, 1) // [5, 4, 3, 2]
 * @ex Ar.rangeDescending(2, 1, 0.2) // [2, 1.8, 1.6, 1.4, 1.2]
 * @see Ar.range
 */
export function rangeDescending(
  fromInclusive: number,
  toExclusive: number,
  step?: number = 1,
): $Array<number> {
  if (step < 0) {
    throw new Error(
      `\`step\` must be a positive number, got \`${step}\` instead.`,
    );
  }
  const result = [];
  let current = fromInclusive;
  while (current > toExclusive) {
    result.push(current);
    current -= step;
  }
  return m(result);
}

/**
 * Create an `Array` of numbers.
 *
 * A version of `Ar.range` where the array of numbers has increasing or
 * decreasing order, depending on given range limits. Both limits are inclusive.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.rangeDynamic(2, 6, 2) // [2, 4, 6]
 * @ex Ar.rangeDynamic(6, 2, 2) // [6, 4, 2]
 * @see Ar.range
 */
export function rangeDynamic(
  fromInclusive: number,
  toInclusive: number,
  step?: number = 1,
): $Array<number> {
  if (step < 0) {
    throw new Error(
      `\`step\` must be a positive number, got \`${step}\` instead.`,
    );
  }
  const result = [];
  const ascending = fromInclusive < toInclusive;
  let current = fromInclusive;
  const end = toInclusive;
  const dynamicStep = ascending ? step : -step;
  while ((ascending && current <= end) || (!ascending && current >= end)) {
    result.push(current);
    current += dynamicStep;
  }
  return m(result);
}

/**
 * Create an `Array` filled with a `count` of given `value`s.
 *
 * The `value` will be referenced, not cloned.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.repeat(4, "a") // ["a", "a", "a", "a"]
 * @see Ar.range
 */
export function repeat<V>(value: V, count: number): $Array<V> {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(value);
  }
  return m(result);
}

/**
 * Create an `Array` filled with `count` results of calling `fn`.
 *
 * `fn` takeFirst as the first argument the index where the current invocation's
 * result will be placed.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.fill(4, i => i) // [0, 1, 2, 3]
 * @see Ar.repeat, Ar.range
 */
export function fill<V>(count: number, fn: number => V): $Array<V> {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(fn(i));
  }
  return m(result);
}

/**
 * Create a promise of an `Array` filled with `count` results of calling `fn`.
 *
 * `fn` takeFirst as the first argument the index where the current invocation's
 * result will be placed.
 *
 * @time O(n)
 * @space O(n)
 * @ex await Ar.fillAsync(4, async i => i) // [0, 1, 2, 3]
 * @see Ar.repeat, Ar.range
 */
export function fillAsync<V>(
  count: number,
  fn: number => Promise<V>,
): Promise<$Array<V>> {
  return Promise.all(fill(count, fn));
}

/**
 * Create an `Array` using a `seed` value and a function which given the seed
 * returns an item to be contained in the array and a new seed value.
 *
 * To mark the end of the array, `fn` must return `null` or `undefined`.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.generate(2, n => (n < 64 ? [n, n * n] : null)) // [2, 4, 16]
 * @alias unfold, unreduce
 * @see Ar.scan
 */
export function generate<V, S>(seed: S, fn: S => ?[V, S]): $Array<V> {
  const result = [];
  let acc = seed;
  while (true) {
    const maybeIteration = fn(acc);
    if (maybeIteration == null) {
      break;
    }
    const [item, newAcc] = maybeIteration;
    result.push(item);
    acc = newAcc;
  }
  return m(result);
}

/**
 * Convert any `collection` of values to a mutable `Array` of values.
 *
 * If an `Array` is given it will be cloned.
 *
 * This function is useful for complicated or performance sensitive computation
 * inside a function. Avoid passing arrays as mutable around your codebase
 * to prevent bugs.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.mutable($Ar(1, 2, 3)) // [1, 2, 3]
 * @see Ar.from
 */
export function mutable<V>(collection: Collection<V>): Array<V> {
  return Array.from(collection.values());
}

/// Check

/**
 * Returns whether given value is an `Array`.
 *
 * @time O(1)
 * @space O(1)
 * @ex Ar.isArray([1, 2, 3]) // true
 * @see St.isSet, Mp.isMap
 */
export function isArray(argument: mixed): %checks {
  return Array.isArray(argument);
}

/**
 * Returns whether given `Array`s are equal.
 *
 * All items must be strictly equal.
 *
 * @time O(n)
 * @space O(1)
 * @ex Ar.equals([1, 2], [1, 2]) // true
 * @see St.equals, Mp.equals, Cl.equals
 */
export function equals<V>(
  array: $Array<V>,
  ...arrays: $Array<$Array<V>>
): boolean {
  for (const compared of arrays) {
    if (compared === array) {
      continue;
    }
    if (compared.length !== array.length) {
      return false;
    }
    for (let i = 0; i < array.length; i++) {
      const value = array[i];
      if (compared[i] !== value) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Returns whether given `Array`s and any nested collections are equal.
 *
 * Any contained collections must deeply equal, all other items must be
 * strictly equal.
 *
 * @time O(n)
 * @space O(1)
 * @ex Ar.equalsNested([[1], [2], 3], [[1], [2], 3]) // true
 * @see St.equalsNested, Mp.equalsNested, Cl.equalsNested
 */
export function equalsNested<V>(
  array: $Array<V>,
  ...arrays: $Array<$Array<V>>
): boolean {
  for (const compared of arrays) {
    if (compared === array) {
      continue;
    }
    if (compared.length !== array.length) {
      return false;
    }
    for (let i = 0; i < array.length; i++) {
      const value = array[i];
      if (!Cl.equalsNested(compared[i], value)) {
        return false;
      }
    }
  }
  return true;
}

/// Select

/**
 * Create a new array by filtering out values from `collection for which
 * `predicateFn` returns false.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.filter([1, 2, 3], n => Mth.isOdd(n)) // [1, 3]
 * @see Ar.map, Ar.filterNulls, Ar.findIndices
 */
export function filter<K, V>(
  collection: KeyedCollection<K, V>,
  predicateFn: (V, K) => boolean,
): $Array<V> {
  const result = [];
  for (const [key, item] of collection.entries()) {
    if (predicateFn(item, key)) {
      result.push(item);
    }
  }
  return m(result);
}

/**
 * Create a promise of an `Array` by filtering out values in `collection`
 * for which async `predicateFn` returns false.
 *
 * Executes `predicateFn` on all items in `collection` concurrently.
 *
 * @time O(n)
 * @space O(n)
 * @ex await Ar.filterAsync([1, 2, 3], async x => Mth.isOdd(x)) // [1, 3]
 * @see Ar.filter, Ar.mapAsync
 */
export async function filterAsync<K, V>(
  collection: KeyedCollection<K, V>,
  predicateFn: (V, K) => Promise<boolean>,
): Promise<$Array<V>> {
  const filter = await mapAsync(collection, predicateFn);
  const result = [];
  let i = 0;
  for (const item of collection.values()) {
    if (filter[i]) {
      result.push(item);
    }
    i++;
  }
  return m(result);
}

/**
 * Create a new array by filtering out `null`s and `undefined`s from
 * `collection`.
 *
 * Here because its type is more specific then the generic `filter` function.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.filterNulls([1, null, 3]) // [1, 3]
 * @see Ar.filter
 */
export function filterNulls<V>(collection: Collection<?V>): $Array<V> {
  const result = [];
  for (const item of collection.values()) {
    if (item != null) {
      result.push(item);
    }
  }
  return m(result);
}

/**
 * Create an `Array` of keys corresponding to values passing given `predicateFn`.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.filterKeys([1, 2, 3], n => Mth.isOdd(n)) // [1, 3]
 * @see Ar.filter
 */
export function filterKeys<K, V>(
  collection: KeyedCollection<K, V>,
  predicateFn: V => boolean,
): $Array<K> {
  const result = [];
  for (const [key, item] of collection.entries()) {
    if (predicateFn(item)) {
      result.push(key);
    }
  }
  return m(result);
}

/**
 * Create an `Array` of values from `collection` with each value included only
 * once.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.unique([1, 2, 1]) // [1]
 * @see Ar.uniqueBy, St.from
 */
export function unique<V>(collection: Collection<V>): $Array<V> {
  return from(new Set(collection.values()));
}

/**
 * Create an `Array` of values from `collection` with each value included only
 * once, where value equivalence is determined by calling `identityFn` on
 * each value. Later values overwrite previous ones.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.uniqueBy([2, 4, 7], n => n % 3) // [2, 7]
 * @see Ar.unique
 */
export function uniqueBy<K, V>(
  collection: KeyedCollection<K, V>,
  identityFn: (V, K) => mixed,
): $Array<V> {
  return from(Mp.fromValues(collection, identityFn));
}

/**
 * Create an `Array` containing the first `n` items of `collection`.
 *
 * Throws if `n` is negative.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.takeFirst([1, 2, 3], 2) // [1, 2]
 * @see Ar.dropFirst, Ar.splitAt, Ar.takeFirstWhile
 */
export function takeFirst<V>(collection: Collection<V>, n: number): $Array<V> {
  if (n < 0) {
    throw new Error(`Expected \`n\` to not be negative, got \`${n}\`.`);
  }
  return slice(collection, 0, n);
}

/**
 * Create an `Array` containing all but the first `n` items of `collection`.
 *
 * Throws if `n` is negative.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.dropFirst([1, 2, 3], 2) // [3]
 * @see Ar.takeFirst, Ar.splitAt, Ar.dropFirstWhile
 */
export function dropFirst<V>(collection: Collection<V>, n: number): $Array<V> {
  if (n < 0) {
    throw new Error(`Expected \`n\` to not be negative, got \`${n}\`.`);
  }
  return slice(collection, n);
}

/**
 * Create an `Array` containing the last `n` items of `collection`.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.takeLast([1, 2, 3], 2) // [2, 3]
 * @see Ar.dropLast, Ar.splitAt, Ar.takeLastWhile
 */
export function takeLast<V>(collection: Collection<V>, n: number): $Array<V> {
  return slice(collection, -n);
}

/**
 * Create an `Array` containing all but the last `n` items of `collection`.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.dropLast([1, 2, 3], 2) // [1]
 * @see Ar.takeLast, Ar.splitAt, Ar.dropLastWhile
 */
export function dropLast<V>(collection: Collection<V>, n: number): $Array<V> {
  return slice(collection, 0, -n);
}

/**
 * Create an `Array` containing all the items of `collection` preceding the item
 * for which `predicateFn` returns false.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.takeFirstWhile([1, 3, 4, 7], Mth.isOdd) // [1]
 * @see Ar.takeFirst
 */
export function takeFirstWhile<K, V>(
  collection: KeyedCollection<K, V>,
  predicateFn: (V, K) => boolean,
): $Array<V> {
  const result = [];
  for (const [key, item] of collection.entries()) {
    if (!predicateFn(item, key)) {
      break;
    }
    result.push(item);
  }
  return m(result);
}

/**
 * Create an `Array` containing all the items of `collection` following and
 * including the first item for which `predicateFn` returns false.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.dropFirstWhile([1, 3, 4, 7], Mth.isOdd) // [3, 4, 7]
 * @see Ar.dropFirst
 */
export function dropFirstWhile<K, V>(
  collection: KeyedCollection<K, V>,
  predicateFn: (V, K) => boolean,
): $Array<V> {
  const result = [];
  let taking = false;
  for (const [key, item] of collection.entries()) {
    taking = taking || !predicateFn(item, key);
    if (taking) {
      result.push(item);
    }
  }
  return m(result);
}

/**
 * Create an `Array` containing all the items of `collection` following
 * the first item when iterating from the end for which `predicateFn`
 * returns false.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.takeLastWhile([1, 3, 4, 5, 7], Mth.isOdd) // [5, 7]
 * @see Ar.takeFirstWhile, Ar.dropLastWhile
 */
export function takeLastWhile<V>(
  collection: Collection<V>,
  predicateFn: V => boolean,
): $Array<V> {
  let result = Array.from(collection.values());
  result.reverse();
  for (let i = 0; i < result.length; i++) {
    if (predicateFn(result[i])) {
      continue;
    }
    result.splice(i);
    break;
  }
  result.reverse();
  return m(result);
}

/**
 * Create an `Array` containing all the items of `collection` preceding and
 * including the first item when iterating from the end for which `predicateFn`
 * returns false.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.dropLastWhile([1, 3, 4, 7], Mth.isOdd) // [1, 3, 4]
 * @see Ar.dropFirstWhile
 */
export function dropLastWhile<V>(
  collection: Collection<V>,
  predicateFn: V => boolean,
): $Array<V> {
  let result = Array.from(collection.values());
  result.reverse();
  for (let i = 0; i < result.length; i++) {
    if (predicateFn(result[i])) {
      continue;
    }
    result.splice(0, i);
    break;
  }
  result.reverse();
  return m(result);
}

/// Divide

/**
 * Create an array of `Array`s which are chunks of given `collection` of given
 * `size`.
 *
 * If the `collection` doesn't divide evenly, the final chunk will be smaller
 * than the rest.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 * @see Ar.splitAt, Ar.partition
 */
export function chunk<V>(
  collection: Collection<V>,
  size: number,
): $Array<$Array<V>> {
  if (size < 1) {
    throw new Error(`Expected \`size\` to be greater than 0, got \`${size}\`.`);
  }
  const result = [];
  let chunk = [];
  let i = 0;
  for (const item of collection.values()) {
    if (i >= size) {
      i = 0;
      result.push(chunk);
      chunk = [];
    }
    chunk.push(item);
    i++;
  }
  if (chunk.length > 0) {
    result.push(chunk);
  }
  return m(result);
}

/**
 * Create a tuple of `Array`s containing items of `collection` which match and
 * don't match `predicateFn` respectively.
 *
 * More effecient than using multiple `Ar.filter` calls.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.partition([1, 2, 3, 4], x => Mth.isEven(x)) // [[2, 4], [1, 3]]
 * @alias split
 * @see Mp.group
 */
export function partition<K, V>(
  collection: KeyedCollection<K, V>,
  predicateFn: (V, K) => boolean,
): [$Array<V>, $Array<V>] {
  const positives = [];
  const negatives = [];
  for (const [key, item] of collection.entries()) {
    if (predicateFn(item, key)) {
      positives.push(item);
    } else {
      negatives.push(item);
    }
  }
  return [m(positives), m(negatives)];
}

/**
 * Create an `Array` containing a subset of values in `collection`.
 *
 * Note that this is not a way to clone an Array, if given an `Array` and indices
 * corresponding to its full size it returns the original array.
 *
 * Either index can be negative, in which case they are counted from the end
 * of the `collection`, with last element being at index `-1`.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.slice([1, 2, 3, 4, 5], 1, 2) // [2, 3]
 * @ex Ar.slice([1, 2, 3, 4, 5], -3, -1) // [3, 4]
 * @see Ar.takeFirst, Ar.dropFirst, Ar.splice
 */
export function slice<V>(
  collection: Collection<V>,
  startIndexInclusive: number,
  endIndexExclusive?: number,
): $Array<V> {
  if (Array.isArray(collection)) {
    if (
      startIndexInclusive === 0 &&
      (endIndexExclusive == null || endIndexExclusive === Cl.count(collection))
    ) {
      return collection;
    }
    return collection.slice(startIndexInclusive, endIndexExclusive);
  }
  const end =
    endIndexExclusive != null && endIndexExclusive < 0
      ? Cl.count(collection) + endIndexExclusive
      : endIndexExclusive;
  const start =
    startIndexInclusive < 0
      ? Cl.count(collection) + startIndexInclusive
      : startIndexInclusive;
  const result = [];
  let i = 0;
  for (const item of collection.values()) {
    if (end != null && i >= end) {
      break;
    }
    if (i >= start) {
      result.push(item);
    }
    i++;
  }
  return m(result);
}

/**
 * Create an `Array` containing a subset of values in `collection` with any
 * given `item`s added, with `deleteCount` original values removed.
 *
 * Note that unlikely `Array.prototype.splice` this function returns the new
 * array, not the deleted items.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.splice([1, 2, 3, 4], 1, 2, 5, 6) // [1, 5, 6, 4]
 * @see Ar.splice
 */
export function splice<V>(
  collection: Collection<V>,
  startIndex: number,
  deleteCount?: number,
  ...items: $Array<V>
): $Array<V> {
  const result = Array.from(collection.values());
  result.splice(startIndex, deleteCount, ...items);
  return m(result);
}

/**
 * Create a tuple of arrays containing the first `n` items
 * and all but the first `n` items of given `collection`.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.splitAt([1, 2, 3], 2) // [[1, 2], [3]]
 * @see Ar.dropFirst, Ar.takeFirst, Ar.span
 */
export function splitAt<V>(
  collection: Collection<V>,
  n: number,
): [$Array<V>, $Array<V>] {
  let i = 0;
  const before = [];
  const after = [];
  for (const item of collection.values()) {
    if (i < n) {
      before.push(item);
    } else {
      after.push(item);
    }
    i++;
  }
  return [m(before), m(after)];
}

/**
 * Create two arrays, the first containing all the items of `collection`
 * preceding the first item for which `predicateFn` returns false, the second
 * containing the rest.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.span([1, 3, 4, 7], Mth.isOdd) // [[1], [3, 4, 7]]
 * @alias break
 * @see Ar.splitAt, Ar.takeFirstWhile, Ar.dropFirstWhile
 */
export function span<K, V>(
  collection: KeyedCollection<K, V>,
  predicateFn: (V, K) => boolean,
): [$Array<V>, $Array<V>] {
  const before = [];
  const after = [];
  let isBefore = true;
  for (const [key, item] of collection.entries()) {
    isBefore = isBefore && predicateFn(item, key);
    if (isBefore) {
      before.push(item);
    } else {
      after.push(item);
    }
  }
  return [m(before), m(after)];
}

/// Combine

/**
 * Create a new array containing `item` followed values of `collection`.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.prepend([2, 3], 1) // [1, 2, 3]
 * @alias unshift
 * @see Ar.append
 */
export function prepend<V>(collection: Collection<V>, item: V): $Array<V> {
  const result = Array.from(collection.values());
  result.unshift(item);
  return result;
}

/**
 * Create a new array containing values of `collection` followed by `item`.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.append([1, 2], 3) // [1, 2, 3]
 * @alias push
 * @see Ar.prepend
 */
export function append<V>(collection: Collection<V>, item: V): $Array<V> {
  const result = Array.from(collection.values());
  result.push(item);
  return result;
}

/**
 * Concatenate multiple arrays together.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.concat([1, 2], [3, 4]) // [1, 2, 3, 4]
 * @alias join, union
 * @see Ar.flatten
 */
export function concat<V>(...collections: $Array<Collection<V>>): $Array<V> {
  return flatten(collections);
}

/**
 * Concatenate a collection of arrays together.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.flatten([[1, 2], [3, 4]]) // [1, 2, 3, 4]
 * @alias join, union
 * @see Ar.flatten
 */
export function flatten<V>(
  collectionOfArrays: Collection<Collection<V>>,
): $Array<V> {
  const result = [];
  for (const nested of collectionOfArrays.values()) {
    for (const item of nested.values()) {
      result.push(item);
    }
  }
  return m(result);
}

type TupleOfValues<Cs> = $TupleMap<Cs, <V>(Collection<V>) => V>;

/**
 * Join `collections` into an `Array` of tuples of values from each collection.
 *
 * The resulting array has the same length as the smallest given collection.
 * Excess values are ignored.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.zip([1, 2], ['a', 'b'], [5, 6]) // [[1, 'a', 5], [2, 'b', 6]]
 * @alias zipAll
 * @see Ar.zipWith, Ar.unzip, Mp.zip
 */
export function zip<Cs: $Array<Collection<mixed>>>(
  ...collections: Cs
): $Array<TupleOfValues<Cs>> {
  if (collections.length < 1) {
    throw new Error('Expected at least one collection, got none instead.');
  }
  const first = collections[0];
  let zippedLength = Cl.count(first);
  for (const collection of collections) {
    zippedLength = Math.min(zippedLength, Cl.count(collection));
  }
  const result = fill(zippedLength, _ => []);
  for (const collection of collections) {
    let i = 0;
    for (const item of collection.values()) {
      if (i >= zippedLength) {
        break;
      }
      (result[i]: any).push(item);
      i++;
    }
  }
  return m(result);
}

/**
 * Join multiple `collections` into an `Array` of values resulting from calling
 * `fn` on items from each collection.
 *
 * Note that this function has unusual order of arguments because JavaScript
 * enforces that the rest parameter is the last one. The resulting array has
 * the same length as the smallest given collection. Excess values are ignored.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.zipWith((a, b) => a * b, [1, 2, 3], [5, 6, 7]) // [5, 12, 21]
 * @see Ar.zip
 */
export function zipWith<I, Cs: $Array<Collection<I>>, O>(
  fn: (...collections: TupleOfValues<Cs>) => O,
  ...collections: Cs
): $Array<O> {
  return map(zip(...collections), tuple => fn(...tuple));
}

/**
 * Join a `collection` of tuples into a tuple of `Array`s.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.unzip([[1, 'a', 5], [2, 'b', 6]]) // [[1, 2], ['a', 'b'], [5, 6]]
 * @see Ar.zip, Ar.zipWith, Mp.fromEntries
 */
export function unzip<T: $Array<mixed>>(
  collection: Collection<T>,
): $TupleMap<T, <V>(V) => $Array<V>> {
  const first = Cl.first(collection);
  if (first == null) {
    throw new Error('Expected at least one tuple, got none instead.');
  }
  let zippedLength = Cl.count(first);
  const result = fill(zippedLength, _ => []);
  for (const tuple of collection.values()) {
    let i = 0;
    for (const item of tuple.values()) {
      (result[i]: any).push(item);
      i++;
    }
  }
  return (m(result): any);
}

/**
 * Join `collections` into an `Array` of tuples of values of all combinations
 * from each collection.
 *
 * The resulting array has the length which is the product of the lengths
 * of each collection.
 *
 * @time O(n*m)
 * @space O(n*m)
 * @ex Ar.product([1, 2], ['a', 'b']) // [[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']]
 * @alias zipAll
 * @see Ar.zipWith
 */
export function product<Cs: $Array<Collection<mixed>>>(
  ...collections: Cs
): $Array<TupleOfValues<Cs>> {
  if (collections.length < 1) {
    throw new Error('Expected at least one collection, got none instead.');
  }
  let result: Array<Array<mixed>> = [[]];
  for (const collection of collections) {
    let newResult = [];
    for (const item of collection.values()) {
      for (const tuple of result) {
        newResult.push(tuple.concat([item]));
      }
    }
    result = newResult;
  }
  return m(result);
}

/// Transform

/**
 * Create a new array by calling given `fn` on each value of `collection`.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.map([1, 2], x => x * 2) // [2, 4]
 * @see Ar.mapAsync
 */
export function map<KFrom, VFrom, VTo>(
  collection: KeyedCollection<KFrom, VFrom>,
  fn: (VFrom, KFrom) => VTo,
): $Array<VTo> {
  const result = [];
  for (const [key, item] of collection.entries()) {
    result.push(fn(item, key));
  }
  return m(result);
}

/**
 * Create a promise of an `Array` by calling given async `fn` on each value of
 * `collection`.
 *
 * Executes `fn` on all items in `collection` concurrently.
 *
 * @time O(n)
 * @space O(n)
 * @ex await Ar.mapAsync([1, 2], async x => x * 2) // [2, 4]
 * @alias Promise.all, genMap
 */
export function mapAsync<KFrom, VFrom, VTo>(
  collection: KeyedCollection<KFrom, VFrom>,
  fn: (VFrom, KFrom) => Promise<VTo>,
): Promise<$Array<VTo>> {
  return Promise.all(map(collection, fn));
}

/**
 * Create a new array by calling given `fn` on each value of `collection` and
 * and including the result if it is not null or undefined.
 *
 * Equivalent to using `map` followed by `filterNulls`, for simplicity and
 * improved performance.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.mapMaybe([1, 2, 3], x => Math.isOdd(x) ? x * x : null) // [1, 9]
 * @see Ar.mapFlat
 */
export function mapMaybe<KFrom, VFrom, VTo>(
  collection: KeyedCollection<KFrom, VFrom>,
  fn: (VFrom, KFrom) => ?VTo,
): $Array<VTo> {
  const result = [];
  for (const [key, item] of collection.entries()) {
    const mapped = fn(item, key);
    if (mapped != null) {
      result.push(mapped);
    }
  }
  return m(result);
}

/**
 * Create a new array by calling given `fn` on each value of `collection` and
 * flattening the results.
 *
 * Equivalent to using `map` followed by `flatten`, for simplicity and improved
 * performance.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.mapFlat([1, 2], x => [x - 1, x + 1]) // [0, 2, 1, 3]
 * @see Ar.mapMaybe
 */
export function mapFlat<KFrom, VFrom, VTo>(
  collection: KeyedCollection<KFrom, VFrom>,
  fn: (VFrom, KFrom) => Collection<VTo>,
): $Array<VTo> {
  const result = [];
  for (const [key, item] of collection.entries()) {
    const mapped = fn(item, key);
    for (const mappedItem of mapped.values()) {
      result.push(mappedItem);
    }
  }
  return m(result);
}

/**
 * Create an `Array` of values based on a reduction of given `collection`.
 *
 * Similar to `Cl.reduce` but instead of returning the final value accumulates
 * all the intermediate accumulators.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.scan([1, 2, 3, 4], 0, (acc, x) => acc + x) // [1, 3, 6, 10]
 * @see Cl.reduce
 */
export function scan<I, O>(
  collection: Collection<I>,
  initialValue: O,
  fn: (O, I) => O,
): $Array<O> {
  const result = [];
  let acc = initialValue;
  for (const item of collection.values()) {
    acc = fn(acc, item);
    result.push(acc);
  }
  return m(result);
}

/// Order

/**
 * Create an `Array` containing the items of `collection` in reverse order.
 *
 * @time O(n)
 * @space O(n)
 * @ex Ar.reverse([1, 2, 3]) // [3, 2, 1]
 */
export function reverse<V>(collection: Collection<V>): $Array<V> {
  return m(Array.from(collection.values()).reverse());
}

/**
 * Create an `Array` of values in `collection` sorted.
 *
 * The result of calling `compareFn` on values `a` and `b` determines their
 * order:
 *   negative number: `a`, `b`
 *   positive number: `b`, `a`
 *   zero: the order stays the same as it was in `collection`
 * The default `compareFn` is `(a, b) => a > b ? 1 : a < b ? -1 : 0`,
 * which sorts numbers and strings in ascending order (from small to large,
 * from early in the alphabet to later in the alphabet).
 *
 * This sort preserves the order of elements when `compareFn` returns 0 at
 * the cost of using more memory.
 *
 * @time Worst case O(n^2)
 * @space O(n)
 * @ex Ar.sort([3, 2, 4, 1]) // [1, 2, 3, 4]
 * @ex Ar.sort(['c', 'b', 'd', 'a']) // ['a', 'b', 'c', 'd']
 * @see Ar.sortBy, Ar.sortUnstable
 */
export function sort<K, V>(
  collection: KeyedCollection<K, V>,
  compareFn?: (
    aItem: V,
    bItem: V,
    aKey: K,
    bKey: K,
  ) => number = defaultCompareFn,
): $Array<V> {
  const result: Array<[V, K, number]> = [];
  let i = 0;
  for (const [key, item] of collection.entries()) {
    result.push([item, key, i]);
    i++;
  }
  result
    .sort(
      ([aItem, aKey, ai], [bItem, bKey, bi]) =>
        compareFn(aItem, bItem, aKey, bKey) || ai - bi,
    )
    .forEach(([item], i) => {
      (result: any)[i] = item;
    });

  return m((result: any));
}

/**
 * Create an `Array` of values in `collection` sorted by the scalar computed
 * by calling `scalarFn` on each value.
 *
 * The result of calling `compareFn` on scalars `a` and `b` determines the
 * order of the corresponding values:
 *   negative number: `a`, `b`
 *   positive number: `b`, `a`
 *   zero: the order stays the same as it was in `collection`
 * The default `compareFn` is `(a, b) => a > b ? 1 : a < b ? -1 : 0`,
 * which sorts numbers and strings in ascending order (from small to large,
 * from early in the alphabet to later in the alphabet).
 *
 * This sort preserves the order of elements when `compareFn` returns 0 at
 * the cost of using more memory.
 *
 * @time Worst case O(n^2)
 * @space O(n)
 * @ex Ar.sortBy([3, 2, 4, 1], n => n % 3) // [3, 4, 1, 2]
 * @see Ar.sort
 */
export function sortBy<K, V, S>(
  collection: KeyedCollection<K, V>,
  scalarFn: (V, K) => S,
  compareFn?: (a: S, b: S) => number = defaultCompareFn,
): $Array<V> {
  const result: Array<[V, S, number]> = [];
  let i = 0;
  for (const [key, item] of collection.entries()) {
    result.push([item, scalarFn(item, key), i]);
    i++;
  }
  result
    .sort(([_aItem, a, ai], [_bItem, b, bi]) => compareFn(a, b) || ai - bi)
    .forEach(([item], i) => {
      (result: any)[i] = item;
    });

  return m((result: any));
}

/**
 * Create an `Array` of values in `collection` sorted.
 *
 * This sort doesn't preserve the order of elements when `compareFn` returns 0
 * and is more memory efficient than `Ar.sort`.
 *
 * The result of calling `compareFn` on values `a` and `b` determines their
 * order:
 *   negative number: `a`, `b`
 *   positive number: `b`, `a`
 *   zero: the order is undetermined
 * The default `compareFn` is `(a, b) => a > b ? 1 : a < b ? -1 : 0`,
 * which sorts numbers and strings in ascending order (from small to large,
 * from early in the alphabet to later in the alphabet).
 *
 * @time Worst case O(n^2)
 * @space O(n)
 * @ex Ar.sortUnstable([3, 2, 4, 1]) // 1, 2, 3, 4
 * @see Ar.sort
 */
export function sortUnstable<V>(
  collection: Collection<V>,
  compareFn?: (V, V) => number = defaultCompareFn,
): $Array<V> {
  return m(Array.from(collection.values()).sort(compareFn));
}
