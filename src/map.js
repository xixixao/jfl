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

import {defaultCompareFn} from './_internal';
import * as Ar from './array';
import * as Cl from './collection';
import * as St from './set';

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
 * @ex $Mp({a: 1, b: 2, c: 3}) // Map {a => 1, b => 2, c => 3}
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
 * @ex Mp.of([0, 2], [4, 2]) // Map {0 => 2, 4 => 2}
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
 * @ex Mp.from([1, 2, 3]) // Mp.of([0, 1], [1, 2], [2, 3])
 * @ex Mp.from(Set('a', 'b', 'c')) // $Mp({a: 'a', b: 'b', c: 'c'})
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
 * @ex Mp.fromAsync($Mp({a: (async () => 1)()}) // $Mp({a: 1})
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
 * @ex Mp.fromValues([2, 3], n => n ** 2) // Mp.of([4, 2], [9, 3])
 * @alias mapKeys
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
 * @ex Mp.fromKeys([2, 3], n => n ** 2) // Mp.of([2, 4], [3, 9])
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
 * @ex await Mp.fromKeysAsync([2], async n => n ** 2) // Mp.of([2, 4])
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
 * @ex Mp.fromEntries($St([2, 3])) // Mp.of([2, 3])
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
 * @ex Mp.zip(['a', 'b'], [3, 4]) // $Mp({a: 3, b: 4})
 * @alias listsToMap, fromZip, associate
 * @see Mp.fromEntries, Mp.pull
 */
export function zip<K, V>(
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
 * @ex Mp.toObject($Mp({a: 1, b: 2})) // {a: 1, b: 2}
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
export function mutable<K, V>(collection: KeyedCollection<K, V>): Map<K, V> {
  return new Map(collection.entries());
}

/// Check

/**
 * Returns whether given value is a `Map`.
 *
 * @ex Mp.isMap([1, 2, 3]) // false
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
 * @ex Mp.equals($Mp({a: 1, b: 2}), $Mp({a: 1, b: 2})) // true
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
 * @ex Mp.equalsOrderIgnored($Mp({a: 1, b: 2}), $Mp({b: 2, a: 1})) // true
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
 * @ex Mp.equalsNested(Mp.of([[0], [1]]]), Mp.of([[0], [1]]])) // true
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
 * @ex Mp.set($Mp({a: 1}), 'b', 2) // $Mp({a: 1, b: 2})
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
 * @ex Mp.merge($Mp({a: 1, b: 2}), $Mp({a: 2, c: 3})) // $Mp({a: 2, b: 2, c: 3})
 * @see Mp.set, Mp.diffByKey
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

/**
 * Create a new `Map` which has all the keys and corresponding values from
 * `collection` except for the keys that appear in any of the given
 * `collections`.
 *
 * @ex Mp.diffByKey($Mp({a: 1, b: 2}), $Mp({b: 3}), $Mp({c: 4})) // $Mp({a: 1})
 * @see Mp.merge
 */
export function diffByKey<K, V>(
  collection: KeyedCollection<K, V>,
  ...collections: $Array<KeyedCollection<K, V>>
): $Map<K, V> {
  if (collections.length === 0) {
    return from(collection);
  }
  const filter = St.flatten(collections.map(collection => St.keys(collection)));
  const result = new Map();
  for (const [key, item] of collection.entries()) {
    if (!filter.has(key)) {
      result.set(key, item);
    }
  }
  return m(result);
}

/**
 * Create a new `Map` by filtering out keys and values for which `predicateFn`
 * returns false.
 *
 * @ex Mp.filter($Mp({a: 1, b: 2}), x => Mth.isOdd(x)) // $Mp({a: 1})
 * @ex Mp.filter(Mp.of([0, 1], [3, 4]), (_, x) => Mth.isOdd(x)) // Mp.of([3, 4])
 * @see Mp.map, Mp.filterNulls
 */
export function filter<K, V>(
  collection: KeyedCollection<K, V>,
  predicateFn: (V, K) => boolean,
): $Map<K, V> {
  const result = new Map();
  for (const [key, item] of collection.entries()) {
    if (predicateFn(item, key)) {
      result.set(key, item);
    }
  }
  return m(result);
}

/**
 * Create a promise of a `Map` by filtering out values in `collection`
 * for which async `predicateFn` returns false.
 *
 * Executes `predicateFn` on all key value pairs in `collection` concurrently.
 *
 * @ex Mp.filterAsync([1, 2, 3], async x => Mth.isOdd(x)) // $Mp({0: 1, 2: 3})
 * @see Mp.filter, Ar.filterAsync, St.filterAsync
 */
export async function filterAsync<K, V>(
  collection: KeyedCollection<K, V>,
  predicateFn: (V, K) => Promise<boolean>,
): Promise<$Map<K, V>> {
  const filter = await Ar.mapAsync(collection, predicateFn);
  const keys = Ar.keys(collection);
  const result = new Map();
  let i = 0;
  for (const item of collection.values()) {
    if (filter[i]) {
      result.set(keys[i], item);
    }
    i++;
  }
  return m(result);
}

/**
 * Create a new `Map` by filtering out `null` and `undefined` values.
 *
 * Here because its type is more specific then the generic `filter` function.
 *
 * @ex Mp.filterNulls([1, null, 3]) // Mp.of([0, 1], [2, 3])
 * @see Mp.filter, Ar.filterNulls, St.filterNulls
 */
export function filterNulls<K, V>(
  collection: KeyedCollection<K, ?V>,
): $Map<K, V> {
  const result = new Map();
  for (const [key, item] of collection.entries()) {
    if (item != null) {
      result.set(key, item);
    }
  }
  return m(result);
}

/**
 * Create a new `Map` which has all the keys and corresponding values from
 * `map` for the keys that appear in `keys`.
 *
 * The order of the keys in the resulting map is the order in which they appear
 * first in `keys`.
 *
 * @ex Mp.selectKeys($Mp({a: 1, b: 2, c: 3}), ['c', 'b']) // $Mp({c: 3, b: 2})
 * @see Mp.filterKeys
 */
export function selectKeys<K, V>(
  collection: KeyedCollection<K, V>,
  keys: Collection<K>,
): $Map<K, V> {
  const map = from(collection);
  const keySet = St.from(keys);
  const result = new Map();
  for (const key of keySet) {
    if (map.has(key)) {
      result.set(key, (map.get(key): any));
    }
  }
  return m(result);
}

/**
 * Create a `Map` of values from `collection` with each value included only
 * once.
 *
 * Later keys for the same value overwrite previous ones.
 *
 * @time O(n)
 * @space O(n)
 * @ex Mp.unique($Mp{a: 1, b: 2, c: 1}) // $Mp({c: 1, b: 2})
 * @see Mp.uniqueBy, St.from
 */
export function unique<K, V>(collection: KeyedCollection<K, V>): $Map<K, V> {
  return flip(flip(collection));
}

/**
 * Create a `Map` of values from `collection` with each value included only
 * once, where value equivalence is determined by calling `identityFn` on
 * each value. Later values and keys overwrite previous ones.
 *
 * @time O(n)
 * @space O(n)
 * @ex Mp.uniqueBy($Mp({a: 1, b: 2, c: 3}), Mth.isOdd) // $Mp({c: 3, b: 2})
 * @see Mp.unique
 */
export function uniqueBy<K, V>(
  collection: KeyedCollection<K, V>,
  identityFn: (V, K) => mixed,
): $Map<K, V> {
  const map = from(collection);
  const flipped = pull(collection, identityFn, (_, origKey) => origKey);
  return pull(
    flipped,
    origKey => origKey,
    origKey => (map.get(origKey): any),
  );
}

/**
 * Create a `Map` containing the first `n` key value pairs of `collection`.
 *
 * @time O(n)
 * @space O(n)
 * @ex Mp.takeFirst($Mp({a: 1, b: 2, c: 3}), 2) // $Mp({a: 1, b: 2})
 * @see Mp.dropFirst
 */
export function takeFirst<K, V>(
  collection: KeyedCollection<K, V>,
  n: number,
): $Map<K, V> {
  const result = new Map();
  let i = 0;
  for (const [key, item] of collection.entries()) {
    if (i < n) {
      result.set(key, item);
    }
    i++;
  }
  return m(result);
}

/**
 * Create a `Map` containing all but the first `n` key value pairs of
 * `collection`.
 *
 * @time O(n)
 * @space O(n)
 * @ex Mp.dropFirst($Mp({a: 1, b: 2, c: 3}), 2) // $Mp({c: 3})
 * @see Mp.takeFirst
 */
export function dropFirst<K, V>(
  collection: KeyedCollection<K, V>,
  n: number,
): $Map<K, V> {
  const result = new Map();
  let i = 0;
  for (const [key, item] of collection.entries()) {
    if (i >= n) {
      result.set(key, item);
    }
    i++;
  }
  return m(result);
}

/// Transform

/**
 * Create a new `Map` by calling given `fn` on each value and key of
 * `collection`.
 *
 * @ex Mp.map($Mp({a: 1, b: 2}}), (x) => x * 2) // $Mp({a: 2, b: 4})
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
 * @ex await Mp.mapAsync($Mp({a: 1}}), async x => x * 2) // $Mp({a: 2})
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

/**
 * Create a new `Map` by calling given `fn` on each value and key of
 * `collection` and and including the result if it is not null or undefined.
 *
 * Equivalent to using `map` followed by `filterNulls`, for simplicity and
 * improved performance.
 *
 * @ex Mp.mapMaybe($Mp({a: 2}), (x) => Mth.isOdd(x) ? x : null) // $Mp()
 * @see Mp.mapFlat
 */
export function mapMaybe<KFrom, VFrom, VTo>(
  collection: KeyedCollection<KFrom, VFrom>,
  fn: (VFrom, KFrom) => ?VTo,
): $Map<KFrom, VTo> {
  const result = new Map();
  for (const [key, item] of collection.entries()) {
    const mapped = fn(item, key);
    if (mapped != null) {
      result.set(key, mapped);
    }
  }
  return m(result);
}

/**
 * Create a new `Map` by calling given `fn` on each value and key of
 * `collection` and flattening the results.
 *
 * Equivalent to using `map` followed by `flatten`, for simplicity and improved
 * performance.
 *
 * @time O(n)
 * @space O(n)
 * @ex Mp.mapFlat([1, 3], n => Mp.of([n + 1, 'a'])) // Mp.of([2, 'a'], [4, 'a'])
 * @see Mp.mapMaybe, Mp.mapToEntries
 */
export function mapFlat<KFrom, KTo, VFrom, VTo>(
  collection: KeyedCollection<KFrom, VFrom>,
  fn: (VFrom, KFrom) => KeyedCollection<KTo, VTo>,
): $Map<KTo, VTo> {
  const result = new Map();
  for (const [key, item] of collection.entries()) {
    const mapped = fn(item, key);
    for (const [mappedKey, mappedItem] of mapped.entries()) {
      result.set(mappedKey, mappedItem);
    }
  }
  return m(result);
}

/**
 * Create a new `Map` by calling given `fn` on each value and key of
 * `collection`.
 *
 * `fn` must return new entries to populate the map.
 *
 * @time O(n)
 * @space O(n)
 * @ex Mp.mapToEntries(['a', 'b'], (x, i) => [x, i]) // $Mp({a: 0, b: 1})
 * @see Mp.map, Map.pull
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
 * @time O(n)
 * @space O(n)
 * @ex Mp.pull([2, 3], n => n - 2, n => n ** 2) // Mp.of([0, 4], [1, 9])
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
 * @time O(n) (amortized)
 * @space O(n)
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

/**
 * Create a new `Map` with keys and values being the values and keys of
 * `collection` respectively.
 *
 *
 * @time O(n)
 * @space O(n)
 * @ex Mp.flip($Mp({a: 'A', b: 'B'})) // $Mp({A: 'a', B: 'b'})
 * @see Mp.pull, Mp.group
 */
export function flip<K, V>(collection: KeyedCollection<K, V>): $Map<V, K> {
  const result = new Map();
  for (const [key, item] of collection.entries()) {
    result.set(item, key);
  }
  return m(result);
}

/**
 * Create a new `Map` with keys being the values of `collection` and values
 * being the number of times each value occured in `collection`.
 *
 * `undefined` and `null` are valid values of `collection`.
 *
 * @time O(n)
 * @space O(n)
 * @ex Mp.countValues($Mp({a: 'x', b: 'x', c: 'y'})) // $Mp({x: 2, y: 1})
 * @see Mp.group
 */
export function countValues<V>(collection: Collection<V>): $Map<V, number> {
  const result = new Map();
  for (const item of collection.values()) {
    const count = result.has(item) ? result.get(item) : 0;
    result.set(item, count + 1);
  }
  return m(result);
}

/**
 * Create a new `Map` by concatenating all keyed collections in given
 * `collection`.
 *
 * @time O(n)
 * @space O(n)
 * @ex Mp.flatten([$Mp({a: 1}), $Mp({b: 2, c: 3})]) // $Mp({a: 1, b: 2, c: 3})
 * @alias join, union
 * @see Mp.mapFlat, Ar.flatten
 */
export function flatten<K, V>(
  collection: Collection<KeyedCollection<K, V>>,
): $Map<K, V> {
  const result = new Map();
  for (const nested of collection.values()) {
    for (const [key, item] of nested.entries()) {
      result.set(key, item);
    }
  }
  return m(result);
}

/// Divide

/**
 * Create an array of `Map`s which are chunks of given `collection` of given
 * `size`.
 *
 * If the `collection` doesn't divide evenly, the final chunk will be smaller
 * than the rest.
 *
 * @time O(n)
 * @space O(n)
 * @ex Mp.chunk($Mp({a: 1, b: 2, c: 3}), 2) // [$Mp({a: 1, b: 2}), $Mp({c: 3})]
 * @see Mp.partition
 */
export function chunk<K, V>(
  collection: KeyedCollection<K, V>,
  size: number,
): $Array<$Map<K, V>> {
  if (size < 1) {
    throw new Error(`Expected \`size\` to be greater than 0, got \`${size}\`.`);
  }
  const result = [];
  let chunk = new Map();
  let i = 0;
  for (const [key, item] of collection.entries()) {
    if (i >= size) {
      i = 0;
      result.push(chunk);
      chunk = new Map();
    }
    chunk.set(key, item);
    i++;
  }
  if (chunk.size > 0) {
    result.push(chunk);
  }
  return result;
}

/**
 * Create a tuple of `Map`s containing keys and items of `collection`
 * which match and don't match `predicateFn` respectively.
 *
 * More effecient than using multiple `Mp.filter` calls.
 *
 * @time O(n)
 * @space O(n)
 * @ex Mp.partition($Mp({a: 2}), x => Mth.isOdd(x)) // [$Mp(), $Mp({a: 2})]
 * @alias split
 * @see Mp.group
 */
export function partition<K, V>(
  collection: KeyedCollection<K, V>,
  predicateFn: (V, K) => boolean,
): [$Map<K, V>, $Map<K, V>] {
  const positives = new Map();
  const negatives = new Map();
  for (const [key, item] of collection.entries()) {
    if (predicateFn(item, key)) {
      positives.set(key, item);
    } else {
      negatives.set(key, item);
    }
  }
  return [m(positives), m(negatives)];
}

/// Ordering

/**
 * Create a `Map` containing the keys and items of `collection` in reverse
 * order.
 *
 * @time O(n)
 * @space O(n)
 * @ex Mp.reverse($Mp({a: 1, b: 2, c: 3})) // $Mp({c: 3, b: 2, a: 1})
 */
export function reverse<K, V>(collection: KeyedCollection<K, V>): $Map<K, V> {
  const keys = (Ar.keys(collection): any).reverse();
  const values = Array.from(collection.values()).reverse();
  return zip(keys, values);
}

/**
 * Create a `Map` of keys and values in `collection` sorted by value.
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
 * @time Worst case O(n^2)
 * @space O(n)
 * @ex Mp.sort($Mp({a: 3, b: 1, c: 2})) // $Mp({b: 1, c: 2, a: 3})
 * @ex Mp.sort($Mp({x: 'c', y: 'b', z: 'a'})) // $Mp({z: 'a', y: 'b', x: 'c'})
 * @see Mp.sortBy
 */
export function sort<K, V>(
  collection: KeyedCollection<K, V>,
  compareFn?: (
    aItem: V,
    bItem: V,
    aKey: K,
    bKey: K,
  ) => number = defaultCompareFn,
): $Map<K, V> {
  const inOrder: Array<[V, K, number]> = [];
  let i = 0;
  for (const [key, item] of collection.entries()) {
    inOrder.push([item, key, i]);
    i++;
  }
  const result = new Map();
  inOrder
    .sort(
      ([aItem, aKey, ai], [bItem, bKey, bi]) =>
        compareFn(aItem, bItem, aKey, bKey) || ai - bi,
    )
    .forEach(([item, key]) => {
      result.set(key, item);
    });

  return m(result);
}

/**
 * Create a `Map` of keys and values in `collection` sorted by the scalar
 * computed by calling `scalarFn` on each value and key.
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
 * @time Worst case O(n^2)
 * @space O(n)
 * @ex Mp.sortBy($Mp({a: 3, b: 4, c: 2}), n => n % 3) // $Mp({b: 1, c: 2, a: 3})
 * @see Mp.sort
 */
export function sortBy<K, V, S>(
  collection: KeyedCollection<K, V>,
  scalarFn: (V, K) => S,
  compareFn?: (a: S, b: S) => number = defaultCompareFn,
): $Map<K, V> {
  const inOrder: Array<[V, K, S, number]> = [];
  let i = 0;
  for (const [key, item] of collection.entries()) {
    inOrder.push([item, key, scalarFn(item, key), i]);
    i++;
  }
  const result = new Map();
  inOrder
    .sort(
      ([_aItem, _aKey, a, ai], [_bItem, _bKey, b, bi]) =>
        compareFn(a, b) || ai - bi,
    )
    .forEach(([item, key]) => {
      result.set(key, item);
    });

  return m((result: any));
}
