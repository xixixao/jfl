'use strict';
Object.defineProperty(exports, '__esModule', {value: true});
exports.equals = equals;
exports.equalsNested = equalsNested;
exports.isEmpty = isEmpty;
exports.count = count;
exports.contains = contains;
exports.containsKey = containsKey;
exports.any = any;
exports.every = every;
exports.find = find;
exports.findX = findX;
exports.findKey = findKey;
exports.findKeyX = findKeyX;
exports.first = first;
exports.firstX = firstX;
exports.onlyX = onlyX;
exports.last = last;
exports.lastX = lastX;
exports.at = at;
exports.atX = atX;
exports.firstKey = firstKey;
exports.firstKeyX = firstKeyX;
exports.lastKey = lastKey;
exports.lastKeyX = lastKeyX;
exports.forEach = forEach;
exports.reduce = reduce;

var Ar = _interopRequireWildcard(require('./array'));
var Mp = _interopRequireWildcard(require('./map'));
var St = _interopRequireWildcard(require('./set'));
function _getRequireWildcardCache() {
  if (typeof WeakMap !== 'function') return null;
  var cache = new WeakMap();
  _getRequireWildcardCache = function () {
    return cache;
  };
  return cache;
}
function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
    return {default: obj};
  }
  var cache = _getRequireWildcardCache();
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor =
    Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor
        ? Object.getOwnPropertyDescriptor(obj, key)
        : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}

const Cl = exports;

