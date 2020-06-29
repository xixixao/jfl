/**
 * @flow
 *
 * This module provides functions which operate on collections (`Array`s,
 * `Map`s, `Set`s) and return a scalar or key/value type.
 *
 * @ex import {Cl} from 'jfl'
 */

'use strict';

import type {Collection, KeyedCollection, $Array} from './types.flow';
import {defaultCompareFn} from './_internal';

import * as Ar from './array';
import * as Mp from './map';
import * as St from './set';

/// Check

/**
 * Returns whether given collections are equal.
 *
 * All items must be strictly equal.
 *
 * @time O(n)
 * @space O(1)
 * @ex Cl.equals([1, 2], [1, 2]) // true
 * @see Ar.equals, St.equals, Mp.equals
 */
export function equals<V, C: Collection<V>>(
  first: C,
  ...rest: $Array<C>
): boolean {
  const isArray = Ar.isArray(first);
  const isSet = St.isSet(first);
  const isMap = Mp.isMap(first);
  for (const compared of rest) {
    if (
      (isArray && !Ar.isArray(compared)) ||
      (isSet && !St.isSet(compared)) ||
      (isMap && !Mp.isMap(compared))
    ) {
      return false;
    }
  }
  const args: any = [first, ...rest];
  return isArray
    ? Ar.equals(...args)
    : isMap
    ? Mp.equals(...args)
    : St.equals(...args);
}

/**
 * Returns whether given collections and any nested collections are equal.
 *
 * Any contained collections must deeply equal, all other items must be
 * strictly equal.
 *
 * @time O(n)
 * @space O(1)
 * @ex Cl.equalsNested([[1], [2], 3], [[1], [2], 3]) // true
 * @see Ar.equalsNested, St.equalsNested, Mp.equalsNested
 */
export function equalsNested<C: mixed>(first: C, ...rest: $Array<C>): boolean {
  const isArray = Ar.isArray(first);
  const isSet = St.isSet(first);
  const isMap = Mp.isMap(first);
  for (const compared of rest) {
    if (
      (isArray && !Ar.isArray(compared)) ||
      (isSet && !St.isSet(compared)) ||
      (isMap && !Mp.isMap(compared)) ||
      (!isArray && !isSet && !isMap && compared !== first)
    ) {
      return false;
    }
  }
  const args: any = [first, ...rest];
  return isArray
    ? Ar.equalsNested(...args)
    : isMap
    ? Mp.equalsNested(...args)
    : isSet
    ? St.equalsNested(...args)
    : true;
}

/**
 * Returns true when `collection` is empty.
 *
 * @time O(1)
 * @space O(1)
 * @ex Cl.isEmpty($Ar()) // true
 * @ex Cl.isEmpty($Mp()) // true
 * @ex Cl.isEmpty($St()) // true
 * @see Cl.count, Str.isEmpty
 */
export function isEmpty<V>(collection: Collection<V>): boolean {
  return count(collection) === 0;
}

/**
 * Get the size of given `collection`.
 *
 * @time O(1)
 * @space O(1)
 * @ex Cl.count([1, 2, 3]) // 3
 * @ex Cl.count($Mp({a: 1, b: 3})) // 2
 * @alias length, size
 * @see Cl.isEmpty, Str.length
 */
export function count<V>(collection: Collection<V>): number {
  const size = (collection: any).size;
  return size != null ? size : (collection: any).length;
}

/**
 * Returns whether given `collection` contains given `value`.
 *
 * @time O(n) (O(1) for Sets)
 * @space O(1)
 * @ex Cl.contains([2, 4, 3], 1) // true
 * @ex Cl.contains($St(2, 4, 3), 4) // true
 * @ex Cl.contains($Mp({a: 1, b: 3}), 1) // true
 * @see Cl.findKey
 */
export function contains<V>(collection: Collection<V>, value: V): boolean {
  if (collection instanceof Set) {
    return collection.has(value);
  }
  for (const item of collection.values()) {
    if (value === item) {
      return true;
    }
  }
  return false;
}

