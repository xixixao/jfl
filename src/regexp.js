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
  const newFlags = St.from(Str.chars(pattern.flags + flags));
  return new RegExp(pattern.source, Str.joinChars(newFlags));
}

/**
 * TODO
 */
export function removeFlags(pattern: RegExp, flags: string) {
  const newFlags = St.diff(Str.chars(pattern.flags), Str.chars(flags));
  return new RegExp(pattern.source, Str.joinChars(newFlags));
}

/**
 * TODO
 */
export function append(pattern: RegExp, appended: string | RegExp) {
  const addedSource = isRegExp(appended) ? appended.source : appended;
  return new RegExp(pattern.source + addedSource, pattern.flags);
}

/**
 * TODO
 */
export function prepend(pattern: RegExp, prepended: string | RegExp) {
  const prependedSource = isRegExp(prepended) ? prepended.source : prepended;
  return new RegExp(prependedSource + pattern.source, pattern.flags);
}

// TODO:
// replace 1392
// replace_with 66
// split 398
// to_string 3
