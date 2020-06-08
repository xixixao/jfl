'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.$Ar = $Ar;
exports.from = from;
exports.fromAsync = fromAsync;
exports.keys = keys;
exports.entries = entries;
exports.range = range;
exports.rangeInclusive = rangeInclusive;
exports.rangeDescending = rangeDescending;
exports.rangeDynamic = rangeDynamic;
exports.repeat = repeat;
exports.fill = fill;
exports.generate = generate;
exports.isArray = isArray;
exports.equals = equals;
exports.equalsNested = equalsNested;
exports.concat = concat;
exports.flatten = flatten;
exports.zip = zip;
exports.zipWith = zipWith;
exports.get = get;
exports.filter = filter;
exports.filterAsync = filterAsync;
exports.filterNulls = filterNulls;
exports.findIndices = findIndices;
exports.take = take;
exports.drop = drop;
exports.map = map;
exports.mapAsync = mapAsync;
exports.flatMap = flatMap;
exports.reverse = reverse;
exports.scan = scan;
exports.chunks = chunks;
exports.partition = partition;
exports.slice = slice;
exports.splice = splice;
exports.splitAt = splitAt;
exports.span = span;
exports.takeWhile = takeWhile;
exports.dropWhile = dropWhile;
exports.sort = sort;
exports.numericalSort = numericalSort;
exports.fastSort = fastSort;