/**
 * Returns whether given `key` exists in keyed `collection`.
 *
 * @time O(1)
 * @space O(1)
 * @ex Cl.containsKey([2, 4, 3], 1) // true
 * @ex Cl.containsKey($St(2, 4, 3), 4) // true
 * @ex Cl.containsKey($Mp({a: 1, b: 3}), 'a') // true
 * @see Cl.findKey
 */
export function containsKey<K, V>(
  collection: KeyedCollection<K, V>,
  key: K,
): boolean {
  if (Array.isArray(collection)) {
    return (key: any) in collection;
  } else {
    return (collection: any).has(key);
  }
}

declare function any(collection: Collection<boolean>): boolean;
declare function any<K, V>(
  collection: KeyedCollection<K, V>,
  predicateFn: (V, K) => boolean,
): boolean;

/**
 * Returns whether some values in `collection` satisfy `predicateFn`.
 *
 * When no `predicateFn` is given returns true when `collection` contains
 * at least one `true` value.
 *
 * @time O(n)
 * @space O(1)
 * @ex Cl.any([1, 5, 4], n => Mth.isEven(n)) // true
 * @ex Cl.any([true, false]) // true
 * @see Cl.every
 */
export function any(collection, predicateFn) {
  if (predicateFn == null) {
    for (const item of collection.values()) {
      if (item) {
        return true;
      }
    }
    return false;
  }
  for (const [key, item] of collection.entries()) {
    if (predicateFn(item, key, collection)) {
      return true;
    }
  }
  return false;
}

declare function every(collection: Collection<boolean>): boolean;
declare function every<K, V>(
  collection: KeyedCollection<K, V>,
  predicateFn: (V, K) => boolean,
): boolean;

/**
 * Returns whether all values in `collection` satisfy `predicateFn`.
 *
 * When no `predicateFn` is given returns true when `collection` contains
 * only `true` values.
 *
 * @time O(n)
 * @space O(1)
 * @ex Cl.every([], n => Mth.isOdd(n)) // true
 * @ex Cl.every([1, 5, 3], n => Mth.isOdd(n)) // true
 * @ex Cl.every([true, true]) // true
 * @see Cl.any
 */
export function every(collection, predicateFn) {
  if (predicateFn == null) {
    for (const item of collection.values()) {
      if (!item) {
        return false;
      }
    }
    return true;
  }
  for (const [key, item] of collection.entries()) {
    if (!predicateFn(item, key, collection)) {
      return false;
    }
  }
  return true;
}

/**
 * Returns whether given `collection` is sorted.
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
 * @time O(n)
 * @space O(1)
 * @ex Cl.isSorted([2, 4, 3]) // true
 * @ex Cl.isSorted($St('b', 'c', 'd')) // true
 * @see Ar.sort
 */
export function isSorted<V>(
  collection: Collection<V>,
  compareFn?: (a: V, b: V) => number = defaultCompareFn,
): boolean {
  const valueIterator = collection.values();
  const firstIteration = valueIterator.next();
  if (firstIteration.done) {
    return true;
  }
  let previous = firstIteration.value;
  for (const value of valueIterator) {
    if (compareFn(value, previous) < 0) {
      return false;
    }
    previous = value;
  }
  return true;
}

/**
 * Returns whether given `collection` is sorted by the scalar computed
 * by calling `scalarFn` on each value.
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
 * @time O(n)
 * @space O(1)
 * @ex Cl.isSortedBy([3, 4, 1, 2], n => n % 3) // true
 * @see Ar.sortBy
 */
export function isSortedBy<V, S>(
  collection: Collection<V>,
  scalarFn: V => S,
  compareFn?: (a: S, b: S) => number = defaultCompareFn,
): boolean {
  const valueIterator = collection.values();
  const firstIteration = valueIterator.next();
  if (firstIteration.done) {
    return true;
  }
  let previous = scalarFn(firstIteration.value);
  for (const value of valueIterator) {
    const next = scalarFn(value);
    if (compareFn(next, previous) < 0) {
      return false;
    }
    previous = next;
  }
  return true;
}

