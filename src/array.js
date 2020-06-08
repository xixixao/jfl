// @flow

'use strict';

import type {Collection, KeyedCollection, $Array} from './types.flow';

const Cl = require('./collection');

const EMPTY = []; // Returned whenever we can return an empty array

function m<V>(array: $Array<V>): $Array<V> {
  return array.length === 0 ? EMPTY : array;
}

/// Construction

// Create an array.
//
// Prefer array literal `[1, 2, 3]` unless you need a function, or you want
// an empty array, in which case use the memoized `Ar()`.
//
// @ex Ar(1, 2, 3)
// @alias create, constructor, new
// @see Ar.from
function Ar<V>(...args: $Array<V>): $Array<V> {
  return m(args);
}

// Convert any `collection` of values to an Array of values.
//
// Note that this is not a way to clone an array, if passed an array, the same
// array will be returned.
//
// @ex Ar.from(Set(1, 2, 3))
// @ex Ar.from(Mp({a: 1, b: 2, c: 3}))
// @alias values, fromValues
// @see Ar
Ar.from = exports.from = function from<V>(
  collection: Collection<V>,
): $Array<V> {
  if (Ar.isArray(collection)) {
    return (collection: any);
  }
  const result = [];
  for (const item of collection.values()) {
    result.push(item);
  }
  return m(result);
};

// Convert any `collection` of awaitable promises of values to a single
// promise of an Array of values.
//
// @ex Ar.fromAsync([(async () => 1)(), (async () => 2)()])
// @alias all
// @see Ar.from
Ar.fromAsync = exports.fromAsync = function fromAsync<V>(
  collection: Collection<Promise<V>>,
): Promise<$Array<V>> {
  return Promise.all(Ar.from(collection));
};

// Convert any `collection` with keys to an Array of keys.
//
// Notably the keys of a Set are just its values. The keys of an Array are
// its indices.
//
// @see Ar.from
Ar.keys = exports.keys = function keys<K>(
  collection: KeyedCollection<K, any>,
): $Array<K> {
  const result = [];
  for (const item of collection.keys()) {
    result.push(item);
  }
  return m(result);
};

// Convert any `collection` with keys to an Array of key value pairs.
//
// Notably the keys of a Set are just its values. The keys of an Array are
// its indices.
//
// @see Ar.from
Ar.entries = function entries<K, V>(
  collection: KeyedCollection<K, V>,
): $Array<[K, V]> {
  const result = [];
  for (const item of collection.entries()) {
    result.push(item);
  }
  return m(result);
};

// Create an array of numbers.
//
// The start of the range is inclusive, the end is exclusive. By default
// increments by 1.
//
// @ex Ar.range(1, 6)
// @ex Ar.range(-0.5, 0.51, 0.5)
// @see Ar.rangeInclusive, Ar.rangeDescending, Ar.rangeDynamic
Ar.range = function range(
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
};

// Create an array of numbers.
//
// A version of `Ar.range` where the end is inclusive.
//
// @ex Ar.range(-0.5, 0.5, 0.5)
// @see Ar.range
Ar.rangeInclusive = function rangeInclusive(
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
};

// Create an array of numbers.
//
// A version of `Ar.range` where the array of numbers has decreasing order. By
// default increments by -1.
//
// @ex Ar.range(5, 1)
// @ex Ar.range(2, 1, 0.2)
// @see Ar.range
Ar.rangeDescending = function rangeDescending(
  fromInclusive: number,
  toExclusive: number,
  step?: number = 1,
): $Array<number> {
  if (step < 0) {
    throw new Error(
      `\`step\` must be a positive number, got \`${step}\` instead`,
    );
  }
  const result = [];
  let current = fromInclusive;
  while (current > toExclusive) {
    result.push(current);
    current -= step;
  }
  return m(result);
};

