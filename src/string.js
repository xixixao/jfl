// @flow

import * as Ar from './array';
import * as REx from './regexp';
import {isRegExp} from './regexp';
import type {$Array, Collection} from './types.flow';

/// Construct

/**
 * Create the string representation of `number`, with given number of
 * `decimals`, which defaults to 0, and optionally using a different
 * `decimalPoint` and adding a `thousandsSeparator`.
 *
 * For a string represention that shows all present decimals
 * use `String(number)`.
 *
 * @time O(n)
 * @space O(n)
 * @ex Str.fromNumber(1234.56) // '1234'
 * @ex Str.fromNumber(1234.56, 1) // '1234.6'
 * @ex Str.fromNumber(1234.56, 4) // '1234.5600'
 * @ex Str.fromNumber(1234.56, 2, ',', '.') // '1.234,56'
 * @alias toString
 * @see Str.fromNumberInLocale, Str.toNumber, Mth.toBase, Mth.baseConvert
 */
export function fromNumber(
  number: number,
  decimals?: number = 0,
  decimalPoint?: string = '.',
  thousandsSeparator?: string = '',
): string {
  const fixedString = number.toFixed(decimals);
  const needsThousandsSeparator = thousandsSeparator !== '' && number >= 1000;
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
  if (decimalPoint === thousandsSeparator) {
    throw new Error(
      `Expected different parameters \`decimalPoint\` and ` +
        `\`thousandsSeparator\`, but got \`${decimalPoint}\` for both.`,
    );
  }
  const separatedInteger = join(chunkFromEnd(integer, 3), thousandsSeparator);
  if (decimal == null) {
    return separatedInteger;
  }
  return separatedInteger + decimalPoint + decimal;
}

/**
 * Create the string representation of `number` based on the execution
 * environment.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
 * for full details.
 *
 * There is currently no counter part, ie no `Str.toNumberFromLocale`, because
 * there is no such API in JavaScript.
 *
 * @alias toLocaleString
 * @see Str.fromNumber, Str.toNumber
 */
export function fromNumberInLocale(
  number: number,
  locales?: string | Array<string>,
  options?: Intl$NumberFormatOptions,
) {
  return number.toLocaleString(locales, options);
}

/**
 * Create a new string by repeating `string` `count` times.
 *
 * @time O(n*m)
 * @space O(n*m)
 * @ex Str.repeat('abr', 3) // 'abrabrabr'
 * @see Str.fill, Ar.repeat
 */
export function repeat(string: string, count: number): string {
  if (this == null) throw new TypeError("can't convert " + this + ' to object');

  if (count < 0) {
    throw new RangeError(
      `Expected non-negative parameter \`count\`, but got a \`${count}\` instead.`,
    );
  }

  if (count == Infinity) {
    throw new RangeError(
      `Expected finite parameter \`count\`, but got a \`${count}\` instead.`,
    );
  }

  let countInt = Math.floor(count);
  if (string.length == 0 || count == 0 || count != count) {
    return '';
  }

  if (string.length * countInt >= 1 << 28) {
    throw new RangeError(
      `Expected parametrs \`string\` and \`count\` such that the result ` +
        `will be reasonably long, but got string length \`${string.length}\` ` +
        `count \`${count}\`.`,
    );
  }

  let result = string;
  const totalLength = string.length * countInt;
  // Speed string construction via string doubling trick
  countInt = Math.floor(Math.log(countInt) / Math.log(2));
  while (countInt) {
    result += result;
    countInt--;
  }
  result += result.substring(0, totalLength - result.length);
  return result;
}

/**
 * Create a new string by concatenating `count` results of calling `fn`.
 *
 * `fn` take as the first argument the position in the final string where the
 * current invocation's result will be placed.
 *
 * @time O(m)
 * @space O(m)
 * @ex Str.fill(4, i => `${i}`) // '1234'
 * @see Str.repeat, Ar.fill
 */
export function fill(times: number, fn: number => string): string {
  let result = '';
  for (let i = 0; i < times; i++) {
    result += fn(i);
  }
  return result;
}

/**
 * Return the number represented by given `string`.
 *
 * @time O(n)
 * @space O(1) (O(n) if thousandsSeparator is used)
 * @ex Str.toNumber('1234.56') // 1234.56
 * @ex Str.fromNumber('1.234,56', ',', '.') // 1234.56
 * @alias Number
 * @see Str.fromNumber, Mth.fromBase
 */