var Cl = _interopRequireWildcard(require("./collection"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const EMPTY = []; // Returned whenever we can return an empty array

function m(array) {
  return array.length === 0 ? EMPTY : array;
} /// Construction
// Create an array.
//
// Prefer array literal `[1, 2, 3]` unless you need a function, or you want
// an empty array, in which case use the memoized `$Ar()`.
//
// @ex $Ar(1, 2, 3)
// @alias create, constructor, new
// @see Ar.from


function $Ar(...args) {
  return m(args);
} // Convert any `collection` of values to an Array of values.
//
// Note that this is not a way to clone an array, if passed an array, the same
// array will be returned.
//
// @ex Ar.from(Set(1, 2, 3))
// @ex Ar.from(Mp({a: 1, b: 2, c: 3}))
// @alias values, fromValues
// @see Ar


function from(collection) {
  if (isArray(collection)) {
    return collection;
  }

  const result = [];

  for (const item of collection.values()) {
    result.push(item);
  }

  return m(result);
} // Convert any `collection` of awaitable promises of values to a single
// promise of an Array of values.
//
// @ex Ar.fromAsync([(async () => 1)(), (async () => 2)()])
// @alias all
// @see Ar.from


function fromAsync(collection) {
  return Promise.all(from(collection));
} // Convert any `collection` with keys to an Array of keys.
//
// Notably the keys of a Set are just its values. The keys of an Array are
// its indices.
//
// @see Ar.from


function keys(collection) {
  const result = [];

  for (const item of collection.keys()) {
    result.push(item);
  }

  return m(result);
} // Convert any `collection` with keys to an Array of key value pairs.
//
// Notably the keys of a Set are just its values. The keys of an Array are
// its indices.
//
// @see Ar.from


function entries(collection) {
  const result = [];

  for (const item of collection.entries()) {
    result.push(item);
  }

  return m(result);
} // Create an array of numbers.
//
// The start of the range is inclusive, the end is exclusive. By default
// increments by 1.
//
// @ex Ar.range(1, 6)
// @ex Ar.range(-0.5, 0.51, 0.5)
// @see Ar.rangeInclusive, Ar.rangeDescending, Ar.rangeDynamic


function range(fromInclusive, toExclusive, step = 1) {
  if (step < 0) {
    throw new Error(`\`step\` must be a positive number, got \`${step}\` instead.`);
  }

  const result = [];
  let current = fromInclusive;

  while (current < toExclusive) {
    result.push(current);
    current += step;
  }

  return m(result);
} // Create an array of numbers.
//
// A version of `Ar.range` where the end is inclusive.
//
// @ex Ar.range(-0.5, 0.5, 0.5)
// @see Ar.range


function rangeInclusive(fromInclusive, toInclusive, step = 1) {
  if (step < 0) {
    throw new Error(`\`step\` must be a positive number, got \`${step}\` instead.`);
  }

  const result = [];
  let current = fromInclusive;

  while (current <= toInclusive) {
    result.push(current);
    current += step;
  }

  return m(result);
} // Create an array of numbers.
//
// A version of `Ar.range` where the array of numbers has decreasing order. By
// default increments by -1.
//
// @ex Ar.range(5, 1)
// @ex Ar.range(2, 1, 0.2)
// @see Ar.range


function rangeDescending(fromInclusive, toExclusive, step = 1) {
  if (step < 0) {
    throw new Error(`\`step\` must be a positive number, got \`${step}\` instead`);
  }

  const result = [];
  let current = fromInclusive;

  while (current > toExclusive) {
    result.push(current);
    current -= step;
  }

  return m(result);
} // Create an array of numbers.
//
// A version of `Ar.range` where the array of numbers has increasing or
// decreasing order, depending on given range limits. Both limits are inclusive.
//
// @ex Ar.range(2, 6, 2)
// @ex Ar.range(6, 2, 2)
// @see Ar.range


function rangeDynamic(fromInclusive, toInclusive, step = 1) {
  if (step < 0) {
    throw new Error(`\`step\` must be a positive number, got \`${step}\` instead`);
  }

  const result = [];
  const ascending = fromInclusive < toInclusive;
  let current = fromInclusive;
  const end = toInclusive;
  const dynamicStep = ascending ? step : -step;

  while (ascending && current <= end || !ascending && current >= end) {
    result.push(current);
    current += dynamicStep;
  }

  return m(result);
} // Create an array filled with a number of given `value`s.
//
// The `value` will be referenced, not cloned.
//
// @ex Ar.repeat("value", 4)
// @see Ar.range, Seq.repeat


function repeat(value, times) {
  const result = [];

  for (let i = 0; i < times; i++) {
    result.push(value);
  }

  return m(result);
} // Create an array filled with results of `fn`.
//
// `fn` take as the first argument the index where the current invocation's
// result will be placed.
//
// @ex Ar.fill(4, i => i)
// @see Ar.repeat, Ar.range, Seq.fill


function fill(times, fn) {
  const result = [];

  for (let i = 0; i < times; i++) {
    result.push(fn(i));
  }

  return m(result);
} // Create an array using a `seed` value and a function which given the seed
// returns an item to be contained in the array and a new seed value.
//
// To mark the end of the array, `fn` must return `null` or `undefined`.
//
// @ex Ar.generate(2, n => n < 64 ? [n, n * n] : null)
// @alias unfold, unreduce
// @see Seq.generate, KdSeq.generate


function generate(seed, fn) {
  const result = [];
  let acc = seed;

  while (true) {
    const maybeIteration = fn(acc);

    if (maybeIteration == null) {
      break;
    }

    const [item, newAcc] = maybeIteration;
    result.push(item);
    acc = newAcc;
  }

  return m(result);
} /// Checks
// Returns whether given value is an Array.
//
// @ex Ar.isArray([1, 2, 3])
// @see St.isSet, Mp.isMap


function isArray(argument) {
  return Array.isArray(argument);
} // Returns whether given Arrays are equal.
//
// All items must be strictly equal.
//
// @time O(n)
// @space O(1)
// @ex Ar.equals([1, 2], [1, 2])
// @see St.equals, Mp.equals, Cl.equals


function equals(array, ...arrays) {
  for (const compared of arrays) {
    if (compared === array) {
      continue;
    }

    if (compared.length !== array.length) {
      return false;
    }

    for (let i = 0; i < array.length; i++) {
      const value = array[i];

      if (compared[i] !== value) {
        return false;
      }
    }
  }

  return true;
} // Returns whether given Arrays and any nested collections are equal.
//
// Any contained collections must deeply equal, all other items must be
// strictly equal.
//
// @time O(n)
// @space O(1)
// @ex Ar.equalsNested([[1], [2], 3], [[1], [2], 3])
// @see St.equalsNested, Mp.equalsNested, Cl.equalsNested


function equalsNested(array, ...arrays) {
  for (const compared of arrays) {
    if (compared === array) {
      continue;
    }

    if (compared.length !== array.length) {
      return false;
    }

    for (let i = 0; i < array.length; i++) {
      const value = array[i];

      if (!Cl.equalsNested(compared[i], value)) {
        return false;
      }
    }
  }

  return true;
} /// Combine
// Concatenate multiple arrays together.
//
// @ex Ar.concat([1, 2], [3, 4])
// @alias join, union
// @see Ar.flatten


function concat(...collections) {
  return flatten(collections);
} // Concatenate a collection of arrays together.
//
// @ex Ar.concat([1, 2], [3, 4])
// @alias join, union
// @see Ar.flatten


function flatten(collectionOfArrays) {
  const result = [];

  for (const nested of collectionOfArrays.values()) {
    for (const item of nested.values()) {
      result.push(item);
    }
  }

  return m(result);
}

// Join collections into an array of tuples of values from each collection.
//
// The resulting array has the same length as the smallest given collection.
// Excess values are ignored.
//
// @ex Ar.zip([1, 2, 3], ['a', 'b', 'c'], [5, 6, 7])
// @alias zipAll
// @see Ar.zipWith
function zip(...collections) {
  if (collections.length < 1) {
    throw new Error('Expected at least one collection, got none instead.');
  }

  const first = collections[0];
  let zippedLength = Cl.count(first);

  for (const collection of collections) {
    zippedLength = Math.min(zippedLength, Cl.count(collection));
  }

  const result = fill(zippedLength, _ => []);

  for (const collection of collections) {
    let i = 0;

    for (const item of collection.values()) {
      result[i].push(item);
      i++;
    }
  }

  return m(result);
} // Join mulptiple collections into an array of values resulting form calling
// `fn` on items from each collection.
//
// Note that this function has unusual order of arguments because JavaScript
// enforces that the rest parameter is the last one. The resulting array has
// the same length as the smallest given collection. Excess values are ignored.
//
// @ex Ar.zipWith((a, b, c) => a + b * c, [1, 2, 3], [5, 6, 7], [2, 4, 6])
// @see Ar.zip


function zipWith(fn, ...collections) {
  return map(zip(...collections), tuple => fn(...tuple));
} /// Select
// Return element at given index.
//
// Use this if you care about accurate typing (until JS type systems
// fix the typing of the built-in). Otherwise use `array[index]`.
//
// @ex Ar.get([], 1) // undefined
// @see Cl.at


function get(array, index) {
  return array[index];
} // Create a new array by filtering out values for which `fn` returns false.
//
// @ex Ar.filter([1, 2, 3], Mth.isOdd)
// @see Ar.map, Ar.filterNulls, Ar.findIndices


function filter(collection, predicate) {
  const result = [];

  for (const item of collection.values()) {
    if (predicate(item)) {
      result.push(item);
    }
  }

  return m(result);
} // Create a promise of an array by filtering out values in `collection`
// for which async `fn` returns false.
//
// Executes `predicate` on all items in `collection` concurrently.
//
// @ex Ar.filterAsync([1, 2, 3], async x => Mth.isOdd(x))
// @see Ar.filter, Ar.mapAsync


async function filterAsync(collection, predicate) {
  const filter = await mapAsync(collection, predicate);
  const result = [];
  let i = 0;

  for (const item of collection.values()) {
    if (filter[i]) {
      result.push(item);
    }

    i++;
  }

  return m(result);
} // Create a new array by filtering out `null`s and `undefined`s.
//
// Here because its type is more specific then the generic `filter` function.
//
// @ex Ar.filterNulls([1, null, 3])
// @see Ar.filter


function filterNulls(collection) {
  const result = [];

  for (const item of collection.values()) {
    if (item != null) {
      result.push(item);
    }
  }

  return m(result);
} // TODO: This should probably be `findKeys`, and it's not in HSL,
// TODO: it would be something like keys(Dict\filter($x, $p))
// Create an array of indices of values passing given `predicateFn`.
//
// @ex Ar.findIndices([1, 2, 3], Mth.isOdd)
// @see Ar.filter


function findIndices(collection, predicateFn) {
  const result = [];
  let i = 0;

  for (const item of collection.values()) {
    if (predicateFn(item)) {
      result.push(i);
    }

    i++;
  }

  return m(result);
} // TODO: unique
// TODO: uniqueBy
// Create an array containing the first `n` items of `collection`.
//
// @ex Ar.take([1, 2, 3], 2)
// @see Ar.drop, Ar.splitAt, Ar.takeWhile


function take(collection, n) {
  let i = 0;
  const result = [];

  for (const item of collection.values()) {
    if (i >= n) {
      break;
    }

    result.push(item);
    i++;
  }

  return m(result);
} // Create an array containing all but the first `n` items of `collection`.
//
// @ex Ar.drop([1, 2, 3], 2)
// @see Ar.take, Ar.splitAt, Ar.dropWhile


function drop(collection, n) {
  let i = 0;
  const result = [];

  for (const item of collection.values()) {
    if (i >= n) {
      result.push(item);
    }

    i++;
  }

  return m(result);
} /// Transform
// Create a new array by calling given `fn` on each value of `collection`.
//
// @ex Ar.map([1, 2], x => x * 2)
// @see Ar.mapAsync


function map(collection, fn) {
  const result = [];

  for (const item of collection.values()) {
    result.push(fn(item));
  }

  return m(result);
} // Create a promise of an array by calling given async `fn` on each value of
// `collection`.
//
// Executes `fn` on all items in `collection` concurrently.
//
// @ex await Ar.mapAsync([1, 2], async x => x * 2)
// @alias Promise.all, genMap


function mapAsync(collection, fn) {
  return Promise.all(map(collection, fn));
} // Create a new array by calling given `fn` on each value of `collection` and
// flattening the results.
//
// Equivalent to using `map` followed by `flatten`, for simplicity and improved
// performance.
//
// @ex Ar.flatMap([1, 2], x => [x - 1, x + 1])
// @see Ar.mapAsync


function flatMap(collection, fn) {
  const result = [];

  for (const item of collection.values()) {
    const mapped = fn(item);

    for (const mappedItem of mapped.values()) {
      result.push(mappedItem);
    }
  }

  return m(result);
} // Create an array containing the items of `collection` in reverse order.
//
// @ex Ar.reverse([1, 2, 3])
// @alias flip


function reverse(collection) {
  const result = [];

  for (const item of collection.values()) {
    result.push(item);
  }

  return m(result.reverse());
} // Create an array of values based on a reduction of given `collection`.
//
// Similar to `Cl.reduce` but instead of returning the final value accumulates
// all the intermediate accumulators.
//
// @ex Ar.scan([1, 2, 3, 4], 0, (acc, x) => acc + x)
// @see Cl.reduce


function scan(collection, initialValue, fn) {
  const result = [];
  let acc = initialValue;

  for (const item of collection.values()) {
    acc = fn(acc, item);
    result.push(acc);
  }

  return m(result);
} /// Divide
// Create an array of arrays which are chunks of given `collection` of `size`.
//
// If the `collection` doesn't divide evenly, the final chunk we smaller than
// the rest.
//
// @ex Ar.chunk([1, 2, 3, 4, 5], 2)
// @see Ar.splitAt, Ar.partition


function chunks(collection, size) {
  if (size < 1) {
    throw new Error(`Expected \`size\` to be greater than 0, got \`${size}\``);
  }

  const result = [];
  let chunk = [];
  let i = 0;

  for (const item of collection.values()) {
    if (i >= size) {
      i = 0;
      result.push(chunk);
      chunk = [];
    }

    chunk.push(item);
    i++;
  }

  if (chunk.length > 0) {
    result.push(chunk);
  }

  return m(result);
} // Create a tuple of Arrays containing items of `collection` which match and
// don't match `predicateFn` respectively.
//
// More effecient combination of `Ar.filter` and `Ar.filter` combined
// with `Fn.not`.
//
// @ex Ar.partition([1, 2, 3, 4], Mth.isEven)
// @alias split
// @see Mp.group


function partition(collection, predicateFn) {
  const positives = [];
  const negatives = [];

  for (const item of collection.values()) {
    if (predicateFn(item)) {
      positives.push(item);
    } else {
      negatives.push(item);
    }
  }

  return [m(positives), m(negatives)];
} // Create an array containing a subset of values in `collection`.
//
// Note that this is not a way to clone an array, if given an array and indices
// corresponding to its full size it returns the original array.
//
// @ex Ar.slice([1, 2, 3, 4], 1, 3)
// @see Ar.splice


function slice(collection, startIndexInclusive, endIndexExclusive) {
  if (Array.isArray(collection)) {
    if (startIndexInclusive === 0 && (endIndexExclusive == null || endIndexExclusive === Cl.count(collection))) {
      return collection;
    }

    return collection.slice(startIndexInclusive, endIndexExclusive);
  }

  const end = endIndexExclusive != null && endIndexExclusive < 0 ? Cl.count(collection) + endIndexExclusive : endIndexExclusive;
  const result = [];
  let i = 0;

  for (const item of collection.values()) {
    if (end != null && i >= end) {
      break;
    }

    if (i >= startIndexInclusive) {
      result.push(item);
    }

    i++;
  }

  return m(result);
} // Create an array containing a subset of values in `collection` with any given
// `item`s added.
//
// Note that unlikely Array.prototype.splice this function returns the new
// array, not the deleted items.
//
// @ex Ar.slice([1, 2, 3, 4], 1, 3)
// @see Ar.splice


function splice(collection, startIndex, deleteCount, ...items) {
  const result = [];

  for (const item of collection.values()) {
    result.push(item);
  }

  result.splice(startIndex, deleteCount, ...items);
  return m(result);
} // Create a tuple of arrays containing the first `n` items
// and all but the first `n` items of given `collection`.
//
// @ex Ar.split([1, 2, 3], 2)
// @see Ar.drop, Ar.take, Ar.span


function splitAt(collection, n) {
  let i = 0;
  const before = [];
  const after = [];

  for (const item of collection.values()) {
    if (i < n) {
      before.push(item);
    } else {
      after.push(item);
    }

    i++;
  }

  return [m(before), m(after)];
} // Create a tuple of arrays containing all the items of `collection` following
// and preceding the first item for which `fn` returns false.
//
// @ex Ar.span([1, 3, 4, 7], Mth.isOdd)
// @alias break
// @see Ar.splitAt


function span(collection, fn) {
  const before = [];
  const after = [];
  let isBefore = true;

  for (const item of collection.values()) {
    isBefore = isBefore && fn(item);

    if (isBefore) {
      before.push(item);
    } else {
      after.push(item);
    }
  }

  return [m(before), m(after)];
} // Create an array containing all the items of `collection` preceding the item
// for which `fn` returns false.
//
// @ex Ar.takeWhile([1, 3, 4, 7], Mth.isOdd)
// @see Ar.take


function takeWhile(collection, fn) {
  const result = [];

  for (const item of collection.values()) {
    if (!fn(item)) {
      break;
    }

    result.push(item);
  }

  return m(result);
} // Create an array containing all the items of `collection` following and
// including the first item for which `fn` returns false.
//
// @ex Ar.dropWhile([1, 3, 4, 7], Mth.isOdd)
// @see Ar.drop


function dropWhile(collection, fn) {
  const result = [];
  let taking = false;

  for (const item of collection.values()) {
    taking = taking || !fn(item);

    if (taking) {
      result.push(item);
    }
  }

  return m(result);
} /// Ordering
// Create an array of values in `collection` sorted.
//
// Uses string conversion and comparison by default. You can supply custom
// `compareFn`. This sort is stable at the cost of using more memory allocation.
//
// @ex Ar.sort([3, 2, 4, 1], (a, b) => b - a)
// @alias sortBy
// @see Ar.fastSort, Ar.numericalSort


function sort(collection, compareFn = defaultCompareFn) {
  const result = [];
  let i = 0;

  for (const item of collection.values()) {
    result.push([item, i]);
    i++;
  }

  result.sort(([a, ai], [b, bi]) => compareFn(a, b) || ai - bi).forEach(([x], i) => {
    result[i] = x;
  });
  return m(result);
}

function defaultCompareFn(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
} // TODO: sortBy
// Create an array of numbers from `collection` sorted in ascending order.
//
// @ex Ar.numericalSort([3, 2, 4, 1])
// @see Ar.fastSort, Ar.sort


function numericalSort(collection) {
  const result = [];

  for (const item of collection.values()) {
    result.push(item);
  }

  return m(result.sort((a, b) => a - b));
} // TODO: numericalSortBy (not fast)
// Create an array of values in `collection` sorted.
//
// A version of `Ar.sort` which is not stable, but uses less memory allocations.
//
// @ex Ar.fastSort([3, 2, 4, 1], (a, b) => b - a)
// @see Ar.sort


function fastSort(collection, compareFn) {
  const result = [];

  for (const item of collection.values()) {
    result.push(item);
  }

  return m(result.sort(compareFn));
} // TODO: fastSortBy