/**
 * @flow
 *
 * This module provides functions which operate on collections (`Array`s,
 * `Map`s, `Set`s) and return read-only (immutable) `Map`s.
 *
 * @ex import {Mp, $Mp} from 'jfl'
 */

'use strict';

import type {Collection, KeyedCollection, $Array, $Map} from './types.flow';

import * as Ar from './array';
import * as Cl from './collection';

const EMPTY = new Map(); // Returned whenever we can return an empty set

function m<K, V>(map: $Map<K, V>): $Map<K, V> {
  return map.size === 0 ? (EMPTY: any) : map;
}

/// Construct

/**
 * Create a `Map`.
 *
 * If your keys aren't strings, prefer `Mp.of`.
 *
 * @ex Mp({a: 1, b: 2, c: 3})
 * @alias create, constructor, new
 * @see Mp.of
 */
export function $Mp<K: string, V>(object?: {[key: K]: V}): $Map<K, V> {
  if (object == null) {
    return (EMPTY: any);
  }
  return m((new Map(Object.entries(object)): any));
}

/**
 * Create a `Map` from given `pairs` of keys and values.
 *
 * @ex Mp.of([0, 2], [4, 2])
 * @see Mp, Mp.from, Mp.fromEntries
 */
export function of<K, V>(...pairs: $Array<[K, V]>): $Map<K, V> {
  return m(new Map(pairs));
}

/**
 * Convert any keyed `collection` to a `Map`.
 *
 * Note that this is not a way to clone a Map, if passed a `Map`, the same
 * map will be returned.
 *
 * @ex Mp.from([1, 2, 3])
 * @ex Mp.from(Set(1, 2, 3))
 * @see Mp.of, Mp.fromEntries
 */
export function from<K, V>(collection: KeyedCollection<K, V>): $Map<K, V> {
  if (isMap(collection)) {
    return collection;
  }
  return m(new Map(collection.entries()));
}

/**
 * Convert any keyed `collection` of promises to a `Map`.
 *
 * @ex Mp.fromAsync([(async () => 1)(), (async () => 2)()])
 * @see Mp.from, Ar.fromAsync
 */
export async function fromAsync<K, V>(
  collection: KeyedCollection<K, Promise<V>>,
): Promise<$Map<K, V>> {
  const values = await Ar.fromAsync(collection);
  const result = new Map();
  let i = 0;
  for (const [key, _] of collection.entries()) {
    result.set(key, values[i]);
    i++;
  }
  return m(result);
}

/**
 * Create a `Map` where each value comes from `collection` and its key is
 * the result of calling `getKey` on it.
 *
 * @time O(n)
 * @space O(n)
 * @ex Mp.fromValues([2, 3], n => n ** 2) // $Mp({4: 2, 9: 3})
 * @see Mp.fromKeys
 */
export function fromValues<KFrom, KTo, VTo>(
  collection: KeyedCollection<KFrom, VTo>,
  getKey: (VTo, KFrom) => KTo,
): $Map<KTo, VTo> {
  const result = new Map();
  for (const [key, item] of collection.entries()) {
    result.set(getKey(item, key), item);
  }
  return m(result);
}

/**
 * Create a `Map` where each key comes from `collection` and its value is
 * the result of calling `getValue` on it.
 *
 * @time O(n)
 * @space O(n)
 * @ex Mp.fromKeys([2, 3], n => n ** 2) // $Mp({2: 4, 3: 9})
 * @see Mp.fromValues
 */
export function fromKeys<KFrom, KTo, VTo>(
  collection: KeyedCollection<KFrom, KTo>,
  getValue: (KTo, KFrom) => VTo,
): $Map<KTo, VTo> {
  const result = new Map();
  for (const [key, item] of collection.entries()) {
    result.set(item, getValue(item, key));
  }
  return m(result);
}

/**
 * Create a promise of a `Map` where each key comes from `collection` and
 * its value is the result of calling `getValue` on it.
 *
 * @time O(n)
 * @space O(n)
 * @ex await Mp.fromKeysAsync([2, 3], async n => n ** 2) // $Mp({2: 4, 3: 9})
 * @see Mp.fromKeys
 */
