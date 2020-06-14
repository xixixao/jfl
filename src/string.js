// @flow

import type {Collection, KeyedCollection, $Array} from './types.flow';

import {isRegExp} from './regexp';
import * as REx from './regexp';
import * as St from './set';

/**
 * TODO: Should this be combined with `index of firstMatch` somehow?
 */
export function indexOf(
  string: string,
  search: string,
  fromIndex?: number,
): ?number {
  if (fromIndex != null && fromIndex > string.length) {
    return null;
  }
  const result = string.indexOf(search, fromIndex);
  return result === -1 ? null : result;
}

/**
 * TODO: Should this be combined with `existence of firstMatch` somehow?
 * if yes, fromIndex might be valid only for string inputs, or it will need
 * custom implementation
 */
export function includes(
  string: string,
  search: string,
  fromIndex?: number,
): boolean {
  const result = string.indexOf(search, fromIndex);
  return result !== -1;
}

/**
 * TODO:
 */
export function join(collection: Collection<string>, glue: string): string {
  return Array.from(collection.values()).join(glue);
}

/**
 * TODO:
 */
export function chars(string: string): $Array<string> {
  return string.split('');
}

/**
 * TODO:
 */
export function uniqueChars(text: string): string {
  return join(St.from(chars(text)), '');
}

/**
 * TODO
 */
export function replace(
  string: string,
  search: string | RegExp,
  replacement:
    | string
    | ((match: string, ...groupsAndOffset: Array<any>) => string),
) {
  if (isRegExp(search)) {
    if (!includes(search.flags, 'g')) {
      return string.replace(REx.addFlags(search, 'g'), replacement);
    } else {
      return string.replace(search, replacement);
    }
  }

  const searchLength = search.length;
  const advanceBy = Math.max(1, searchLength);
  const matchPositions = [];

  let searchPosition = indexOf(string, search, 0);
  while (searchPosition != null) {
    matchPositions.push(searchPosition);
    searchPosition = indexOf(string, search, searchPosition + advanceBy);
  }

  let endOfLastMatch = 0;
  let result = '';
  for (let matchPosition of matchPositions) {
    let replaceValue =
      typeof replacement === 'function'
        ? replacement(search, matchPosition, string)
        : replacement;
    const stringSlice = string.slice(endOfLastMatch, matchPosition);
    result += stringSlice + replaceValue;
    endOfLastMatch = matchPosition + searchLength;
  }

  if (endOfLastMatch < string.length) {
    result += string.slice(endOfLastMatch);
  }

  return result;
}

/**
 * TODO
 */
export function replaceFirst(
  string: string,
  search: string | RegExp,
  replacement:
    | string
    | ((match: string, ...groupsAndOffset: Array<any>) => string),
) {
  if (isRegExp(search) && includes(search.flags, 'g')) {
    return string.replace(REx.removeFlags(search, 'g'), replacement);
  }
  return string.replace(search, replacement);
}

// TODO:
// Str.split
// Str.join
// Str.lines
// Str.words
// Str.unlines
// Str.unwords
// Str.chars
// Str.unchars
// Str.repeat
// Str.capitalize
// Str.camelize
// Str.dasherize
// Str.isEmpty
// Str.reverse
// Str.slice
// Str.splice
// Str.take
// Str.drop
// Str.splitAt
// Str.takeWhile
// Str.dropWhile
// Str.span
// Str.break