/// Select

/**
 * Returns the first value for which `predicateFn` returns true in `collection`,
 * if any.
 *
 * @time O(n)
 * @space O(1)
 * @ex Cl.find([2, 4], n => Mth.isOdd(n)) // null
 * @ex Cl.find([2, 4, 3], n => Mth.isOdd(n)) // 3
 * @see Cl.findX, Cl.findKey, Cl.findKeyX
 */
export function find<V>(
  collection: Collection<V>,
  predicateFn: V => boolean,
): ?V {
  for (const item of collection.values()) {
    if (predicateFn(item)) {
      return item;
    }
  }
  return null;
}

/**
 * Returns first value for which `predicateFn` returns true in `collection`.
 *
 * @time O(n)
 * @space O(1)
 * @ex Cl.findX([2, 4, 3], n => Mth.isOdd(n)) // 3
 * @see Cl.find, Cl.findKey, Cl.findKeyX
 */
export function findX<V>(
  collection: Collection<V>,
  predicateFn: V => boolean,
): V {
  for (const item of collection.values()) {
    if (predicateFn(item)) {
      return item;
    }
  }
  throw new Error(
    "Expected to find a value in collection matching given predicateFn, but didn't find one.",
  );
}

/**
 * Returns the key of the first value for which `predicateFn` returns true
 * in `collection`, if any.
 *
 * @time O(n)
 * @space O(1)
 * @ex Cl.findKey([2, 4, 3], n => Mth.isOdd(n)) // 2
 * @see Cl.find
 */
export function findKey<K, V>(
  collection: KeyedCollection<K, V>,
  predicateFn: (V, K) => boolean,
): ?K {
  for (const [key, item] of collection.entries()) {
    if (predicateFn(item, key)) {
      return key;
    }
  }
  return null;
}

/**
 * Returns the key of the first value for which `predicateFn` returns true
 * in `collection`.
 *
 * @time O(n)
 * @space O(1)
 * @ex Cl.findKeyX([2, 4, 3], n => Mth.isOdd(n)) // 2
 * @see Cl.find
 */
export function findKeyX<K, V>(
  collection: KeyedCollection<K, V>,
  predicateFn: (V, K) => boolean,
): K {
  for (const [key, item] of collection.entries()) {
    if (predicateFn(item, key)) {
      return key;
    }
  }
  throw new Error(
    "Expected to find a key in collection matching given predicateFn, but didn't find one.",
  );
}

/**
 * Returns the first value in `collection` if it's not empty, null otherwise.
 *
 * @time O(1)
 * @space O(1)
 * @ex Cl.first($Ar()) // null
 * @ex Cl.first([1, 3]) // 1
 * @see Cl.firstX
 */
export function first<V>(collection: Collection<V>): ?V {
  for (const item of collection.values()) {
    return item;
  }
  return null;
}

/**
 * Returns the first value in `collection` if it's not empty, throws otherwise.
 *
 * @time O(1)
 * @space O(1)
 * @ex Cl.firstX([1, 3]) // 1
 * @see Cl.first, Cl.onlyX
 */
export function firstX<V>(collection: Collection<V>): V {
  for (const item of collection.values()) {
    return item;
  }
  throw new Error('Expected a non-empty collection, was empty instead.');
}

/**
 * Returns the one and only value in `collection`, throws otherwise.
 *
 * @time O(1)
 * @space O(1)
 * @ex Cl.onlyX([1]) // 1
 * @ex Cl.onlyX([]) // throws
 * @ex Cl.onlyX([1, 2]) // throws
 * @see Cl.firstX
 */
export function onlyX<V>(collection: Collection<V>): V {
  const valueIterator = collection.values();
  const firstIteration = valueIterator.next();
  if (firstIteration.done) {
    throw new Error(
      'Expected exactly one item in collection, but the collection was empty.',
    );
  }
  const result = firstIteration.value;
  if (!valueIterator.next().done) {
    throw new Error(
      'Expected exactly one item in collection, but there were more',
    );
  }
  return result;
}