export async function fromKeysAsync<KFrom, KTo, VTo>(
  collection: KeyedCollection<KFrom, KTo>,
  getValue: (KTo, KFrom) => Promise<VTo>,
): Promise<$Map<KTo, VTo>> {
  const values = await Ar.mapAsync(collection, getValue);
  const result = new Map();
  let i = 0;
  for (const key of collection.values()) {
    result.set(key, values[i]);
    i++;
  }
  return m(result);
}

/**
 * Create a `Map` from a `collection` of entries, i.e. (key, value) pairs.
 *
 * @time O(n)
 * @space O(n)
 * @ex Mp.fromEntries($St([2, 3])) // $Mp({2: 3})
 * @see Mp.fromKeys, Mp.mapToEntries
 */
export function fromEntries<K, V>(collection: Collection<[K, V]>): $Map<K, V> {
  return m(new Map(collection.values()));
}

/**
 * Create a `Map` from given `keys` and `values`.
 *
 * If there are more `keys` than `values` or vice versa, ignores the
 * excess items.
 *
 * @ex Mp.unzip([1, 2], [3, 4]) // $Mp({1: 3, 2: 4})
 * @alias listsToMap, fromZip, associate
 * @see Mp.fromEntries, Mp.pull
 */
export function unzip<K, V>(
  keys: Collection<K>,
  values: Collection<V>,
): $Map<K, V> {
  const result = new Map();
  const keysIterator = keys.values();
  const valuesIterator = values.values();
  while (true) {
    const key = keysIterator.next();
    const value = valuesIterator.next();
    if (key.done || value.done) {
      break;
    }
    result.set(key.value, value.value);
  }
  return m(result);
}

/**
 * Create an `Object` from a string-keyed `Map`.
 *
 * @ex Mp.toObject(Mp({a: 1, b: 2})) // {a: 1, b: 2}
 * @see $Mp
 */
export function toObject<K: string, V>(
  collection: KeyedCollection<K, V>,
): {[key: K]: V} {
  const result = {};
  for (const [key, item] of collection.entries()) {
    result[key] = item;
  }
  return result;
}

/**
 * Convert any keyed `collection` to a mutable `Map`.
 *
 * If a `Map` is given, it will be cloned.
 *
 * @ex Mp.mutable($Mp({a: 1, b: 2})) // Map {a => 1, b => 2}
 * @see Mp.of, Mp.fromEntries
 */
export function mutable<K, V>(collection: KeyedCollection<K, V>): $Map<K, V> {
  return new Map(collection.entries());
}

/// Check

/**
 * Returns whether given value is a `Map`.
 *
 * @ex Mp.isMap([1, 2, 3])
 * @see St.isSet, Ar.isArray
 */
export function isMap(argument: mixed): %checks {
  return argument instanceof Map;
}

/**
 * Returns whether given `Map`s are equal.
 *
 * All values and keys must be strictly equal.
 *
 * @time O(n)
 * @space O(1)
 * @ex Mp.equals(Mp({a: 1, b: 2}), Mp({a: 1, b: 2}))
 * @see Mp.equalsOrderIgnored, St.equals, Ar.equals, Cl.equals
 */
export function equals<K, V>(
  map: $Map<K, V>,
  ...maps: $Array<$Map<K, V>>
): boolean {
  const keysInOrder = Ar.keys(map);
  for (let ai = 0; ai < maps.length; ai++) {
    const compared = maps[ai];
    if (compared === map) {
      continue;
    }
    if (compared.size !== map.size) {
      return false;
    }
    let i = 0;
    for (const key of compared.keys()) {
      if (keysInOrder[i] !== key || compared.get(key) !== map.get(key)) {
        return false;
      }
      i++;
    }
  }
  return true;
}

/**
 * Returns whether given `Map`s contain the same key/value pairs.
 *
 * All values and keys must be strictly equal.
 *
 * @time O(n)
 * @space O(1)
 * @ex Mp.equalsOrderIgnored(Mp({a: 1, b: 2}), Mp({b: 2, a: 1}))
 * @see Mp.equals
 */
