// @flow

import type {Collection, KeyedCollection, $Array} from './types.flow';

import {isRegExp} from './regexp';
import * as REx from './regexp';
import * as St from './set';
import * as Cl from './collection';
import {Str} from '.';

/// Checks

/**
 * Returns the index of the first occurence of `search` in `string` or null.
 *
 * If `fromIndex` is given then the occurence must be at or after it.
 *
 * @time O(n)
 * @space Worst case O(2^m) (O(n) when `search` is a regex and
 *        `fromIndex` is used)
 * @ex Str.indexOf("abcd", "c") // 2
 * @ex Str.indexOf("ab cd", "/\s/") // 2
 * @alias search, firstIndexOf, find
 * @see Str.includes, Str.firstMatch
 */
export function indexOf(
  string: string,
  search: string | RegExp,
  fromIndex?: number,
): ?number {
  if (fromIndex != null && fromIndex > string.length) {
    return null;
  }
  if (isRegExp(search)) {
    if (fromIndex != null) {
      return string.slice(fromIndex).match(search)?.index;
    } else {
      return string.match(search)?.index;
    }
  } else {
    const result = string.indexOf(search, fromIndex);
    return result === -1 ? null : result;
  }
}

/**
 * Returns whether `string` includes `search`.
 *
 * If `fromIndex` is given then the occurence must be at or after it.
 *
 * @time O(n)
 * @space Worst case O(2^m) (O(n) when `search` is a regex and
 *        `fromIndex` is used)
 * @ex Str.includes("abcd", "c") // true
 * @ex Str.includes("ab cd", /\s/) // true
 * @alias contains, search, find
 * @see Str.indexOf, Str.firstMatch
 */
export function includes(
  string: string,
  search: string | RegExp,
  fromIndex?: number,
): boolean {
  return indexOf(string, search, fromIndex) != null;
}

/**
 * Returns the number of times `search` occurs in `string`.
 *
 * @time O(n)
 * @space Worst case O(2^m)
 * @ex Str.countMatches("abcd", "c") // 1
 * @ex Str.countMatches("ab cd", /\s/) // 1
 * @see Str.includes, Str.everyMatch
 */
export function countMatches(string: string, search: string | RegExp): number {
  const result = string.matchAll(search);
  let count = 0;
  for (let value of result) {
    count++;
  }
  return count;
}

/// Select

/**
 * Returns every match corresponding to `search` that occurs in `string`.
 *
 * See `Str.firstMatch` for the description of the values in the returned array.
 *
 * @time O(n)
 * @space Worst case O(2^m)
 * @ex Str.everyMatch("a b1cd", /\w+/) // [['a'], ['b'], ['cd']]
 * @see Str.firstMatch
 */
export function everyMatch(
  string: string,
  search: string | RegExp,
): $Array<RegExp$matchResult> {
  if (isRegExp(search) && !includes(search.flags, 'g')) {
    search = REx.addFlags(search, 'g');
  }
  return Array.from(string.matchAll(search));
}

/**
 * Returns the first match corresponding to `search` that occurs in `string` or
 * null.
 *
 * If a matching substring is present the result will be an array where the
 * first element is the full matching substring followed by smaller substrings
 * corresponding to any matching regex groups.
 * The array will have the property `index` which is the index
 * at which the match occured in `string` and the property `groups` which
 * will contain an object mapping named regex groups to the matching
 * substrings, or undefined if there were no named groups in `search`.
 *
 * If `search` is a regex with the `g` flag the flag will be ignored.
 *
 * @time O(n)
 * @space Worst case O(2^m)
 * @ex Str.firstMatch("apple", /\w+(pp)?/) // ['app', 'pp'] {index: 0}
 * @see Str.everyMatch
 */
export function firstMatch(
  string: string,
  search: string | RegExp,
): ?RegExp$matchResult {
  if (isRegExp(search) && includes(search.flags, 'g')) {
    search = REx.removeFlags(search, 'g');
  }
  return string.match(search);
}

/// Combine

/**
 * TODO:
 */
export function join(collection: Collection<string>, glue: string): string {
  return Array.from(collection.values()).join(glue);
}

/// Divide

// TODO: 276
export function chunk() {}

/**
 * TODO:
 */
export function chars(string: string): $Array<string> {
  return string.split('');
}

/// Transform

/**
 * TODO
 */
export function replaceEvery(
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

/**
 * TODO:
 */
export function uniqueChars(text: string): string {
  return join(St.from(chars(text)), '');
}

/// Construct

// TODO: 99017 probably not needed, should favor interpolation
export function format() {}
// TODO: 2594
export function formatNumber() {}

// TODO: 1510
export function repeat() {}

// TODO: 2642 should this be in Mth or somewhere else?
export function toNumber() {}

/// Checks

// TODO: 38998
export function isEmpty() {}
// TODO: 17362
export function length() {}

// TODO: 334 this is indexOfCI
export function searchCi() {}
// TODO: 1551 not sure this is needed

// TODO: 570 this is lastIndexOf
export function searchLast() {}

export function compare() {}
// TODO: 1658 not sure this is needed
export function compareCi() {}
// TODO: 2588
export function containsCi() {}

// TODO: 9858
export function startsWith() {}
// TODO: 975
export function startsWithCi() {}

// TODO: 3545
export function endsWith() {}
// TODO: 324
export function endsWithCi() {}

/// Transform
// TODO: 229
export function replaceCi() {}
// TODO: 1337
export function replaceEveryCi() {}
// TODO:
export function camelize() {}
// TODO: 1351
export function capitalize() {}
// TODO: 968
export function capitalizeWords() {}
// TODO:
export function dasherize() {}
// TODO:
export function underscorize() {}
// TODO: 15578
export function lowercase() {}
// TODO: 6377
export function uppercase() {}
// TODO: 420
export function padLeft() {}
// TODO: 317
export function padRight() {}

/// Select

// TODO: 8925 figure out how it plays with take and drop - but should have
// done it already for Ar
export function slice() {}
// TODO: 3422 takes sting | Regexp
export function stripPrefix() {}
// TODO: 1991 takes sting | Regexp
export function stripSuffix() {}
// TODO: takes number
export function take() {}
// TODO: takes `fn`
export function takeWhile() {}
// TODO: this is just `slice` right?
export function drop() {}
// TODO:
export function dropWhile() {}

// TODO: 14672 doesn't take anything or general util from stripping both suffix
// and prefix?
export function trim() {}
// TODO: 630
export function trimLeft() {}
// TODO: 1189
export function trimRight() {}

/// Combine

// TODO:
export function unchars() {}
// TODO:
export function unlines() {}
// TODO:
export function unwords() {}

/// Divide

// TODO:
export function lines() {}
// TODO:
export function span() {}
// TODO: 210
export function splice() {}
// TODO: 28289
export function split() {}
// TODO:
export function splitAt() {}
// TODO:
export function words() {}
