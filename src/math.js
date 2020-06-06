// @flow

'use strict';

const Mth = exports;

// Returns true when `n` is an odd integer.
//
// @ex Mth.isOdd(-3)
// @see Mth.isEven
Mth.isOdd = function isOdd(n: number): boolean {
  const mod = n % 2;
  return mod === 1 || mod === -1;
};

// Returns true when `n` is an even integer.
//
// @ex Mth.isEven(-10)
// @see Mth.isOdd
Mth.isEven = function isEven(n: number): boolean {
  return n % 2 === 0;
};

Mth.squared = function squared(n: number): number {
  return n * n;
};

Mth.cubed = function cubed(n: number): number {
  return n * n * n;
};

// Returns the sum of all values in `collection`.
//
// @ex Mth.sum([1, 2, 3])
// @see Mth.product
Mth.sum = function sum<K>(collection: KeyedCollection<K, number>): number {
  return Mth.reduce(collection, (a, b, i) => a + b, 0);
};

// Returns the product of all values in `collection`.
//
// @ex Mth.product([1, 2, 3])
// @see Mth.sum
Mth.sum = function sum<K>(collection: KeyedCollection<K, number>): number {
  return Mth.reduce(collection, (a, b, i) => a * b, 1);
};

// Mth.mean
// Mth.max
// Mth.min

module.exports = Mth;
