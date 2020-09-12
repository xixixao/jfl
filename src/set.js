/**
 * @flow
 *
 * This module provides functions which operate on collections (`Array`s,
 * `Map`s, `Set`s) and return read-only (immutable) `Set`s.
 *
 * @ex import {St, $St} from 'jfl'
 */

'use strict';

import type {Collection, KeyedCollection, $Array, $Set} from './types.flow';

import * as Cl from './collection';
import * as Ar from './array';

const EMPTY = new Set(); // Returned whenever we can return an empty set

function m<V>(set: $Set<V>): $Set<V> {
  return set.size === 0 ? (EMPTY: any) : set;
}

/// Construction

/**
 * Create a `Set`.
 *
 * Can contain any JS value. Maintains uniqueness.
 *
 * @ex $St(1, 2, 3) // Set {1, 2, 3}
 * @alias create, constructor, new
 * @see St.from
 */
export function $St<V>(...args: $Array<V>): $Set<V> {
  return m(new Set(args));
}

/**
 * Convert any `collection` of values to a `Set` of values.
 *
 * Note that this is not a way to clone a Set, if passed a `Set`, the same
 * set will be returned.
 *
 * @ex St.from([1, 2, 3]) // $St(1, 2, 3)
 * @ex St.from($Mp({a: 1, b: 2, c: 3})) // $St(1, 2, 3)
 * @alias values, fromValues
 * @see St
 */
export function from<V>(collection: Collection<V>): $Set<V> {
  if (isSet(collection)) {
    return collection;
  }
  return m(new Set(collection.values()));
}

/**
 * Convert any `collection` with keys to a `Set` of keys.
 *
 * Notably the keys of a `Set` are just its values. The keys of an `Array` are
 * its indices.
 *
 * @time O(n)
 * @space O(n)
 * @ex St.keys([5, 6]) // $St(0, 1)
 * @ex St.keys($Mp({a: 2, b: 3})) // $St('a', 'b')
 * @ex St.keys($St(3, 4) // $St(3, 4)
 * @see St.from, Ar.keys
 */
export function keys<K>(collection: KeyedCollection<K, any>): $Set<K> {
  return m(new Set(collection.keys()));
}

/**
 * Convert any `collection` of awaitable promises of values to a single
 * promise of a `Set` of values.
 *
 * @ex St.fromAsync([(async () => 1)(), (async () => 2)()]) // $St(1, 2)
 * @alias all
 * @see St.from, Ar.fromAsync
 */
export async function fromAsync<V>(
  collection: Collection<Promise<V>>,
): Promise<$Set<V>> {
  return m(new Set(await Ar.fromAsync(collection)));
}

/**
 * Convert any `collection` of values to a mutable `Set` of values.
 *
 * If a `Set` is given it will be cloned.
 *
 * @ex St.mutable($St(1, 2, 3)) // Set {1, 2, 3}
 * @see St.from
 */
export function mutable<V>(collection: Collection<V>): Set<V> {
  return new Set(collection.values());
}

/// Checks

/**
 * Returns whether given argument is a `Set`.
 *
 * @ex St.isSet($St(1, 2, 3)) // true
 * @see Ar.isArray, Mp.isMap
 */
export function isSet(argument: mixed): %checks {
  return argument instanceof Set;
}

/**
 * Returns whether given `Set`s are equal.
 *
 * All items must be strictly equal.
 *
 * @time O(n)
 * @space O(1)
 * @ex St.equals([1, 2], [1, 2]) // true
 * @see Ar.equals, Mp.equals, Cl.equals
 */
export function equals<V>(set: $Set<V>, ...sets: $Array<$Set<V>>): boolean {
  const inOrder = Ar.from(set);
  for (let ai = 0; ai < sets.length; ai++) {
    const compared = sets[ai];
    if (compared === set) {
      continue;
    }
    if (compared.size !== set.size) {
      return false;
    }
    let i = 0;
    for (const item of compared) {
      if (item !== inOrder[i]) {
        return false;
      }
      i++;
    }
  }
  return true;
}

