// @flow

'use strict';

import type {Collection, KeyedCollection, $Array, $Set} from './types.flow';

const Cl = require('./collection');
const Ar = require('./array');

const EMPTY = new Set(); // Returned whenever we can return an empty set

function m<V>(set: $Set<V>): $Set<V> {
  return set.size === 0 ? (EMPTY: any) : set;
}

/// Construction

/**
 * Create a set.
 *
 * Can contain any JS value. Maintains uniqueness.
 *
 * @ex St(1, 2, 3)
 * @alias create, constructor, new
 * @see St.from
 */
export function $St<V>(...args: $Array<V>): $Set<V> {
  return m(new Set(args));
}

/**
 * Convert any `collection` of values to a Set of values.
 *
 * Note that this is not a way to clone a set, if passed a set, the same
 * set will be returned.
 *
 * @ex St.from([1, 2, 3])
 * @ex St.from(Mp({a: 1, b: 2, c: 3}))
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
 * Convert any `collection` of awaitable promises of values to a single
 * promise of a Set of values.
 *
 * @ex St.fromAsync([(async () => 1)(), (async () => 2)()])
 * @alias all
 * @see St.from, Ar.fromAsync
 */
export async function fromAsync<V>(
  collection: Collection<Promise<V>>,
): Promise<$Set<V>> {
  return m(new Set(await Ar.fromAsync(collection)));
}

/**
 * Convert any `collection` of values to a mutable Set of values.
 *
 * If a set is given it will be cloned.
 *
 * @ex St.mutable($St(1, 2, 3)) // Set {1, 2, 3}
 * @see St.from
 */
export function mutable<V>(collection: Collection<V>): Set<V> {
  return new Set(collection.values());
}

/**
 * TODO: keys

/// Checks

/**
 * Returns whether given argument is a Set.
 *
 * @ex St.isSet(St(1, 2, 3))
 * @see Ar.isArray, Mp.isMap
 */
export function isSet(argument: mixed): %checks {
  return argument instanceof Set;
}

/**
 * Returns whether given Sets are equal.
 *
 * All items must be strictly equal.
 *
 * @time O(n)
 * @space O(1)
 * @ex St.equals([1, 2], [1, 2])
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
 * Returns whether given Sets contain the same values.
 *
 * All items must be strictly equal.
 *
 * @time O(n)
 * @space O(1)
 * @ex St.unorderdEquals([1, 2], [1, 2])
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
 * Returns whether given Sets and any nested collections are equal.
 *
 * Any contained collections must deeply equal, all other items must be
 * strictly equal.
 *
 * @time O(n)
 * @space O(1)
 * @ex Ar.equalsNested([[1], [2], 3], [[1], [2], 3])
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
 * Create a Set which is a union of all values in given `collections`.
 *
 * @ex St.union(St(1, 2, 3), St(1, 4, 5))
 * @alias join, flatten
 * @see St.intersect, St.flatten
 */
export function add<V>(collection: Collection<V>, value: V): $Set<V> {
  const result = new Set(collection.values());
  result.add(value);
  return result;
}

/**
 * Create a Set which is a union of all values in given `collections`.
 *
 * @ex St.union(St(1, 2, 3), St(1, 4, 5))
 * @alias join, flatten
 * @see St.intersect, St.flatten
 */
export function union<V>(...collections: $Array<Collection<V>>): $Set<V> {
  return flatten(collections);
}

/**
 * Create a Set which is an intersection of all values in given `collections`.
 *
 * @ex St.intersect(St(1, 2, 3), St(2, 3, 6), St(0, 1, 2))
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
 * Create a Set which has the values from `collection` that do not appear in
 * any of the given `collections`.
 *
 * @ex St.diff(St(1, 2, 3), St(2, 4), St(1, 2, 4))
 * @see St.union, St.intersect
 */
export function diff<V>(
  collection: Collection<V>,
  ...collections: $Array<Collection<V>>
): $Set<V> {
  if (collections.length === 0) {
    return from(collection);
  }
  const filter = union(...collections);
  const result = new Set();
  for (const item of collection.values()) {
    if (!filter.has(item)) {
      result.add(item);
    }
  }
  return m(result);
}

/**
 * Create a Set which is a union of all values in given `collections`.
 *
 * @ex St.flatten([St(1, 2, 3), St(1, 4, 5)])
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
 * Create a new set by filtering out values for which `fn` returns false.
 *
 * @ex St.filter(St(1, 2, 3), Mth.isOdd)
 * @see St.map, St.filterNullish
 */
export function filter<V>(
  collection: Collection<V>,
  fn: V => boolean,
): $Set<V> {
  const result = new Set();
  for (const item of collection.values()) {
    if (fn(item)) {
      result.add(item);
    }
  }
  return m(result);
}

/**
 * Create a promise of an array by filtering out values in `collection`
 * for which async `fn` returns false.
 *
 * Executes `predicate` on all items in `collection` concurrently.
 *
 * @ex Ar.filterAsync([1, 2, 3], async x => Mth.isOdd(x))
 * @see St.filter, Ar.filterAsync
 */
export async function filterAsync<V>(
  collection: Collection<V>,
  predicate: V => Promise<boolean>,
): Promise<$Set<V>> {
  const filter = await Ar.mapAsync(collection, predicate);
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
 * @ex St.filterNulls([1, null, 3])
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
 * Create a set of keys corresponding to values passing given `predicateFn`.
 *
 * @ex St.findKeys([1, 2, 3], n => Mth.isOdd(n)) // $St(1, 3)
 * @see St.filter, Ar.findKeys
 */
export function findKeys<K, V>(
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
 * drop
 * take

/// Transform

/**
 * Create a new set by calling given `fn` on each value of `collection`.
 *
 * @ex St.map([1, 2], x => x * 2)
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
 * Create a promise of a set by calling given async `fn` on each value of
 * `collection`.
 *
 * Executes `fn` on all items in `collection` concurrently.
 *
 * @ex await St.mapAsync([1, 2], async x => x * 2)
 * @alias Promise.all, genMap
 * @see St.map, Ar.mapAsync
 */
export async function mapAsync<VFrom, VTo>(
  collection: Collection<VFrom>,
  fn: VFrom => Promise<VTo>,
): Promise<$Set<VTo>> {
  return m(new Set(await Promise.all(Array.from(map(collection, fn)))));
}

// TODO:
// mapWithKey

/// Divide

// TODO:
// chunk
// partition

// TODO: has / includes
