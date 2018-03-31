// @flow

'use strict';

import type {Collection, KeyedCollection, $Array} from './types.flow';

const Cl = require('./collection');
const Ar = require('./array');

const EMPTY = new Set(); // Returned whenever we can return an empty set

function m<V>(set: $Set<V>): $Set<V> {
  return set.size === 0 ? (EMPTY: any) : set;
}

// non-memoized for internal implementation
function st<V>(): $Set<V> {
  return (new Set(): any);
}

// Create a set.
//
// Can contain any JS value. Maintains uniqueness.
//
// @ex St(1, 2, 3)
// @alias create, constructor, new
// @see St.from
function St<V>(...args: $Array<V>): $Set<V> {
  return m((new Set(args): any));
}

// Returns whether given collection is a Set.
//
// Doesn't work for any object, only pass in Arrays, Maps and Sets.
//
// @ex St.isSet(St(1, 2, 3))
// @see Ar.isArray, Mp.isMap
St.isSet = function isSet(argument: Collection<any>): boolean {
  return (argument: any).add !== undefined;
};

// Returns whether given Sets are equal.
//
// All items must be strictly equal.
//
// @ex St.shallowEquals([1, 2], [1, 2])
// @see Ar.shallowEquals, Mp.shallowEquals
St.shallowEquals = function shallowEquals<V>(
  set: Set<V>,
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
    for (const item of set) {
      if (!compared.has(item)) {
        return false;
      }
    }
  }
  return true;
};

// Convert any `collection` of values to a Set of values.
//
// Note that this is not a way to clone a set, if passed a set, the same
// set will be returned.
//
// @ex St.from([1, 2, 3])
// @ex St.from(Mp({a: 1, b: 2, c: 3}))
// @alias values, fromValues
// @see St
St.from = function from<V>(collection: Collection<V>): $Set<V> {
  if (St.isSet(collection)) {
    return (collection: any);
  }
  const result = st();
  for (const item of collection.values()) {
    result.add(item);
  }
  return m(result);
};

// Create a Set which is a union of all values in given `collections`.
//
// @ex St.union(St(1, 2, 3), St(1, 4, 5))
// @alias join
// @see St.intersect
St.union = function union<V>(...collections: $Array<Collection<V>>): $Set<V> {
  const result = st();
  for (const collection of collections) {
    for (const item of collection.values()) {
      result.add(item);
    }
  }
  return m(result);
};

// Create a Set which is an intersection of all values in given `collections`.
//
// @ex St.intersect(St(1, 2, 3), St(2, 3, 6), St(0, 1, 2))
// @see St.union, St.diff
St.intersect = function intersect<V>(
  ...collections: $Array<Collection<V>>
): $Set<V> {
  if (collections.length === 0) {
    return St();
  }
  let intersection = St.from(collections[0]);
  let i = 0;
  for (const collection of collections) {
    if (i === 0) {
      i++;
      continue;
    }
    const nextIntersection = st();
    for (const item of collection.values()) {
      if (intersection.has(item)) {
        nextIntersection.add(item);
      }
    }
    intersection = nextIntersection;
  }
  return m(intersection);
};

// Create a Set which has the values from `collection` that do not appear in
// any of the given `collections`.
//
// @ex St.diff(St(1, 2, 3), St(2, 4), St(1, 2, 4))
// @see St.union, St.intersect
St.diff = function diff<V>(
  collection: Collection<V>,
  ...collections: $Array<Collection<V>>
): $Set<V> {
  if (collections.length === 0) {
    return St.from(collection);
  }
  const filter = St.union(...collections);
  const result = st();
  for (const item of collection.values()) {
    if (!filter.has(item)) {
      result.add(item);
    }
  }
  return m(result);
};

// St.diff
// St.map(a, x => Mth.abs(x))

// Create a new set by calling given `fn` on each value of `collection`.
//
// @ex St.map([1, 2], x => x * 2)
// @see St.asyncMap
St.map = function map<VFrom, VTo>(
  collection: Collection<VFrom>,
  fn: VFrom => VTo,
): $Set<VTo> {
  const result = st();
  for (const item of collection.values()) {
    result.add(fn(item));
  }
  return m(result);
};

// Create a promise of a set by calling given async `fn` on each value of
// `collection`.
//
// Executes `fn` on all items in `collection` concurrently.
//
// @ex await St.asyncMap([1, 2], async x => x * 2)
// @alias Promise.all, genMap
St.asyncMap = function asyncMap<VFrom, VTo>(
  collection: Collection<VFrom>,
  fn: VFrom => Promise<VTo>,
): Promise<$Set<VTo>> {
  return Promise.all(Array.from(St.map(collection, fn))).then(result =>
    St.from(result),
  );
};

// Create a new set by filtering out values for which `fn` returns false.
//
// @ex St.filter(St(1, 2, 3), Mth.isOdd)
// @see St.map, St.filterNullish
St.filter = function filter<V>(
  collection: Collection<V>,
  fn: V => boolean,
): $Set<V> {
  const result = st();
  for (const item of collection.values()) {
    if (fn(item)) {
      result.add(item);
    }
  }
  return m(result);
};

// Create a new set by filtering out `null`s and `undefined`s.
//
// Here because its type is more specific then the generic `filter` function.
//
// @ex St.filterNulls([1, null, 3])
// @see St.filter
St.filterNulls = function filterNulls<V>(collection: Collection<?V>): $Set<V> {
  const result = st();
  for (const item of collection.values()) {
    if (item != null) {
      result.add(item);
    }
  }
  return m(result);
};

module.exports = St;
