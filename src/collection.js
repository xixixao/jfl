// @flow

'use strict';

import type {Collection, KeyedCollection, $Array} from './types.flow';

const Ar = require('./array');
const Mp = require('./map');
const St = require('./set');

const Cl = exports;

// Get the size of given `collection`.
//
// This is a constant time operation.
//
// @ex Cl.count([1, 2, 3])
// @ex Cl.count(Mp({a: 1, b: 3}))
// @alias length
// @see Cl.isEmpty
Cl.count = function count<V>(collection: Collection<V>): number {
  return (collection: any).size || (collection: any).length;
};

// Returns true when `collection` is empty.
//
// @ex Cl.isEmpty(Ar())
// @ex Cl.isEmpty(Mp())
// @ex Cl.isEmpty(St())
// @see Cl.count
Cl.isEmpty = function isEmpty<V>(collection: Collection<V>): boolean {
  return Cl.count(collection) === 0;
};

Cl.shallowEquals = function shallowEquals<K, V>(
  first: KeyedCollection<K, V>,
  ...rest: $Array<KeyedCollection<K, V>>
): boolean {
  const isArray = Ar.isArray(first);
  const isSet = St.isSet(first);
  const isMap = Mp.isMap(first);
  for (const compared of rest) {
    if (
      (isArray && !Ar.isArray(compared)) ||
      (isSet && !St.isSet(compared)) ||
      (isMap && !Mp.isMap(compared)) ||
      compared !== first
    ) {
      return false;
    }
  }
  const args = [(first: any), ...(rest: any)];
  return isArray
    ? Ar.shallowEquals(...args)
    : isMap ? Mp.shallowEquals(...args) : St.shallowEquals(...args);
};

Cl.deepEquals = function deepEquals(first: any, ...rest: any): boolean {
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
  const args = [(first: any), ...(rest: any)];
  return isArray
    ? Ar.deepEquals(...args)
    : isMap ? Mp.deepEquals(...args) : isSet ? St.deepEquals(...args) : true;
};

// Execute `fn` for every value and key in `collection`.
//
// @ex Cl.forEach([1, 2, 3], (x, i, array) => {})
// @alias each
Cl.forEach = function forEach<K, V>(
  collection: KeyedCollection<K, V>,
  fn: (V, K, KeyedCollection<K, V>) => void,
  thisArg?: any,
): void {
  return collection.forEach(fn, thisArg);
};

// Returns whether given `key` exists in `collection`.
//
// @ex Cl.contains([2, 4, 3], 1)
// @ex Cl.contains(St(2, 4, 3), 4)
// @ex Cl.contains(Mp({a: 1, b: 3}), 'a')
// @see Cl.findKey
Cl.contains = function find<K, V>(
  collection: KeyedCollection<K, V>,
  key: K,
): boolean {
  if (Array.isArray(collection)) {
    return (key: any) in collection;
  } else {
    return (collection: any).has(key);
  }
};

// Returns first value for which `predicateFn` returns true in `collection`.
//
// @ex Cl.find([2, 4, 3], Mth.isOdd)
// @see Cl.findKey
Cl.find = function find<V>(
  collection: Collection<V>,
  predicateFn: V => boolean,
): ?V {
  for (const item of collection.values()) {
    if (predicateFn(item)) {
      return item;
    }
  }
  return null;
};

// Returns the key of the first value for which `predicateFn` returns true
// in `collection`.
//
// @ex Cl.findKey([2, 4, 3], Mth.isOdd)
// @see Cl.find
Cl.findKey = function findKey<K, V>(
  collection: KeyedCollection<K, V>,
  predicateFn: V => boolean,
): ?K {
  for (const [key, item] of collection.entries()) {
    if (predicateFn(item)) {
      return key;
    }
  }
  return null;
};

// Returns the first value in `collection` if it's not empty, null otherwise.
//
// @ex Cl.first(Ar())
// @ex Cl.first([1, 3])
// @see Cl.firstX
Cl.first = function first<V>(collection: Collection<V>): ?V {
  for (const item of collection.values()) {
    return item;
  }
  return null;
};

// Returns the first value in `collection` if it's not empty, throws otherwise.
//
// @ex Cl.firstX([1, 3])
// @see Cl.firstX
Cl.firstX = function firstX<V>(collection: Collection<V>): V {
  for (const item of collection.values()) {
    return item;
  }
  throw new Error('Expected a non-empty collection, was empty instead.');
};

// Returns the last value in `collection` if it's not empty, null otherwise.
//
// @ex Cl.last(Ar())
// @ex Cl.last([1, 3])
// @see Cl.lastx
Cl.last = function last<V>(collection: Collection<V>): ?V {
  if (Array.isArray(collection)) {
    return collection[collection.length - 1];
  }
  let result = null;
  for (const item of collection.values()) {
    result = item;
  }
  return result;
};