export function toNumber(
  string: string,
  decimalPoint?: string = '.',
  thousandsSeparator?: string = '',
) {
  if (decimalPoint === '.' && thousandsSeparator === '') {
    return Number(string);
  }
  if (thousandsSeparator === '') {
    return Number(string.replace(decimalPoint, '.'));
  }
  if (decimalPoint === thousandsSeparator) {
    throw new Error(
      `Expected different parameters \`decimalPoint\` and ` +
        `\`thousandsSeparator\`, but got \`${decimalPoint}\` for both.`,
    );
  }
  const [integer, decimal] = split(string, decimalPoint);
  const nonSeparatedInteger = integer.replace(thousandsSeparator, '');
  if (decimal == null) {
    return Number(nonSeparatedInteger);
  }
  return Number(nonSeparatedInteger + '.' + decimal);
}

/// Checks

/**
 * Returns true when `string` has zero length.
 *
 * @time O(1)
 * @space O(1)
 * @ex Str.isEmpty('') // true
 * @ex Str.isEmpty('a') // false
 * @see Str.length, Cl.isEmpty
 */
export function isEmpty(string: string): boolean {
  return string.length === 0;
}

/**
 * Returns the length of the `string`.
 *
 * @time O(1)
 * @space O(1)
 * @ex Str.length('') // 0
 * @ex Str.length('aa') // 2
 * @see Str.isEmpty, Cl.count
 */
export function length(string: string) {
  return string.length;
}

// TODO: 9858
export function startsWith(string: string, prefix: string | RegExp) {
  if (isRegExp(prefix)) {
    return REx.prepend(prefix, '^').test(string);
  }
  return string.startsWith(prefix);
}

