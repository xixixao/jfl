// @flow

'use strict';

import type {Collection, KeyedCollection, $Array, $Map} from './types.flow';

const Ar = require('./array');
const Cl = require('./collection');

const EMPTY = new Map(); // Returned whenever we can return an empty set

function m<K, V>(map: $Map<K, V>): $Map<K, V> {
  return map.size === 0 ? (EMPTY: any) : map;
}

/// Construction

/**
 * Create a map.
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
 * Create a map from given `pairs` of keys and values.
 *
 * @ex Mp.of([0, 2], [4, 2])
 * @see Mp, Mp.from, Mp.fromEntries
 */
export function of<K, V>(...pairs: $Array<[K, V]>): $Map<K, V> {
  return m(new Map(pairs));
}

/**
 * Convert any keyed `collection` to a Map.
 *
 * Note that this is not a way to clone a map, if passed a map, the same
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
 * Convert any keyed `collection` of promises to a Map.
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
 * TODO:
 * @ex Mp.fromValues()
 * @see Mp.fromKeys
 */
export function fromValues<K, V>(
  collection: Collection<V>,
  getKey: V => K,
): $Map<K, V> {
  const result = new Map();
  for (const item of collection.values()) {
    result.set(getKey(item), item);
  }
  return m(result);
}

/**
 * TODO:
 * @see Mp.fromValues
 * */
export function fromKeys<K, V>(
  collection: Collection<K>,
  getValue: K => V,
): $Map<K, V> {
  const result = new Map();
  for (const key of collection.values()) {
    result.set(key, getValue(key));
  }
  return m(result);
}

/**
 * TODO:
 * @see Mp.fromKeys
 * */
export async function fromKeysAsync<K, V>(
  collection: Collection<K>,
  getValue: K => Promise<V>,
): Promise<$Map<K, V>> {
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
  *@see Mp.fromKeys, Mp.mapToEntries
  */
export function fromEntries<K, V>(collection: Collection<[K, V]>): $Map<K, V> {
  return m(new Map(collection.values()));
}

/**
 * Create a Map from given `keys` and `values`.
 *
 * If there are more `keys` than `values` or vice versa, ignores the
 * excess items.
 *
 * @alias listsToMap, fromZip, associate
 * @see Mp.fromEntries
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
 * Create a JavaScript Object from a string-keyed Map.
 *
 * @ex Mp.toObject(Mp({a: 1, b: 2}))
 * @see Mp
 */
export function fromObject<K: string, V>(
  object: $ReadOnly<{[key: K]: V}>,
): KeyedCollection<K, V> {
  return m((new Map(Object.entries(object)): any));
}

/**
 * Create a JavaScript Object from a string-keyed Map.
 *
 * @ex Mp.toObject(Mp({a: 1, b: 2}))
 * @see Mp
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
 * Convert any keyed `collection` to a mutable Map.
 *
 * If a map is given, it will be cloned.
 *
 * @ex Mp.from([1, 2, 3])
 * @ex Mp.from(Set(1, 2, 3))
 * @see Mp.of, Mp.fromEntries
 */
export function mutable<K, V>(collection: KeyedCollection<K, V>): $Map<K, V> {
  return new Map(collection.entries());
}

/// Checks

/**
 * Returns whether given value is a Map.
 *
 * Use `instanceof Map` directly if you need the type system to pick up
 * the refinement.
 *
 * @ex Mp.isMap([1, 2, 3])
 * @see St.isSet, Ar.isArray
 */
export function isMap(argument: mixed): %checks {
  return argument instanceof Map;
}

/**
 * Returns whether given Maps are equal.
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
 * Returns whether given Maps contain the same key/value pairs.
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
 * Returns whether given Maps are equal.
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
 * Create a new Map by adding or replacing `value` under `key` in given
 * keyed `collection`.
 *
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
 * Create a new Map by merging all given `collections`. Later values will
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

// TODO: diffByKey
// TODO: drop
// TODO: take
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
 * Create a new map by calling given `fn` on each value and key of `collection`.
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
 * Create a promise of a map by calling given async `fn` on each value and key
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
 * Create a new map by calling given `fn` on each key and value of
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

// TODO: pull

// TODO: group (ala group_keys_by_values), consider dropping group_by
// given JS doesn't have the arraykey limitation

/**
 * Create a new map by grouping values from `collection` for which `fn`
 * returns the same key.
 *
 * The new map has Arrays of original values as its values.
 * Values for which `fn` returns null or undefined are ommited.
 *
 * @ex Mp.group([1, 2, 3], n => Mth.isOdd(n))
 * @see Ar.partition
 */
export function groupBy<V, KTo>(
  collection: Collection<V>,
  fn: V => ?KTo,
): $Map<KTo, $Array<V>> {
  const result = new Map();
  for (const item of collection.values()) {
    const key = fn(item);
    if (key != null) {
      if (result.has(key)) {
        (result.get(key): any).push(item);
      } else {
        result.set(key, [item]);
      }
    }
  }
  return m(result);
}

// TODO: countValues
// TODO: flatten
// TODO: fillKeys
// TODO: flip

/// Divide

// TODO: partition
// TODO: chunk

/// Ordering

// TODO: reverse
// TODO: sort
// TODO: sortBy
// TODO: numericalSort
// TODO: numericalSortBy
