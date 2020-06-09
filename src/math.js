// @flow

'use strict';

import type {Collection, KeyedCollection, $Array} from './types.flow';

/// Checks

// Returns true when `n` is an odd integer.
//
// @ex Mth.isOdd(-3)
// @see Mth.isEven
export function isOdd(n: number): boolean {
  return n % 2 !== 0;
};

// Returns true when `n` is an even integer.
//
// @ex Mth.isEven(-10)
// @see Mth.isOdd
export function isEven(n: number): boolean {
  return n % 2 === 0;
};

// TODO: check what the type of Number.isNaN is, if it's already
// typed to numbers, drop this
export function isNaN() {

}

/// Operations

export function pmod(numerator: number, divisor: number): number {
  return (numerator % divisor + divisor) % divisor;
}

export function idiv(numerator: number, divisor: number): number {
  return Math.floor(numerator / divisor);
}

export function divx(numerator: number, divisor: number): number {
  if (divisor === 0) {
    throw new Error('Expected divisor to not be 0, but it was');
  }
  return numerator / divisor;
}

export function idivx(numerator: number, divisor: number): number {
  if (divisor === 0) {
    throw new Error('Expected divisor to not be 0, but it was');
  }
  return Math.floor(numerator / divisor);
}

export function squared(n: number): number {
  return n * n;
};

export function cubed(n: number): number {
  return n * n * n;
};

/// Collections

// TODO:
export function min() {

}

// TODO:
export function minBy() {

}

// TODO:
export function max() {

}

// TODO:
export function maxBy() {

}

// TODO:
export function mean() {

}

// TODO:
export function median() {

}

// Returns the sum of all values in `collection`.
//
// @ex Mth.sum([1, 2, 3])
// @see Mth.product
export function sum<K>(collection: KeyedCollection<K, number>): number {
  let total = 0;
  for (const value of collection.values()) {
    total += value;
  }
  return total;
};

// TODO:
export function sumFloat() {

}

/// Bases

// TODO:
export function fromBase() {

}

// TODO:
export function baseConvert() {

}

// TODO:
export function toBase() {

}