// Create an array of numbers.
//
// A version of `Ar.range` where the array of numbers has increasing or
// decreasing order, depending on given range limits. Both limits are inclusive.
//
// @ex Ar.range(2, 6, 2)
// @ex Ar.range(6, 2, 2)
// @see Ar.range
Ar.rangeDynamic = function rangeDynamic(
  fromInclusive: number,
  toInclusive: number,
  step?: number = 1,
): $Array<number> {
  if (step < 0) {
    throw new Error(
      `\`step\` must be a positive number, got \`${step}\` instead`,
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
};

// Create an array filled with a number of given `value`s.
//
// The `value` will be referenced, not cloned.
//
// @ex Ar.repeat("value", 4)
// @see Ar.range, Seq.repeat
Ar.repeat = function repeat<V>(value: V, times: number): $Array<V> {
  const result = [];
  for (let i = 0; i < times; i++) {
    result.push(value);
  }
  return m(result);
};

// Create an array filled with results of `fn`.
//
// `fn` take as the first argument the index where the current invocation's
// result will be placed.
//
// @ex Ar.fill(4, i => i)
// @see Ar.repeat, Ar.range, Seq.fill
Ar.fill = function fill<V>(times: number, fn: number => V): $Array<V> {
  const result = [];
  for (let i = 0; i < times; i++) {
    result.push(fn(i));
  }
  return m(result);
};

// Create an array using a `seed` value and a function which given the seed
// returns an item to be contained in the array and a new seed value.
//
// To mark the end of the array, `fn` must return `null` or `undefined`.
//
// @ex Ar.generate(2, n => n < 64 ? [n, n * n] : null)
// @alias unfold, unreduce
// @see Seq.generate, KdSeq.generate
Ar.generate = function generate<V, S>(seed: S, fn: S => ?[V, S]): $Array<V> {
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
};

/// Checks

// Returns whether given value is an Array.
//
// @ex Ar.isArray([1, 2, 3])
// @see St.isSet, Mp.isMap
function isArray(argument: mixed): %checks {
  return Array.isArray(argument);
}
Ar.isArray = exports.isArray = isArray;

// Returns whether given Arrays are equal.
//
// All items must be strictly equal.
//
// @time O(n)
// @space O(1)
// @ex Ar.equals([1, 2], [1, 2])
// @see St.equals, Mp.equals, Cl.equals
Ar.equals = exports.equals = function equals<V>(
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
};

// Returns whether given Arrays and any nested collections are equal.
//
// Any contained collections must deeply equal, all other items must be
// strictly equal.
//
// @time O(n)
// @space O(1)
// @ex Ar.equalsNested([[1], [2], 3], [[1], [2], 3])
// @see St.equalsNested, Mp.equalsNested, Cl.equalsNested
Ar.equalsNested = exports.equalsNested = function equalsNested<V>(
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
};

/// Combine

// Concatenate multiple arrays together.
//
// @ex Ar.concat([1, 2], [3, 4])
// @alias join, union
// @see Ar.flatten
Ar.concat = function concat<V>(
  ...collections: $Array<Collection<V>>
): $Array<V> {
  return Ar.flatten(collections);
};

// Concatenate a collection of arrays together.
//
// @ex Ar.concat([1, 2], [3, 4])
// @alias join, union
// @see Ar.flatten
Ar.flatten = function flatten<V>(
  collectionOfArrays: Collection<Collection<V>>,
): $Array<V> {
  const result = [];
  for (const nested of collectionOfArrays.values()) {
    for (const item of nested.values()) {
      result.push(item);
    }
  }
  return m(result);
};

type $GetValue = <V>(Collection<V>) => V;

// Join collections into an array of tuples of values from each collection.
//
// The resulting array has the same length as the smallest given collection.
// Excess values are ignored.
//
// @ex Ar.zip([1, 2, 3], ['a', 'b', 'c'], [5, 6, 7])
// @alias zipAll
// @see Ar.zipWith
Ar.zip = function zip<V, Cs: $Array<Collection<mixed>>>(
  ...collections: Cs
): $Array<$TupleMap<Cs, $GetValue>> {
  if (collections.length < 1) {
    throw new Error('Expected at least one collection, got none instead.');
  }
  const first = collections[0];
  let zippedLength = Cl.count(first);
  for (const collection of collections) {
    zippedLength = Math.min(zippedLength, Cl.count(collection));
  }
  const result = Ar.fill(zippedLength, _ => []);
  for (const collection of collections) {
    let i = 0;
    for (const item of collection.values()) {
      (result[i]: any).push(item);
      i++;
    }
  }
  return m(result);
};

// Join mulptiple collections into an array of values resulting form calling
// `fn` on items from each collection.
//
// Note that this function has unusual order of arguments because JavaScript
// enforces that the rest parameter is the last one. The resulting array has
// the same length as the smallest given collection. Excess values are ignored.
//
// @ex Ar.zipWith((a, b, c) => a + b * c, [1, 2, 3], [5, 6, 7], [2, 4, 6])
// @see Ar.zip
Ar.zipWith = function zipWith<I, Cs: $Array<Collection<I>>, O>(
  fn: (...collections: $TupleMap<Cs, $GetValue>) => O,
  ...collections: Cs
): $Array<O> {
  return Ar.map(Ar.zip(...collections), tuple => fn(...tuple));
};

/// Select

// Return element at given index.
//
// Use this if you care about accurate typing (until JS type systems
// fix the typing of the built-in). Otherwise use `array[index]`.
//
// @ex Ar.get([], 1) // undefined
// @see Cl.at
Ar.get = function get<V>(array: $Array<V>, index: number): ?V {
  return array[index];
};

// Create a new array by filtering out values for which `fn` returns false.
//
// @ex Ar.filter([1, 2, 3], Mth.isOdd)
// @see Ar.map, Ar.filterNulls, Ar.findIndices
Ar.filter = function filter<V>(
  collection: Collection<V>,
  predicate: V => boolean,
): $Array<V> {
  const result = [];
  for (const item of collection.values()) {
    if (predicate(item)) {
      result.push(item);
    }
  }
  return m(result);
};

// Create a promise of an array by filtering out values in `collection`
// for which async `fn` returns false.
//
// Executes `predicate` on all items in `collection` concurrently.
//
// @ex Ar.filterAsync([1, 2, 3], async x => Mth.isOdd(x))
// @see Ar.filter, Ar.mapAsync
Ar.filterAsync = async function filterAsync<V>(
  collection: Collection<V>,
  predicate: V => Promise<boolean>,
): Promise<$Array<V>> {
  const filter = await Ar.mapAsync(collection, predicate);
  const result = [];
  let i = 0;
  for (const item of collection.values()) {
    if (filter[i]) {
      result.push(item);
    }
    i++;
  }
  return m(result);
};

// Create a new array by filtering out `null`s and `undefined`s.
//
// Here because its type is more specific then the generic `filter` function.
//
// @ex Ar.filterNulls([1, null, 3])
// @see Ar.filter
Ar.filterNulls = function filterNulls<V>(
  collection: Collection<?V>,
): $Array<V> {
  const result = [];
  for (const item of collection.values()) {
    if (item != null) {
      result.push(item);
    }
  }
  return m(result);
};

// TODO: This should probably be `findKeys`, and it's not in HSL,
// TODO: it would be something like keys(Dict\filter($x, $p))
// Create an array of indices of values passing given `predicateFn`.
//
// @ex Ar.findIndices([1, 2, 3], Mth.isOdd)
// @see Ar.filter
Ar.findIndices = function findIndices<V>(
  collection: Collection<V>,
  predicateFn: V => boolean,
): $Array<number> {
  const result = [];
  let i = 0;
  for (const item of collection.values()) {
    if (predicateFn(item)) {
      result.push(i);
    }
    i++;
  }
  return m(result);
};

// TODO: unique

// TODO: uniqueBy

// Create an array containing the first `n` items of `collection`.
//
// @ex Ar.take([1, 2, 3], 2)
// @see Ar.drop, Ar.splitAt, Ar.takeWhile
Ar.take = function take<V>(collection: Collection<V>, n: number): $Array<V> {
  let i = 0;
  const result = [];
  for (const item of collection.values()) {
    if (i >= n) {
      break;
    }
    result.push(item);
    i++;
  }
  return m(result);
};

// Create an array containing all but the first `n` items of `collection`.
//
// @ex Ar.drop([1, 2, 3], 2)
// @see Ar.take, Ar.splitAt, Ar.dropWhile
Ar.drop = function drop<V>(collection: Collection<V>, n: number): $Array<V> {
  let i = 0;
  const result = [];
  for (const item of collection.values()) {
    if (i >= n) {
      result.push(item);
    }
    i++;
  }
  return m(result);
};

/// Transform

// Create a new array by calling given `fn` on each value of `collection`.
//
// @ex Ar.map([1, 2], x => x * 2)
// @see Ar.mapAsync
Ar.map = function map<VFrom, VTo>(
  collection: Collection<VFrom>,
  fn: VFrom => VTo,
): $Array<VTo> {
  const result = [];
  for (const item of collection.values()) {
    result.push(fn(item));
  }
  return m(result);
};

// Create a promise of an array by calling given async `fn` on each value of
// `collection`.
//
// Executes `fn` on all items in `collection` concurrently.
//
// @ex await Ar.mapAsync([1, 2], async x => x * 2)
// @alias Promise.all, genMap
Ar.mapAsync = exports.mapAsync = function mapAsync<VFrom, VTo>(
  collection: Collection<VFrom>,
  fn: VFrom => Promise<VTo>,
): Promise<$Array<VTo>> {
  return Promise.all(Ar.map(collection, fn));
};

// Create a new array by calling given `fn` on each value of `collection` and
// flattening the results.
//
// Equivalent to using `map` followed by `flatten`, for simplicity and improved
// performance.
//
// @ex Ar.flatMap([1, 2], x => [x - 1, x + 1])
// @see Ar.mapAsync
Ar.flatMap = function flatMap<VFrom, VTo>(
  collection: Collection<VFrom>,
  fn: VFrom => Collection<VTo>,
): $Array<VTo> {
  const result = [];
  for (const item of collection.values()) {
    const mapped = fn(item);
    for (const mappedItem of mapped.values()) {
      result.push(mappedItem);
    }
  }
  return m(result);
};

// Create an array containing the items of `collection` in reverse order.
//
// @ex Ar.reverse([1, 2, 3])
// @alias flip
Ar.reverse = function reverse<V>(collection: Collection<V>): $Array<V> {
  const result = [];
  for (const item of collection.values()) {
    result.push(item);
  }
  return m(result.reverse());
};

// Create an array of values based on a reduction of given `collection`.
//
// Similar to `Cl.reduce` but instead of returning the final value accumulates
// all the intermediate accumulators.
//
// @ex Ar.scan([1, 2, 3, 4], 0, (acc, x) => acc + x)
// @see Cl.reduce
Ar.scan = function scan<I, O>(
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
};

/// Divide

// Create an array of arrays which are chunks of given `collection` of `size`.
//
// If the `collection` doesn't divide evenly, the final chunk we smaller than
// the rest.
//
// @ex Ar.chunk([1, 2, 3, 4, 5], 2)
// @see Ar.splitAt, Ar.partition
Ar.chunks = function chunks<V>(
  collection: Collection<V>,
  size: number,
): $Array<$Array<V>> {
  if (size < 1) {
    throw new Error(`Expected \`size\` to be greater than 0, got \`${size}\``);
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
};

// Create a tuple of Arrays containing items of `collection` which match and
// don't match `predicateFn` respectively.
//
// More effecient combination of `Ar.filter` and `Ar.filter` combined
// with `Fn.not`.
//
// @ex Ar.partition([1, 2, 3, 4], Mth.isEven)
// @alias split
// @see Mp.group
Ar.partition = function partition<V>(
  collection: Collection<V>,
  predicateFn: V => boolean,
): [$Array<V>, $Array<V>] {
  const positives = [];
  const negatives = [];
  for (const item of collection.values()) {
    if (predicateFn(item)) {
      positives.push(item);
    } else {
      negatives.push(item);
    }
  }
  return [m(positives), m(negatives)];
};

// Create an array containing a subset of values in `collection`.
//
// Note that this is not a way to clone an array, if given an array and indices
// corresponding to its full size it returns the original array.
//
// @ex Ar.slice([1, 2, 3, 4], 1, 3)
// @see Ar.splice
Ar.slice = function slice<V>(
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
  const result = [];
  let i = 0;
  for (const item of collection.values()) {
    if (end != null && i >= end) {
      break;
    }
    if (i >= startIndexInclusive) {
      result.push(item);
    }

    i++;
  }
  return m(result);
};

// Create an array containing a subset of values in `collection` with any given
// `item`s added.
//
// Note that unlikely Array.prototype.splice this function returns the new
// array, not the deleted items.
//
// @ex Ar.slice([1, 2, 3, 4], 1, 3)
// @see Ar.splice
Ar.splice = function splice<V>(
  collection: Collection<V>,
  startIndex: number,
  deleteCount?: number,
  ...items: $Array<V>
): $Array<V> {
  const result = [];
  for (const item of collection.values()) {
    result.push(item);
  }
  result.splice(startIndex, deleteCount, ...items);
  return m(result);
};

// Create a tuple of arrays containing the first `n` items
// and all but the first `n` items of given `collection`.
//
// @ex Ar.split([1, 2, 3], 2)
// @see Ar.drop, Ar.take, Ar.span
Ar.splitAt = function splitAt<V>(
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
};

// Create a tuple of arrays containing all the items of `collection` following
// and preceding the first item for which `fn` returns false.
//
// @ex Ar.span([1, 3, 4, 7], Mth.isOdd)
// @alias break
// @see Ar.splitAt
Ar.span = function span<V>(
  collection: Collection<V>,
  fn: V => boolean,
): [$Array<V>, $Array<V>] {
  const before = [];
  const after = [];
  let isBefore = true;
  for (const item of collection.values()) {
    isBefore = isBefore && fn(item);
    if (isBefore) {
      before.push(item);
    } else {
      after.push(item);
    }
  }
  return [m(before), m(after)];
};

// Create an array containing all the items of `collection` preceding the item
// for which `fn` returns false.
//
// @ex Ar.takeWhile([1, 3, 4, 7], Mth.isOdd)
// @see Ar.take
Ar.takeWhile = function takeWhile<V>(
  collection: Collection<V>,
  fn: V => boolean,
): $Array<V> {
  const result = [];
  for (const item of collection.values()) {
    if (!fn(item)) {
      break;
    }
    result.push(item);
  }
  return m(result);
};

// Create an array containing all the items of `collection` following and
// including the first item for which `fn` returns false.
//
// @ex Ar.dropWhile([1, 3, 4, 7], Mth.isOdd)
// @see Ar.drop
Ar.dropWhile = function dropWhile<V>(
  collection: Collection<V>,
  fn: V => boolean,
): $Array<V> {
  const result = [];
  let taking = false;
  for (const item of collection.values()) {
    taking = taking || !fn(item);
    if (taking) {
      result.push(item);
    }
  }
  return m(result);
};

/// Ordering

// Create an array of values in `collection` sorted.
//
// Uses string conversion and comparison by default. You can supply custom
// `compareFn`. This sort is stable at the cost of using more memory allocation.
//
// @ex Ar.sort([3, 2, 4, 1], (a, b) => b - a)
// @alias sortBy
// @see Ar.fastSort, Ar.numericalSort
Ar.sort = function sort<V>(
  collection: Collection<V>,
  compareFn?: (V, V) => number = defaultCompareFn,
): $Array<V> {
  const result: Array<[V, number]> = [];
  let i = 0;
  for (const item of collection.values()) {
    result.push([item, i]);
    i++;
  }
  result
    .sort(([a, ai], [b, bi]) => compareFn(a, b) || ai - bi)
    .forEach(([x], i) => {
      (result: any)[i] = x;
    });

  return m((result: any));
};

function defaultCompareFn(a: any, b: any): number {
  return a > b ? 1 : a < b ? -1 : 0;
}

// TODO: sortBy

// Create an array of numbers from `collection` sorted in ascending order.
//
// @ex Ar.numericalSort([3, 2, 4, 1])
// @see Ar.fastSort, Ar.sort
Ar.numericalSort = function numericalSort(
  collection: Collection<number>,
): $Array<number> {
  const result = [];
  for (const item of collection.values()) {
    result.push(item);
  }
  return m(result.sort((a, b) => a - b));
};

// TODO: numericalSortBy (not fast)

// Create an array of values in `collection` sorted.
//
// A version of `Ar.sort` which is not stable, but uses less memory allocations.
//
// @ex Ar.fastSort([3, 2, 4, 1], (a, b) => b - a)
// @see Ar.sort
Ar.fastSort = function fastSort<V>(
  collection: Collection<V>,
  compareFn?: (V, V) => number,
): $Array<V> {
  const result = [];
  for (const item of collection.values()) {
    result.push(item);
  }
  return m(result.sort(compareFn));
};

// TODO: fastSortBy

module.exports = Ar;
