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

Mth.neg = function neg(n: number): number {
  return -n;
};

module.exports = Mth;