/// Checks

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
function equals(first, ...rest) {
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
  const args = [first, ...rest];
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
function equalsNested(first, ...rest) {
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
  const args = [first, ...rest];
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
 * @ex Cl.isEmpty(Ar()) // true
 * @ex Cl.isEmpty(Mp()) // true
 * @ex Cl.isEmpty(St()) // true
 * @see Cl.count
 */
function isEmpty(collection) {
  return Cl.count(collection) === 0;
}

/**
 * Get the size of given `collection`.
 *
 * @time O(1)
 * @space O(1)
 * @ex Cl.count([1, 2, 3]) // 3
 * @ex Cl.count(Mp({a: 1, b: 3})) // 2
 * @alias length, size
 * @see Cl.isEmpty
 */
function count(collection) {
  const size = collection.size;
  return size != null ? size : collection.length;
}

/**
 * Returns whether given `collection` contains given `value`.
 *
 * @time O(n) (O(1) for Sets)
 * @space O(1)
 * @ex Cl.contains([2, 4, 3], 1) // true
 * @ex Cl.contains(St(2, 4, 3), 4) // true
 * @ex Cl.contains(Mp({a: 1, b: 3}), 1) // true
 * @see Cl.findKey
 */
function contains(collection, value) {
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
 * @ex Cl.contains([2, 4, 3], 1)
 * @ex Cl.contains(St(2, 4, 3), 4)
 * @ex Cl.contains(Mp({a: 1, b: 3}), 'a')
 * @see Cl.findKey
 */
function containsKey(collection, key) {
  if (Array.isArray(collection)) {
    return key in collection;
  } else {
    return collection.has(key);
  }
}

/**
 * Returns whether some values satisfy `predicateFn`.
 *
 * @time O(n)
 * @space O(1)
 * @ex Cl.any([1, 5, 4], n => Mth.isEven(n)) // true
 * @see Cl.every
 */
function any(collection, predicateFn) {
  for (const [key, item] of collection.entries()) {
    if (predicateFn(item, key, collection)) {
      return true;
    }
  }
  return false;
}

/**
 * Returns whether all values satisfy `predicateFn`.
 *
 * @time O(n)
 * @space O(1)
 * @ex Cl.every([1, 5, 3], n => Mth.isOdd(n)) // true
 * @see Cl.any
 */
function every(collection, predicateFn) {
  for (const [key, item] of collection.entries()) {
    if (!predicateFn(item, key, collection)) {
      return false;
    }
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
 * @ex Cl.find([2, 4, 3], n => Mth.isOdd(n)) // 2
 * @see Cl.findX, Cl.findKey, Cl.findKeyX
 */
function find(collection, predicateFn) {
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
 * @ex Cl.find([2, 4, 3], n => Mth.isOdd(n)) // 2
 * @see Cl.find, Cl.findKey, Cl.findKeyX
 */
function findX(collection, predicateFn) {
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
function findKey(collection, predicateFn) {
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
 * @ex Cl.findKey([2, 4, 3], n => Mth.isOdd(n)) // 2
 * @see Cl.find
 */
function findKeyX(collection, predicateFn) {
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
 * @ex Cl.first(Ar()) // null
 * @ex Cl.first([1, 3]) // 1
 * @see Cl.firstX
 */
function first(collection) {
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
function firstX(collection) {
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
 * @ex Cl.firstX([1]) // 1
 * @see Cl.firstX
 */
function onlyX(collection) {
  let result = null;
  let foundFirst = false;
  for (const item of collection.values()) {
    if (foundFirst) {
      throw new Error(
        'Expected exactly one item in collection, but there were more',
      );
    }
    result = item;
    foundFirst = true;
  }
  if (!foundFirst) {
    throw new Error(
      'Expected exactly one item in collection, but the collection was empty.',
    );
  }
  return result;
}

/**
 * Returns the last value in `collection` if it's not empty, null otherwise.
 *
 * @time O(n) (O(1) for Arrays)
 * @space O(1)
 * @ex Cl.last(Ar()) // null
 * @ex Cl.last([1, 3]) // 3
 * @see Cl.lastx
 */
function last(collection) {
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
function lastX(collection) {
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
  return result;
}

/**
 * Returns the value at given iteration index or null.
 *
 * For accessing values using corresponding keys, use `Ar.get`,
 * `Map.prototype.get` or `Set.prototype.has`, which are all correctly
 * typed.
 *
 * @time O(n) (O(1) for Arrays)
 * @space O(1)
 * @ex Cl.at(St(), 2) // null
 * @ex Cl.at(St('a', 'b', 'c'), 2) // 'c'
 * @see Cl.atx, Cl.contains, Ar.get
 */
function at(collection, index) {
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
 * @ex Cl.atX(St('a', 'b', 'c'), 2) // 'c'
 * @see Cl.at
 */
function atX(collection, index) {
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
  return null; // unreachable
}

/**
 * Returns the first key in `collection` if it's not empty, null otherwise.
 *
 * @time O(1)
 * @space O(1)
 * @ex Cl.firstKey(Mp()) // null
 * @ex Cl.firstKey(Mp({a: 1, b: 2})) // 'a'
 * @see Cl.firstKeyX
 */
function firstKey(collection) {
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
 * @ex Cl.firstKeyX(Mp({a: 1, b: 2})) // 1
 * @see Cl.firstKey
 */
function firstKeyX(collection) {
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
 * @ex Cl.lastKey(Mp()) // null
 * @ex Cl.lastKey(Mp({a: 1, b: 2})) // 'b'
 * @see Cl.lastKeyX
 */
function lastKey(collection) {
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
 * @ex Cl.lastKeyX(Mp({a: 1, b: 2})) // 'b'
 * @see Cl.lastKey
 */
function lastKeyX(collection) {
  if (Cl.isEmpty(collection)) {
    throw new Error('Expected a non-empty collection, was empty instead.');
  }
  let result = null;
  for (const item of collection.keys()) {
    result = item;
  }
  return result;
}

/// Transform

/**
 * Execute `fn` for every value and key in `collection`.
 *
 * @time O(n)
 * @space O(1)
 * @ex Cl.forEach([1, 2, 3], (n, index, array) => {})
 * @alias each
 */
function forEach(collection, fn) {
  return collection.forEach(fn);
}

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
function reduce(collection, fn, initialValue) {
  const noInitialValue = arguments.length < 3;
  if (Ar.isArray(collection)) {
    if (noInitialValue) {
      return collection.reduce(fn);
    } else {
      return collection.reduce(fn, initialValue);
    }
  }
  let acc;
  let isFirst = true;
  if (!noInitialValue) {
    acc = initialValue;
  }
  for (const [key, item] of collection.entries()) {
    if (noInitialValue && isFirst) {
      acc = item;
      isFirst = false;
      continue;
    }
    acc = fn(acc, item, key, collection);
  }
  return acc;
}