// TODO: 3545
export function endsWith(string: string, suffix: string | RegExp) {
  if (isRegExp(suffix)) {
    return REx.append(suffix, '$').test(string);
  }
  return string.endsWith(suffix);
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
 * @see Str.indexOf, Str.matchFirst
 */
export function includes(
  string: string,
  search: string | RegExp,
  fromIndex?: number,
): boolean {
  return indexOf(string, search, fromIndex) != null;
}

/**
 * Returns whether `string` equals given `search`.
 *
 * @time O(n)
 * @space Worst case O(2^m)
 * @ex Str.equals("abcd", "abcd") // true
 * @ex Str.equals("abcd", /abcd/) // true
 * @ex Str.includes("abcde", /abcd/) // false
 * @alias test, equals
 * @see Str.includes, Str.matchFirst
 */
export function equals(string: string, search: string | RegExp): boolean {
  if (isRegExp(search)) {
    return REx.append(REx.prepend(search, '^'), '$').test(string);
  } else {
    return string === search;
  }
}

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
 * @see Str.includes, Str.matchFirst
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

// TODO: 570 this is lastIndexOf
export function lastIndexOf() {}

/**
 * Returns whether given `predicateFn` returns true for `string` and `search`
 * when letter casing is ignored.
 *
 * @time O(1)
 * @space Worst case O(2^m)
 * @ex Str.ignoreCase("abcd", "AbCD", Str.equals) // true
 * @ex Str.ignoreCase("abcd", "AbCD", Str.equals) // true
 * @see Str.equals, Str.includes
 */
export function ignoreCase(
  string: string,
  search: string | RegExp,
  predicateFn: (string: string, search: string | RegExp) => boolean,
) {
  if (isRegExp(search)) {
    return predicateFn(string.toLowerCase(), REx.addFlags(search, 'i'));
  } else {
    return predicateFn(string.toLowerCase(), search.toLowerCase());
  }
}

/**
 * Returns the number of times `search` occurs in `string`.
 *
 * @time O(n)
 * @space Worst case O(2^m)
 * @ex Str.countMatches("abcd", "c") // 1
 * @ex Str.countMatches("ab cd", /\s/) // 1
 * @see Str.includes, Str.matchEvery
 */
export function countMatches(string: string, search: string | RegExp): number {
  const result = string.matchAll(search);
  let count = 0;
  for (let _ of result) {
    count++;
  }
  return count;
}

export function compare() {}

/// Select

/**
 * Returns every match corresponding to `search` that occurs in `string`.
 *
 * See `Str.matchFirst` for the description of the values in the returned array.
 *
 * @time O(n)
 * @space Worst case O(2^m)
 * @ex Str.matchEvery("a b1cd", /\w+/) // [['a'], ['b'], ['cd']]
 * @see Str.matchFirst
 */
export function matchEvery(
  string: string,
  search: string | RegExp,
): $Array<RegExp$matchResult> {
  if (isRegExp(search)) {
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
 * @ex Str.matchFirst("apple", /\w+(pp)?/) // ['app', 'pp'] {index: 0}
 * @see Str.matchEvery
 */
export function matchFirst(
  string: string,
  search: string | RegExp,
): ?RegExp$matchResult {
  if (isRegExp(search)) {
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
export function take(string: string, n: number): string {
  return string.slice(0, n);
}

// TODO: more readable slice alias
export function drop(string: string, n: number): string {
  return string.slice(n);
}

// TODO:
export function takeWhile(
  string: string,
  predicateFn: string => boolean,
): string {
  let result = '';
  forEachCodePoint(string, codePoint => {
    if (predicateFn(codePoint)) {
      result += codePoint;
    }
    return true;
  });
  return result;
}

// TODO:
export function dropWhile(
  string: string,
  predicateFn: string => boolean,
): string {
  let result = '';
  forEachCodePoint(string, (codePoint, index) => {
    if (predicateFn(codePoint)) {
      result = string.slice(index + codePoint.length);
      return false;
    }
    return true;
  });
  return result;
}

/**
 * Returns `string` with whitespace stripped from the beginning and end.
 *
 * If `search` is given it will stripped instead from both ends. The beginning
 * will be trimmed first.
 *
 * @time O(n)
 * @space Worst case O(2^m)
 */
export function trim(string: string, search?: string | RegExp): string {
  if (search == null) {
    return string.trim();
  }
  return trimEnd(trimStart(string, search), search);
}

/**
 * Returns `string` with whitespace stripped from its beginning.
 *
 * If `prefix` is given it will stripped instead.
 *
 * @time O(n)
 * @space Worst case O(2^m)
 */
export function trimStart(string: string, prefix?: string | RegExp): string {
  if (prefix == null) {
    return string.trimStart();
  }
  if (isRegExp(prefix)) {
    return string.replace(REx.prepend(prefix, '^'), '');
  }
  return string.startsWith(prefix) ? string.slice(prefix.length) : string;
}

/**
 * Returns `string` with whitespace stripped from its end.
 *
 * If `suffix` is given it will stripped instead.
 *
 * @time O(n)
 * @space Worst case O(2^m)
 */
export function trimEnd(string: string, suffix?: string | RegExp): string {
  if (suffix == null) {
    return string.trimEnd();
  }
  if (isRegExp(suffix)) {
    return string.replace(REx.append(suffix, '$'), '');
  }
  return string.endsWith(suffix) ? string.slice(0, -suffix.length) : string;
}

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
// doesn't return the remainder
export function split(
  string: string,
  delimiter: string | RegExp,
  limit?: number,
): $Array<string> {
  return string.split(delimiter, limit);
}

// TODO: might want to do splitUpTo that returns the remainder, which is tricky
// with a regex

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
export function splitChars(string: string): $Array<string> {
  return split(string, '');
}

// TODO:
export function splitWords(string: string): $Array<string> {
  return split(trim(string), /\s+/);
}

const LINE_DELIMITER_PATTERN = /\r?\n/;

// TODO:
export function splitLines(
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

// TODO:
export function forEachCodePoint(
  string: string,
  fn: (string, number) => boolean,
): void {
  if ((string: any)[Symbol.iterator] != null) {
    let index = 0;
    for (const codePoint of string) {
      if (!fn(codePoint, index)) {
        break;
      }
      index += codePoint.length;
    }
  } else {
    let index = 0;
    let codePoint;
    while (index < string.length) {
      codePoint = fixedCharAt(string, index);
      if (!fn(codePoint, index)) {
        break;
      }
      index += codePoint.length;
    }
  }
}

// Takes full Unicode code points into account
function fixedCharAt(string: string, position: number) {
  const size = string.length;
  let first;
  let second = 0;
  if (position < 0 || position >= size) return '';
  first = string.charCodeAt(position);
  return first < 0xd800 ||
    first > 0xdbff ||
    position + 1 === size ||
    (second = string.charCodeAt(position + 1)) < 0xdc00 ||
    second > 0xdfff
    ? string.charAt(position)
    : string.slice(position, position + 2);
}

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
    return string.replace(REx.addFlags(search, 'g'), replacement);
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
  if (isRegExp(search)) {
    return string.replace(REx.removeFlags(search, 'g'), replacement);
  }
  return string.replace(search, replacement);
}

// TODO: 229
export function replaceFirstCaseIgnored() {}
// TODO: 1337
export function replaceEveryCaseIgnored() {}
// TODO:
export function camelize() {}

// TODO: 1351
export function capitalize(string: string): string {
  return fixedCharAt(string, 0).toUpperCase() + string.slice(1);
}

// TODO: 968
export function capitalizeWords() {}
// TODO:
export function dasherize() {}
// TODO:
export function underscorize() {}
// TODO: 15578
export function lowercase(string: string): string {
  return string.toLowerCase();
}

// TODO: 6377
export function uppercase() {}
// TODO: 420
export function padStart() {}
// TODO: 317
export function padEnd() {}
