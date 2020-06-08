'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.$Mp = $Mp;
exports.isMap = isMap;
exports.equals = equals;
exports.equalsOrderIgnored = equalsOrderIgnored;
exports.equalsNested = equalsNested;
exports.of = of;
exports.from = from;
exports.fromAsync = fromAsync;
exports.fromValues = fromValues;
exports.fromKeys = fromKeys;
exports.fromKeysAsync = fromKeysAsync;
exports.fromEntries = fromEntries;
exports.unzip = unzip;
exports.toObject = toObject;
exports.set = set;
exports.merge = merge;
exports.map = map;
exports.mapToEntries = mapToEntries;
exports.group = group;

const Ar = require('./array');

const Cl = require('./collection');

const EMPTY = new Map(); // Returned whenever we can return an empty set

function m(map) {
  return map.size === 0 ? EMPTY : map;
} // non-memoized, mutable for internal implementation


function mp() {
  return new Map();
}
/**
 * Create a map.
 *
 * If your keys aren't strings, prefer `Mp.of`.
 *
 * @ex Mp({a: 1, b: 2, c: 3})
 * @alias create, constructor, new
 * @see Mp.of
 */


function $Mp(object) {
  const map = mp();

  if (object != null) {
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        map.set(key, object[key]);
      }
    }
  }

  return m(map);
}
/**
 * Returns whether given value is a Map.
 *
 * Use `instanceof Map` directly if you need the type system to pick up
 * the refinement.
 *
 * @ex Mp.isMap([1, 2, 3])
 * @see St.isSet, Ar.isArray
 */


function isMap(argument) {
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


function equals(map, ...maps) {
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


function equalsOrderIgnored(map, ...maps) {
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


function equalsNested(map, ...maps) {
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

      if (!Cl.equalsNested(keyInOrder, key) || !Cl.equalsNested(compared.get(key), map.get(keyInOrder))) {
        return false;
      }

      i++;
    }
  }

  return true;
}
/**
 * Create a map from given `pairs` of keys and values.
 *
 * @ex Mp.of([0, 2], [4, 2])
 * @see Mp, Mp.from, Mp.fromEntries
 */


function of(...pairs) {
  const result = mp();

  for (const [key, item] of pairs) {
    result.set(key, item);
  }

  return m(result);
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


function from(collection) {
  if (isMap(collection)) {
    return collection;
  }

  const result = mp();

  for (const [key, item] of collection.entries()) {
    result.set(key, item);
  }

  return m(result);
}
/**
 * Convert any keyed `collection` of promises to a Map.
 *
 * @ex Mp.fromAsync([(async () => 1)(), (async () => 2)()])
 * @see Mp.from, Ar.fromAsync
 */


async function fromAsync(collection) {
  const values = await Ar.fromAsync(collection);
  const result = mp();
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


function fromValues(collection, getKey) {
  const result = mp();

  for (const item of collection.values()) {
    result.set(getKey(item), item);
  }

  return m(result);
}
/**
 * TODO:
 * @see Mp.fromValues
 * */


function fromKeys(collection, getValue) {
  const result = mp();

  for (const key of collection.values()) {
    result.set(key, getValue(key));
  }

  return m(result);
}
/**
 * TODO:
 * @see Mp.fromKeys
 * */


async function fromKeysAsync(collection, getValue) {
  const values = await Ar.mapAsync(collection, getValue);
  const result = mp();
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


function fromEntries(collection) {
  const result = mp();

  for (const [key, value] of collection.values()) {
    result.set(key, value);
  }

  return m(result);
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


function unzip(keys, values) {
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
}
/**
 * Create a JavaScript Object from a string-keyed Map.
 *
 * @ex Mp.toObject(Mp({a: 1, b: 2}))
 * @see Mp
 */


function toObject(collection) {
  const result = {};

  for (const [key, item] of collection.entries()) {
    result[key] = item;
  }

  return result;
}
/**
 * Create a new Map by adding `value` under `key` to the set of key/value
 * pairs in `collection`.
 *
 * @ex Mp.set(Mp({a: 1}), 'b', 2)
 * @see Mp.merge
 */


function set(collection, key, value) {
  const result = mp();

  for (const [oldKey, oldValue] of collection.entries()) {
    result.set(oldKey, oldValue);
  }

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


function merge(...collections) {
  const result = mp();

  for (const collection of collections) {
    for (const [key, value] of collection.entries()) {
      result.set(key, value);
    }
  }

  return m(result);
}
/**
 * Create a new map by calling given `fn` on each key and value of `collection`.
 *
 * @ex Mp.map([1, 2], (x, i) => x * 2)
 * @see Mp.fromValues
 */


function map(collection, fn) {
  const result = mp();

  for (const [key, item] of collection.entries()) {
    result.set(key, fn(item, key));
  }

  return m(result);
} // TODO: mapKeys
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


function mapToEntries(collection, fn) {
  const result = mp();

  for (const [key, item] of collection.entries()) {
    const [newKey, newItem] = fn(item, key);
    result.set(newKey, newItem);
  }

  return m(result);
}
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


function group(collection, fn) {
  const result = mp();

  for (const item of collection.values()) {
    const key = fn(item);

    if (key != null) {
      if (result.has(key)) {
        result.get(key).push(item);
      } else {
        result.set(key, [item]);
      }
    }
  }

  return m(result);
} // TODO: diffByKey
// TODO: drop
// TODO: take
// TODO: filter
// TODO: filterAsync
// TODO: filterKeys
// TODO: filterNulls
// TODO: selectKeys
// TODO: unique
// TODO: uniqueBy
// TODO: partition
// TODO: reverse
// TODO: sort
// TODO: sortBy
// TODO: numericalSort
// TODO: numericalSortBy
// TODO: chunk
// TODO: countBy
// TODO: flatten
// TODO: fill
// TODO: flip
// TODO: pull