// @flow

'use strict';

import type {Collection, KeyedCollection, $Array} from './types.flow';

const Ar = require('./array');
const Cl = require('./collection');

const EMPTY = new Map(); // Returned whenever we can return an empty set

function m<K, V>(map: $Map<K, V>): $Map<K, V> {
  return map.size === 0 ? (EMPTY: any) : map;
}

// non-memoized for internal implementation
function mp<K, V>(): $Map<K, V> {
  return (new Map(): any);
}

// Create a map.
//
// If your keys aren't strings, prefer `Mp.of`.
//
// @ex Mp({a: 1, b: 2, c: 3})
// @alias create, constructor, new
// @see Mp.of
function Mp<K: string, V>(object?: {[key: K]: V}): $Map<K, V> {
  const map = mp();
  if (object != null) {
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        map.set(key, object[(key: any)]);
      }
    }
  }
  return m((map: any));
}

// Returns whether given value is a Map.
//
// @ex Mp.isMap([1, 2, 3])
// @see St.isSet, Ar.isArray
Mp.isMap = function isMap(argument: any): boolean {
  return argument instanceof Map;
};

// Returns whether given Maps are equal.
//
// All values and keys must be strictly equal.
//
// @ex Mp.shallowEquals(Mp({a: 1, b: 2}), Mp({a: 1, b: 2}))
// @see Mp.unorderedEquals, St.shallowEquals, Ar.shallowEquals
Mp.shallowEquals = function shallowEquals<K, V>(
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
};

// Returns whether given Maps contain the same key/value pairs.
//
// All values and keys must be strictly equal.
//
// @ex Mp.unorderedEquals(Mp({a: 1, b: 2}), Mp({b: 2, a: 1}))
// @see Mp.shallowEquals
Mp.unorderedEquals = function unorderedEquals<K, V>(
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
};

// Returns whether given Maps are equal.
//
// Any collection values or keys must deeply equal, all other values
// and keys must be strictly equal.
//
// @ex Mp.deepEquals(Mp.of([[0], [1]]]), Mp.of([[0], [1]]]))
// @see Mp.shallowEquals, Cl.deepEquals
Mp.deepEquals = function deepEquals<K, V>(
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
        !Cl.deepEquals(keyInOrder, key) ||
        !Cl.deepEquals(compared.get(key), map.get(keyInOrder))
      ) {
        return false;
      }
      i++;
    }
  }
  return true;
};

// Create a map from given `pairs` of keys and values.
//
// @ex Mp.of([0, 2], [4, 2])
// @see Mp, Mp.from, Mp.fromEntries
Mp.of = function of<K, V>(...pairs: $Array<[K, V]>): $Map<K, V> {
  const result = mp();
  for (const [key, item] of pairs) {
    result.set(key, item);
  }
  return m(result);
};

// Convert any keyed `collection` to a Map.
//
// Note that this is not a way to clone a map, if passed a map, the same
// map will be returned.
//
// @ex Mp.from([1, 2, 3])
// @ex Mp.from(Set(1, 2, 3))
// @see Mp.of, Mp.fromEntries
Mp.from = function from<K, V>(collection: KeyedCollection<K, V>): $Map<K, V> {
  if (Mp.isMap(collection)) {
    return (collection: any);
  }
  const result = mp();
  for (const [key, item] of collection.entries()) {
    result.set(key, item);
  }
  return m(result);
};

// @ex Mp.fromValues()
// @see Mp.fromKeys
Mp.fromValues = function fromValues<K, V>(
  collection: Collection<V>,
  getKey: V => K,
): $Map<K, V> {
  const result = mp();
  for (const item of collection.values()) {
    result.set(getKey(item), item);
  }
  return m(result);
};

// @see Mp.fromValues
Mp.fromKeys = function fromKeys<K, V>(
  collection: Collection<K>,
  getValue: K => V,
): $Map<K, V> {
  const result = mp();
  for (const key of collection.values()) {
    result.set(key, getValue(key));
  }
  return m(result);
};

// @see Mp.fromKeys, Mp.mapToEntries
Mp.fromEntries = function fromEntries<K, V>(
  collection: Collection<[K, V]>,
): $Map<K, V> {
  const result = mp();
  for (const [key, value] of collection.values()) {
    result.set(key, value);
  }
  return m(result);
};

// Create a Map from given `keys` and `values`.
//
// If there are more `keys` than `values` or vice versa, ignores the
// excess items.
//
// @alias listsToMap
// @see Mp.fromEntries
Mp.fromZip = function fromZip<K, V>(
  keys: Collection<K>,
  values: Collection<V>,
): $Map<K, V> {
  const result = mp();
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
};

// Create a JavaScript Object from a string-keyed Map.
//
// @ex Mp.toObject(Mp({a: 1, b: 2}))
// @see Mp
Mp.toObject = function toObject<K: string, V>(
  collection: KeyedCollection<K, V>,
): {[key: K]: V} {
  const result = {};
  for (const [key, item] of collection.entries()) {
    result[key] = item;
  }
  return result;
};

// Create a new Map by adding `value` under `key` to the set of key/value
// pairs in `collection`.
//
// @ex Mp.set(Mp({a: 1}), 'b', 2)
// @see Mp.merge
Mp.set = function set<K, V>(
  collection: KeyedCollection<K, V>,
  key: K,
  value: V,
): $Map<K, V> {
  const result = mp();
  for (const [oldKey, oldValue] of collection.entries()) {
    result.set(oldKey, oldValue);
  }
  result.set(key, value);
  return result;
};

Mp.merge = function merge<K, V>(
  ...collections: $Array<KeyedCollection<K, V>>
): $Map<K, V> {
  return mp();
};

// Create a new map by calling given `fn` on each key and value of `collection`.
//
// @ex Mp.map([1, 2], (x, i) => x * 2)
// @see Mp.fromValues
Mp.map = function map<KFrom, VFrom, VTo>(
  collection: KeyedCollection<KFrom, VFrom>,
  fn: (VFrom, KFrom) => VTo,
): $Map<KFrom, VTo> {
  const result = mp();
  for (const [key, item] of collection.entries()) {
    result.set(key, fn(item, key));
  }
  return m(result);
};

// Create a new map by calling given `fn` on each key and value of
// `collection`.
//
// `fn` must return new entries to populate the map.
//
// @ex Mp.mapToEntries(['a', 'b'], (x, i) => [x, i])
// @see St.asyncMap
Mp.mapToEntries = function mapToEntries<KFrom, VFrom, KTo, VTo>(
  collection: KeyedCollection<KFrom, VFrom>,
  fn: (VFrom, KFrom) => [KTo, VTo],
): $Map<KTo, VTo> {
  const result = mp();
  for (const [key, item] of collection.entries()) {
    const [newKey, newItem] = fn(item, key);
    result.set(newKey, newItem);
  }
  return m(result);
};

// Create a new map by grouping values from `collection` for which `fn`
// returns the same key.
//
// The new map has Arrays of original values as its values.
// Values for which `fn` returns null or undefined are ommited.
//
// @ex Mp.group([1, 2, 3], Mth.isOdd)
// @see Ar.partition
Mp.group = function group<V, KTo>(
  collection: Collection<V>,
  fn: V => ?KTo,
): $Map<KTo, $Array<V>> {
  const result = mp();
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
};

module.exports = Mp;
