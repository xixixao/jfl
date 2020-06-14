// @flow

import type {$Array} from './types.flow';

import * as Str from './string';
import * as St from './set';

/**
 * TODO
 */
export function isRegExp(value: mixed): %checks {
  return value instanceof RegExp;
}

/**
 * TODO
 */
export function addFlags(pattern: RegExp, flags: string) {
  return new RegExp(pattern.source, pattern.flags + Str.uniqueChars(flags));
}

/**
 * TODO
 */
export function removeFlags(pattern: RegExp, flags: string) {
  const newFlags = St.diff(Str.chars(pattern.flags), Str.chars(flags));
  return new RegExp(pattern.source, Str.join(newFlags, ''));
}

// TODO:
// replace 1392
// replace_with 66
// split 398
// to_string 3