/**
 * Returns whether given `Set`s contain the same values.
 *
 * All items must be strictly equal.
 *
 * @time O(n)
 * @space O(1)
 * @ex St.equalsOrderIgnored([1, 2], [2, 1]) // true
 * @see Sr.equals
 */
export function equalsOrderIgnored<V>(
  set: $Set<V>,
  ...sets: $Array<$Set<V>>
): boolean {
  for (let ai = 0; ai < sets.length; ai++) {
    const compared = sets[ai];
    if (compared === set) {
      continue;
    }
    if (compared.size !== set.size) {
      return false;
    }
    for (const item of compared) {
      if (!compared.has(item)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Returns whether given `Set`s and any nested collections are equal.
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
  set: $Set<V>,
  ...sets: $Array<$Set<V>>
): boolean {
  const inOrder = Ar.from(set);
  for (let ai = 0; ai < sets.length; ai++) {
    const compared = sets[ai];
    if (compared === set) {
      continue;
    }
    if (compared.size !== set.size) {
      return false;
    }
    let i = 0;
    for (const item of compared) {
      if (!Cl.equalsNested(item, inOrder[i])) {
        return false;
      }
      i++;
    }
  }
  return true;
}

/// Combine

/**
 * Create a `Set` with `value` added.
 *
 * @ex St.add($St(1, 2, 3), 4) // $St(1, 2, 3, 4)
 * @alias push
 * @see St.union, St.flatten
 */
export function add<V>(collection: Collection<V>, value: V): $Set<V> {
  const result = new Set(collection.values());
  result.add(value);
  return result;
}

/**
 * Create a `Set` which is a union of all values in given `collections`.
 *
 * @ex St.union($St(1, 2, 3), $St(1, 4, 5)) // $St(1, 2, 3, 4, 5)
 * @alias join, flatten
 * @see St.intersect, St.flatten
 */
export function union<V>(...collections: $Array<Collection<V>>): $Set<V> {
  return flatten(collections);
}

/**
 * Create a `Set` which is an intersection of all values in given `collections`.
 *
 * @ex St.intersect($St(1, 2, 3), $St(2, 3, 6), $St(0, 1, 2)) // $St(2)
 * @see St.union, St.diff
 */
export function intersect<V>(...collections: $Array<Collection<V>>): $Set<V> {
  if (collections.length === 0) {
    return $St();
  }
  let intersection = from(collections[0]);
  let i = 0;
  for (const collection of collections) {
    if (i === 0) {
      i++;
      continue;
    }
    const nextIntersection = new Set();
    for (const item of collection.values()) {
      if (intersection.has(item)) {
        nextIntersection.add(item);
      }
    }
    intersection = nextIntersection;
  }
  return m(intersection);
}

/**
 * Create a `Set` which has the values from `collection` that do not appear in
 * any of the given `collections`.
 *
 * @ex St.diff($St(1, 2, 3), $St(2, 4), $St(1, 2, 4)) // $St(3)
 * @see St.union, St.intersect
 */
export function diff<V>(
  collection: Collection<V>,
  ...collections: $Array<Collection<V>>
): $Set<V> {
  if (collections.length === 0) {
    return from(collection);
  }
  const filter = flatten(collections);
  const result = new Set();
  for (const item of collection.values()) {
    if (!filter.has(item)) {
      result.add(item);
    }
  }
  return m(result);
}

/**
 * Create a `Set` which is a union of all values in given `collections`.
 *
 * @ex St.flatten([$St(1, 2, 3), $St(1, 4, 5)]) // $St(1, 2, 3, 4, 5)
 * @alias join, union
 * @see St.union, St.intersect
 */
export function flatten<V>(collections: $Array<Collection<V>>): $Set<V> {
  const result = new Set();
  for (const collection of collections) {
    for (const item of collection.values()) {
      result.add(item);
    }
  }
  return m(result);
}

/// Select

/**
 * Create a new `Set` by filtering out values for which `fn` returns false.
 *
 * @ex St.filter($St(1, 2, 3), x => Mth.isOdd(x)) // $St(1, 3)
 * @see St.map, St.filterNulls
 */
export function filter<K, V>(
  collection: KeyedCollection<K, V>,
  predicateFn: (V, K) => boolean,
): $Set<V> {
  const result = new Set();
  for (const [key, item] of collection.entries()) {
    if (predicateFn(item, key)) {
      result.add(item);
    }
  }
  return m(result);
}

/**
 * Create a promise of a `Set` by filtering out values in `collection`
 * for which async `fn` returns false.
 *
 * Executes `predicateFn` on all items in `collection` concurrently.
 *
 * @ex St.filterAsync([1, 2, 3], async x => Mth.isOdd(x)) // $St(1, 3)
 * @see St.filter, Ar.filterAsync, Mp.filterAsync
 */
export async function filterAsync<K, V>(
  collection: KeyedCollection<K, V>,
  predicateFn: (V, K) => Promise<boolean>,
): Promise<$Set<V>> {
  const filter = await Ar.mapAsync(collection, predicateFn);
  const result = new Set();
  let i = 0;
  for (const item of collection.values()) {
    if (filter[i]) {
      result.add(item);
    }
    i++;
  }
  return m(result);
}

/**
 * Create a new set by filtering out `null`s and `undefined`s.
 *
 * Here because its type is more specific then the generic `filter` function.
 *
 * @ex St.filterNulls([1, null, 3]) // $St(1, 3)
 * @see St.filter
 */
export function filterNulls<V>(collection: Collection<?V>): $Set<V> {
  const result = new Set();
  for (const item of collection.values()) {
    if (item != null) {
      result.add(item);
    }
  }
  return m(result);
}

/**
 * Create a `Set` of keys corresponding to values passing given `predicateFn`.
 *
 * @ex St.filterKeys([1, 2, 3], n => Mth.isOdd(n)) // $St(1, 3)
 * @see St.filter, Ar.filterKeys
 */
export function filterKeys<K, V>(
  collection: KeyedCollection<K, V>,
  predicateFn: V => boolean,
): $Set<K> {
  const result = new Set();
  for (const [key, item] of collection.entries()) {
    if (predicateFn(item)) {
      result.add(key);
    }
  }
  return m(result);
}

/**
 * TODO: filterWithKeys (possibly combine with filter, using swapped order)
 * TODO:
 * dropFirst
 * takeFirst

/// Transform

/**
 * Create a new set by calling given `fn` on each value of `collection`.
 *
 * @ex St.map([1, 2], x => x * 2) // $St(2, 4)
 * @see St.mapAsync
 */
export function map<VFrom, VTo>(
  collection: Collection<VFrom>,
  fn: VFrom => VTo,
): $Set<VTo> {
  const result = new Set();
  for (const item of collection.values()) {
    result.add(fn(item));
  }
  return m(result);
}

/**
 * Create a promise of a `Set` by calling given async `fn` on each value of
 * `collection`.
 *
 * Executes `fn` on all items in `collection` concurrently.
 *
 * @ex await St.mapAsync([1, 2], async x => x * 2) // $St(2, 4)
 * @alias Promise.all, genMap
 * @see St.map, Ar.mapAsync
 */
export async function mapAsync<VFrom, VTo>(
  collection: Collection<VFrom>,
  fn: VFrom => Promise<VTo>,
): Promise<$Set<VTo>> {
  return m(new Set(await Promise.all(Array.from(map(collection, fn)))));
}

/**
 * Create a new set by calling given `fn` on each value of `collection` and
 * flattening the results.
 *
 * Equivalent to using `map` followed by `flatten`, for simplicity and improved
 * performance.
 *
 * @time O(n)
 * @space O(n)
 * @ex St.mapFlat([1, 2], x => [x - 1, x]) // $St(0, 1, 2)
 * @see Ar.mapAsync
 */
export function mapFlat<VFrom, VTo>(
  collection: Collection<VFrom>,
  fn: VFrom => Collection<VTo>,
): $Set<VTo> {
  const result = new Set();
  for (const item of collection.values()) {
    const mapped = fn(item);
    for (const mappedItem of mapped.values()) {
      result.add(mappedItem);
    }
  }
  return m(result);
}

// TODO:
// mapWithKey

/// Divide

// TODO:
// chunk
// partition

// TODO: has / includes