// Returns the last value in `collection` if it's not empty, throws otherwise.
//
// @ex Cl.lastX([1, 3])
// @see Cl.last
Cl.lastX = function lastX<V>(collection: Collection<V>): V {
  if (Cl.isEmpty(collection)) {
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
};

// Returns the value at given iteration index or null.
//
// For accessing values using corresponding keys, use `Ar.get`,
// `Map.prototype.get` or `Set.prototype.has`, which are all correctly
// typed.
//
// @ex Cl.at(St(), 2)
// @ex Cl.at(St(1, 2, 3), 2)
// @see Cl.atx, Cl.contains
Cl.at = function at<V>(collection: Collection<V>, index: number): ?V {
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
};

// Returns the value at given iteration index or throws.
//
// @ex Cl.atX(St(1, 2, 3), 2)
// @see Cl.at
Cl.atX = function atX<V>(collection: Collection<V>, index: number): V {
  if (Cl.isEmpty(collection)) {
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
};

// Returns the first key in `collection` if it's not empty, null otherwise.
//
// @ex Cl.firstKey(Mp())
// @ex Cl.firstKey(Mp({a: 1, b: 2}))
// @see Cl.firstKeyX
Cl.firstKey = function firstKey<K, V>(collection: KeyedCollection<K, V>): ?K {
  for (const key of collection.keys()) {
    return key;
  }
  return null;
};

// Returns the first key in `collection` if it's not empty, throws otherwise.
//
// @ex Cl.firstKeyX(Mp())
// @ex Cl.firstKeyX(Mp({a: 1, b: 2}))
// @see Cl.firstKey
Cl.firstKeyX = function firstKeyX<K, V>(collection: KeyedCollection<K, V>): K {
  for (const key of collection.keys()) {
    return key;
  }
  throw new Error('Expected a non-empty collection, was empty instead.');
};

// Returns the last key in `collection` if it's not empty, null otherwise.
//
// @ex Cl.lastKey(Mp())
// @ex Cl.lastKey(Mp({a: 1, b: 2}))
// @see Cl.lastKeyX
Cl.lastKey = function lastKey<K, V>(collection: KeyedCollection<K, V>): ?K {
  let result = null;
  for (const item of collection.keys()) {
    result = item;
  }
  return result;
};

// Returns the last key in `collection` if it's not empty, throws otherwise.
//
// @ex Cl.lastKeyX(Mp())
// @ex Cl.lastKeyX(Mp({a: 1, b: 2}))
// @see Cl.lastKey
Cl.lastKeyX = function lastKeyX<K, V>(collection: KeyedCollection<K, V>): K {
  if (Cl.isEmpty(collection)) {
    throw new Error('Expected a non-empty collection, was empty instead.');
  }
  let result = null;
  for (const item of collection.keys()) {
    result = item;
  }
  return (result: any);
};

// Reduce the collection to a single value using `fn`.
//
// If no `initialValue` is passed in, the collection must be non-empty.
//
// @ex Cl.reduce([2, 4, 3], (acc, x) => acc + x)
// @see Ar.scan
Cl.reduce = function reduce<K, V, A>(
  collection: KeyedCollection<K, V>,
  fn: (A, V, K, KeyedCollection<K, V>) => A,
  initialValue: A,
): A {
  let acc = initialValue;
  for (const [key, item] of collection.entries()) {
    // TODO: Support optional initialValue in typing
    // if (initialValue === undefined) {
    //   acc = (item: any);
    //   continue;
    // }
    acc = fn(acc, item, key, collection);
  }
  // Unfortunately the typing to support optional initival value is complex
  return acc;
};

// Returns whether all values satisfy `predicateFn`.
//
// @ex Cl.every([1, 5, 3], Mth.isOdd)
// @see Cl.any
Cl.every = function every<K, V>(
  collection: KeyedCollection<K, V>,
  predicateFn: (V, K, KeyedCollection<K, V>) => boolean,
): boolean {
  return Cl.reduce(
    collection,
    (a, b, i) => a && predicateFn(b, i, collection),
    true,
  );
};

// Returns whether some values satisfy `predicateFn`.
//
// @ex Cl.any([1, 5, 4], Mth.isEven)
// @see Cl.every
Cl.any = function any<K, V>(
  collection: KeyedCollection<K, V>,
  predicateFn: (V, K, KeyedCollection<K, V>) => boolean,
): boolean {
  return Cl.reduce(
    collection,
    (a, b, i) => a || predicateFn(b, i, collection),
    false,
  );
};

// Returns the sum of all values in `collection`.
//
// @ex Cl.sum([1, 2, 3])
// @see Cl.product
Cl.sum = function sum<K>(collection: KeyedCollection<K, number>): number {
  return Cl.reduce(collection, (a, b, i) => a + b, 0);
};

// Returns the product of all values in `collection`.
//
// @ex Cl.product([1, 2, 3])
// @see Cl.sum
Cl.sum = function sum<K>(collection: KeyedCollection<K, number>): number {
  return Cl.reduce(collection, (a, b, i) => a * b, 1);
};

// Cl.mean
// Cl.max
// Cl.min

module.exports = Cl;
