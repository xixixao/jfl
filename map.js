// @flow

'use strict';

import type {Collection, KeyedCollection, $Array} from './types.flow';

// // TODO: I need covariance here, which means I need $ReadOnlyMap in Flow
// declare class $Map<K, +V> extends Map<K, V> {}

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
function Mp<K: string, V>(object: {[key: K]: V}): $Map<K, V> {
  const map = mp();
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      map.set(key, object[(key: any)]);
    }
  }
  return m((map: any));
}

// Returns whether given value is a Map.
//
// @ex Mp.isMap([1, 2, 3])
// @see St.isSet, Ar.isArray
Mp.isMap = function isMap(argument: Collection<any>): boolean {
  return (argument: any).set !== undefined;
};

// Returns whether given Maps are equal.
//
// All items must be strictly equal.
//
// @ex Mp.shallowEquals(Mp({a: 1, b: 2}), Mp({a: 1, b: 2}))
// @see St.shallowEquals, Ar.shallowEquals
Mp.shallowEquals = function shallowEquals<K, V>(
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

// TODO:
// Mp.merge(a, b)
// Mp.map(a, (x, k) => x * k))
// Mp.group
// Mp.fromEntries
// Mp.fromZip

module.exports = Mp;