/**
 * Returns the last value in `collection` if it's not empty, null otherwise.
 *
 * @time O(n) (O(1) for Arrays)
 * @space O(1)
 * @ex Cl.last($Ar()) // null
 * @ex Cl.last([1, 3]) // 3
 * @see Cl.lastx
 */
export function last<V>(collection: Collection<V>): ?V {
  if (Array.isArray(collection)) {
    return collection[collection.length - 1];
  }
  let result = null;
  for (const item of collection.values()) {
    result = item;
  }
  return result;
}

/**
 * Returns the last value in `collection` if it's not empty, throws otherwise.
 *
 * @time O(n) (O(1) for Arrays)
 * @space O(1)
 * @ex Cl.lastX([1, 3]) // 3
 * @see Cl.last
 */
export function lastX<V>(collection: Collection<V>): V {
  if (isEmpty(collection)) {
    throw new Error('Expected a non-empty collection, was empty instead.');
  }
  if (Array.isArray(collection)) {
    return collection[collection.length - 1];
  }
  let result = null;
  for (const item of collection.values()) {
    result = item;
  }
  return (result: any);
}

/**
 * Returns the value at given iteration `index` or null.
 *
 * For accessing values using corresponding keys use `Map.prototype.get` or
 * `Set.prototype.has`, which are all correctly typed.
 *
 * @time O(n) (O(1) for Arrays)
 * @space O(1)
 * @ex Cl.at($St(), 2) // null
 * @ex Cl.at($St('a', 'b', 'c'), 2) // 'c'
 * @see Cl.atx, Cl.contains, Mp.getX
 */
export function at<V>(collection: Collection<V>, index: number): ?V {
  if (Array.isArray(collection)) {
    return collection[index];
  }
  let i = 0;
  for (const item of collection.values()) {
    if (i === index) {
      return item;
    }
    i++;
  }
  return null;
}

/**
 * Returns the value at given iteration index or throws.
 *
 * @time O(n) (O(1) for Arrays)
 * @space O(1)
 * @ex Cl.atX($St('a', 'b', 'c'), 2) // 'c'
 * @see Cl.at, Mp.getX
 */
export function atX<V>(collection: Collection<V>, index: number): V {
  if (isEmpty(collection)) {
    throw new Error('Expected a non-empty collection, was empty instead.');
  }
  if (Array.isArray(collection)) {
    return collection[index];
  }
  let i = 0;
  for (const item of collection.values()) {
    if (i === index) {
      return item;
    }
    i++;
  }
  return (null: any); // unreachable
}

/**
 * Returns the value at `index` as if iterating through the `collection` in
 * reverse order or null.
 *
 * @time O(n) (O(1) for Arrays)
 * @space O(1)
 * @ex Cl.atFromEnd([], 2) // null
 * @ex Cl.atFromEnd([1, 2, 3, 4], 0) // 4
 * @ex Cl.atFromEnd([1, 2, 3, 4], 3) // 1
 * @see Cl.at
 */
export function atFromEnd<V>(collection: Collection<V>, index: number): ?V {
  return at(collection, count(collection) - 1 - index);
}

/**
 * Returns the value at `index` as if iterating through the `collection` in
 * reverse order or throws.
 *
 * @time O(n) (O(1) for Arrays)
 * @space O(1)
 * @ex Cl.atFromEndX([1, 2, 3, 4], 0) // 4
 * @ex Cl.atFromEndX([1, 2, 3, 4], 3) // 1
 * @see Cl.at
 */
export function atFromEndX<V>(collection: Collection<V>, index: number): V {
  return atX(collection, count(collection) - 1 - index);
}

/**
 * Return element at `index` counting from start if it's positive and counting
 * from end if it's negative, with last element being at index `-1`.
 *
 * @time O(1)
 * @space O(1)
 * @ex Cl.atDynamic([1, 2, 3, 4], 0) // 1
 * @ex Cl.atDynamic([1, 2, 3, 4], -2) // 3
 * @see Cl.at
 */
