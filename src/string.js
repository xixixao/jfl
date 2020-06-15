// @flow

import type {Collection, KeyedCollection, $Array} from './types.flow';

import {isRegExp} from './regexp';
import * as REx from './regexp';
import * as St from './set';
import * as Cl from './collection';
import {Ar, Mth} from '.';

/// Construct

/**
 * Returns the string representation of `number`, with given number of
 * `decimals`, which defaults to 0, and optionally using a different
 * `decimalPoint` and adding a `thousandsSeparator`.
 *
 * For a string represention that shows all present decimals
 * use `String(number)`.
 *
 * @ex Str.fromNumber(1234.56) // '1234'
 * @ex Str.fromNumber(1234.56, 1) // '1234.6'
 * @ex Str.fromNumber(1234.56, 4) // '1234.5600'
 * @ex Str.fromNumber(1234.56, 2, ',', '.') // '1.234,56'
 * @see Str.fromNumberInLocale
 */
export function fromNumber(
  number: number,
  decimals?: number = 0,
  decimalPoint?: string = '.',
  thousandsSeparator?: string = '',
): string {
  const fixedString = number.toFixed(decimals);
  const needsThousandsSeparator = thousandsSeparator !== '' || number >= 1000;
  if (decimalPoint === '.' && !needsThousandsSeparator) {
    return fixedString;
  }
  const [integer, decimal] = split(fixedString, '.');
  if (!needsThousandsSeparator) {
    if (decimal != null) {
      return integer + decimalPoint + decimal;
    }
    return integer;
  }
  const separatedInteger = join(chunkFromEnd(integer, 3), thousandsSeparator);
  if (decimal != null) {
    return separatedInteger + decimalPoint + decimal;
  }
  return separatedInteger;
}

/**
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
 */
export function fromNumberInLocale(
  number: number,
  locales?: string | Array<string>,
  options?: Intl$NumberFormatOptions,
) {
  return number.toLocaleString(locales, options);
}

// TODO: 1510
export function repeat() {}

// TODO: 2642 should this be in Mth or somewhere else?
export function toNumber() {}

/// Checks

// TODO: 38998
export function isEmpty() {}

// TODO: 17362
export function length(string: string) {
  return string.length;
}

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
export function endsWith(string: string, suffix: string | RegExp) {
  if (isRegExp(suffix)) {
    return REx.append(suffix, '$').test(string);
  }
  return string.endsWith(string);
}

// TODO: 324
export function endsWithCi() {}

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

// TODO: 8925 figure out how it plays with take and drop - but should have
// done it already for Ar
export function slice(
  string: string,
  startIndex: number,
  endIndex?: number,
): string {
  return string.slice(startIndex, endIndex);
}

// TODO: takes number
export function take() {}
// TODO: takes `fn`
export function takeWhile() {}
// TODO: this is just `slice` right?
export function drop() {}
// TODO:
export function dropWhile() {}

/**
 * Returns `string` with whitespace stripped from the beginning and end.
 *
 * If `search` is given it will stripped instead from both ends.
 */
export function trim(string: string, search?: string | RegExp): string {
  if (search == null) {
    return string.trim();
  }
  // TODO
}

// TODO: 630, don't take mask
export function trimStart() {}
// TODO: 1189, don't take mask
export function trimEnd() {}

// TODO: 3422 takes string | Regexp
export function stripPrefix() {}
// TODO: 1991 takes string | Regexp
export function stripSuffix() {}

/// Combine

/**
 * TODO:
 */
export function join(collection: Collection<string>, glue: string): string {
  return Ar.from(collection).join(glue);
}

// TODO:
export function joinChars(chars: Collection<string>) {
  return join(chars, '');
}

// TODO:
export function joinWords(words: Collection<string>) {
  return join(words, ' ');
}

// TODO:
export function joinLines(lines: Collection<string>) {
  return join(lines, '\n');
}

/// Divide

// TODO: 28289
export function split(
  string: string,
  delimiter: string | RegExp,
  limit?: number,
): $Array<string> {
  const result = string.split(delimiter, limit);
  if (limit != null) {
    const resultLength = Mth.sum(
      Ar.map(result, substring => length(substring)),
    );
    if (resultLength < length(string)) {
      result.push(slice(string, resultLength));
    }
  }
  return result;
}

/**
 * Create a tuple of strings containing the first `n` characters
 * and all but the first `n` characters of given `string`.
 *
 * @time O(n)
 * @space O(n)
 * @ex Str.split("hello", 2) // ["he", "llo"]
 * @see Ar.drop, Ar.take, Ar.span
 */
export function splitAt(string: string, n: number): [string, string] {
  return [string.slice(0, n), string.slice(n)];
}

// TODO: 276
export function chunk() {}

// TODO: 276
export function chunkFromEnd(string: string, size: number) {
  if (size < 1) {
    throw new Error(`Expected \`size\` to be greater than 0, got \`${size}\``);
  }
  size = Math.floor(size);
  const stringLength = length(string);
  const chunks = [];
  let chunksLength = 0;
  const firstChunkLength = stringLength % size;
  if (firstChunkLength > 0) {
    chunks.push(string.slice(0, firstChunkLength));
    chunksLength += firstChunkLength;
  }
  while (chunksLength < stringLength) {
    const chunkEnd = chunksLength + size;
    chunks.push(slice(string, chunksLength, chunkEnd));
    chunksLength = chunkEnd;
  }
  return chunks;
}

/**
 * TODO:
 */
export function chars(string: string): $Array<string> {
  return split(string, '');
}

// TODO:
export function words(string: string): $Array<string> {
  return split(trim(string), /\s+/);
}

const LINE_DELIMITER_PATTERN = /\r?\n/;

// TODO:
export function lines(
  string: string,
  ignoreTrailingNewLine?: boolean = false,
): $Array<string> {
  const lines = split(string, LINE_DELIMITER_PATTERN);
  if (ignoreTrailingNewLine && endsWith(string, LINE_DELIMITER_PATTERN)) {
    return Ar.slice(lines, 0, -1);
  }
  return lines;
}

// TODO:
export function span() {}
// TODO: 210
export function splice() {}

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
export function padStart() {}
// TODO: 317
export function padEnd() {}
