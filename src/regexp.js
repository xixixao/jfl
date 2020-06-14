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

/**
 * TODO:
 */
export function everyMatch(
  text: string,
  pattern: RegExp,
): $Array<RegExp$matchResult> {
  return Array.from(text.matchAll(pattern));
}

/**
 * TODO
 */
export function firstMatch(text: string, pattern: RegExp): ?RegExp$matchResult {
  return text.match(pattern);
}

// TODO:
// first_match 1111
// matches 1086
// replace 1392
// replace_with 66
// split 398
// to_string 3