export function atDynamic<V>(collection: Collection<V>, index: number): ?V {
  if (index < 0) {
    return at(collection, count(collection) + index);
  } else {
    return at(collection, index);
  }
}

/**
 * Returns the first key in `collection` if it's not empty, null otherwise.
 *
 * @time O(1)
 * @space O(1)
 * @ex Cl.firstKey($Mp()) // null
 * @ex Cl.firstKey($Mp({a: 1, b: 2})) // 'a'
 * @see Cl.firstKeyX
 */
export function firstKey<K, V>(collection: KeyedCollection<K, V>): ?K {
  for (const key of collection.keys()) {
    return key;
  }
  return null;
}

/**
 * Returns the first key in `collection` if it's not empty, throws otherwise.
 *
 * @time O(1)
 * @space O(1)
 * @ex Cl.firstKeyX($Mp({a: 1, b: 2})) // 1
 * @see Cl.firstKey
 */
export function firstKeyX<K, V>(collection: KeyedCollection<K, V>): K {
  for (const key of collection.keys()) {
    return key;
  }
  throw new Error('Expected a non-empty collection, was empty instead.');
}

/**
 * Returns the last key in `collection` if it's not empty, null otherwise.
 *
 * @time O(n)
 * @space O(1)
 * @ex Cl.lastKey($Mp()) // null
 * @ex Cl.lastKey($Mp({a: 1, b: 2})) // 'b'
 * @see Cl.lastKeyX
 */
export function lastKey<K, V>(collection: KeyedCollection<K, V>): ?K {
  let result = null;
  for (const item of collection.keys()) {
    result = item;
  }
  return result;
}

/**
 * Returns the last key in `collection` if it's not empty, throws otherwise.
 *
 * @time O(n)
 * @space O(1)
 * @ex Cl.lastKeyX($Mp({a: 1, b: 2})) // 'b'
 * @see Cl.lastKey
 */
export function lastKeyX<K, V>(collection: KeyedCollection<K, V>): K {
  if (isEmpty(collection)) {
    throw new Error('Expected a non-empty collection, was empty instead.');
  }
  let result = null;
  for (const item of collection.keys()) {
    result = item;
  }
  return (result: any);
}

/// Transform

/**
 * Execute `fn` for every value and key in `collection`.
 *
 * @time O(n)
 * @space O(1)
 * @ex Cl.forEach([1, 2, 3], (n, index, array) => {}) // void
 * @alias each
 */
export function forEach<K, V>(
  collection: KeyedCollection<K, V>,
  fn: (V, K, KeyedCollection<K, V>) => void,
): void {
  return collection.forEach(fn);
}

declare function reduce<K, V, A>(
  collection: KeyedCollection<K, V>,
  fn: (V, V, K, KeyedCollection<K, V>) => V,
): V;

declare function reduce<K, V, A>(
  collection: KeyedCollection<K, V>,
  fn: (A, V, K, KeyedCollection<K, V>) => A,
  initialValue: A,
): A;

/**
 * Reduce the collection to a single value using `fn`.
 *
 * If no `initialValue` is passed in, the collection must be non-empty.
 *
 * @time O(n)
 * @space O(1)
 * @ex Cl.reduce([2, 4, 3], (acc, x) => acc + x) // 9
 * @see Ar.scan
 */
export function reduce(collection, fn, initialValue) {
  const noInitialValue = arguments.length < 3;
  if (Ar.isArray(collection)) {
    if (noInitialValue) {
      return collection.reduce(fn);
    } else {
      return collection.reduce(fn, initialValue);
    }
  }
  const entriesIterator = collection.entries();
  let acc = noInitialValue ? entriesIterator.next().value[1] : initialValue;
  for (const [key, item] of entriesIterator) {
    acc = fn(acc, item, key, collection);
  }
  return acc;
}