export function equalsOrderIgnored<K, V>(
  map: $Map<K, V>,
  ...maps: $Array<$Map<K, V>>
): boolean {
  for (let ai = 0; ai < maps.length; ai++) {
    const compared = maps[ai];
    if (compared === map) {
      continue;
    }
    if (compared.size !== map.size) {
      return false;
    }
    for (const key of map.keys()) {
      if (compared.get(key) !== map.get(key)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Returns whether given `Map`s are equal.
 *
 * Any collection values or keys must deeply equal, all other values
 * and keys must be strictly equal.
 *
 * @time O(n)
 * @space O(1)
 * @ex Mp.equalsNested(Mp.of([[0], [1]]]), Mp.of([[0], [1]]]))
 * @see Mp.equals, Cl.equalsNested
 */
export function equalsNested<K, V>(
  map: $Map<K, V>,
  ...maps: $Array<$Map<K, V>>
): boolean {
  const keysInOrder = Ar.keys(map);
  for (let ai = 0; ai < maps.length; ai++) {
    const compared = maps[ai];
    if (compared === map) {
      continue;
    }
    if (compared.size !== map.size) {
      return false;
    }
    let i = 0;
    for (const key of compared.keys()) {
      const keyInOrder = keysInOrder[i];
      if (
        !Cl.equalsNested(keyInOrder, key) ||
        !Cl.equalsNested(compared.get(key), map.get(keyInOrder))
      ) {
        return false;
      }
      i++;
    }
  }
  return true;
}

/// Combine

/**
 * Create a new `Map` by adding or replacing `value` under `key` in given
 * keyed `collection`.
 *
 * @time O(1)
 * @space O(1)
 * @ex Mp.set(Mp({a: 1}), 'b', 2)
 * @see Mp.merge
 */
export function set<K, V>(
  collection: KeyedCollection<K, V>,
  key: K,
  value: V,
): $Map<K, V> {
  const result = new Map(collection.entries());
  result.set(key, value);
  return result;
}

/**
 * Create a new `Map` by merging all given `collections`. Later values will
 * override earlier values.
 *
 * @ex Mp.merge(Mp({a: 1, b: 2}), Mp({a: 2, c: 3}))
 * @see Mp.merge
 */
export function merge<K, V>(
  ...collections: $Array<KeyedCollection<K, V>>
): $Map<K, V> {
  const result = new Map();
  for (const collection of collections) {
    for (const [key, value] of collection.entries()) {
      result.set(key, value);
    }
  }
  return m(result);
}

/// Select

/**
 * Returns the value in `map` for given `key` or throws.
 *
 * If you don't know whether the map contains the key use `Map.prototype.get`.
 *
 * @time O(1)
 * @space O(1)
 * @ex Mp.getX($Mp({a: 2}), 'a') // 2
 * @see Cl.atx
 */
export function getX<K, V>(map: $Map<K, V>, key: K): V {
  if (!map.has(key)) {
    throw new Error(`Expected given map to have given key but it didn't.`);
  }
  return (map.get(key): any);
}

// TODO: diffByKey
// TODO: dropFirst
// TODO: takeFirst
// TODO: filter
// TODO: filterAsync
// TODO: filterKeys
// TODO: filterNulls
// TODO: selectKeys
// TODO: unique
// TODO: uniqueBy

/**
 * TODO
 */
export function filter<K, V>(
  collection: KeyedCollection<K, V>,
  predicate: V => boolean,
): $Map<K, V> {
  const result = new Map();
  for (const [key, item] of collection.entries()) {
    if (predicate(item)) {
      result.set(key, item);
    }
  }
  return m(result);
}

/// Transform

/**
 * Create a new `Map` by calling given `fn` on each value and key of `collection`.
 *
 * @ex Mp.map([1, 2], (x, i) => x * 2)
 * @see Mp.fromValues
 */
export function map<KFrom, VFrom, VTo>(
  collection: KeyedCollection<KFrom, VFrom>,
  fn: (VFrom, KFrom) => VTo,
): $Map<KFrom, VTo> {
  const result = new Map();
  for (const [key, item] of collection.entries()) {
    result.set(key, fn(item, key));
  }
  return m(result);
}

/**
 * Create a promise of a `Map` by calling given async `fn` on each value and key
 * of `collection`.
 *
 * Executes `fn` on all items in `collection` concurrently.
 *
 * @time O(n)
 * @space O(n)
 * @ex await Ar.mapAsync([1, 2], async x => x * 2)
 * @alias Promise.all, genMap
 */
export async function mapAsync<KFrom, VFrom, VTo>(
  collection: KeyedCollection<KFrom, VFrom>,
  fn: (VFrom, KFrom) => Promise<VTo>,
): Promise<$Map<KFrom, VTo>> {
  const awaitables = [];
  for (const [key, item] of collection.entries()) {
    awaitables.push(fn(item, key));
  }
  const values = await Promise.all(awaitables);
  const result = new Map();
  let i = 0;
  for (const key of collection.keys()) {
    result.set(key, values[i]);
    i++;
  }
  return m(result);
}

// TODO: mapKeys
// TODO: mapAsync

/**
 * Create a new `Map` by calling given `fn` on each key and value of
 * `collection`.
 *
 * `fn` must return new entries to populate the map.
 *
 * @ex Mp.mapToEntries(['a', 'b'], (x, i) => [x, i])
 * @see St.mapAsync
 */
export function mapToEntries<KFrom, VFrom, KTo, VTo>(
  collection: KeyedCollection<KFrom, VFrom>,
  fn: (VFrom, KFrom) => [KTo, VTo],
): $Map<KTo, VTo> {
  const result = new Map();
  for (const [key, item] of collection.entries()) {
    const [newKey, newItem] = fn(item, key);
    result.set(newKey, newItem);
  }
  return m(result);
}

/**
 * Create a new `Map` using keys provided by `keyFn` and values provided by
 * `valueFn` applied to each key/value of `collection`.
 *
 * When `keyFn` returns the same key for multiple values only the last value
 * will be present in the new `Map`.
 * Values for which `keyFn` returns null or undefined are ommited.
 *
 * @ex Mp.pull([1, 2, 3], n => `${n}`, n => n ** 2) // $Mp({1: 1, 2: 4, 3: 9})
 * @see Mp.group, Ar.partition
 */
export function pull<KFrom, VFrom, KTo, VTo>(
  collection: KeyedCollection<KFrom, VFrom>,
  keyFn: (VFrom, KFrom) => ?KTo,
  valueFn: (VFrom, KFrom) => VTo,
): $Map<KTo, VTo> {
  const result = new Map();
  for (const [key, item] of collection.entries()) {
    const newKey = keyFn(item, key);
    if (newKey != null) {
      result.set(newKey, valueFn(item, key));
    }
  }
  return m(result);
}

declare function group<K, V>(
  collection: KeyedCollection<K, V>,
): $Map<V, $Array<V>>;

declare function group<KFrom, VFrom, KTo>(
  collection: KeyedCollection<KFrom, VFrom>,
  keyFn: (VFrom, KFrom) => ?KTo,
): $Map<KTo, $Array<VFrom>>;

declare function group<KFrom, VFrom, KTo, VTo>(
  collection: KeyedCollection<KFrom, VFrom>,
  keyFn: (VFrom, KFrom) => ?KTo,
  valueFn: (VFrom, KFrom) => VTo,
): $Map<KTo, $Array<VTo>>;

/**
 * Create a new `Map` using keys provided by `keyFn` and values provided by
 * `valueFn` applied to each key/value of `collection`. Values with identitical
 * keys are grouped into `Array`s.
 *
 * Values for which `keyFn` returns null or undefined are ommited.
 *
 * @ex Mp.group([1, 1, 3]) // Mp.of([1, [1, 1]], [3, [3]])
 * @ex Mp.group([1, 2, 3], n => n % 2) // Mp.of([1, [1, 3]], [0, [2]])
 * @see Mp.pull, Ar.partition
 */
export function group(collection, keyFn = useValue, valueFn = useValue) {
  const result = new Map();
  for (const [origKey, item] of collection.entries()) {
    const newKey = keyFn(item, origKey);
    if (newKey != null) {
      const value = valueFn(item, origKey);
      if (result.has(newKey)) {
        (result.get(newKey): any).push(value);
      } else {
        result.set(newKey, [value]);
      }
    }
  }
  return m(result);
}

function useValue(value, _key) {
  return value;
}

export function flip<K, V>(collection: KeyedCollection<K, V>): $Map<V, K> {
  const result = new Map();
  for (const [key, item] of collection.entries()) {
    result.set(item, key);
  }
  return m(result);
}

// TODO: countValues
// TODO: flatten
// TODO: fillKeys

/// Divide

// TODO: partition
// TODO: chunk

/// Ordering

// TODO: reverse
// TODO: sort
// TODO: sortBy
// TODO: numericalSort
// TODO: numericalSortBy
