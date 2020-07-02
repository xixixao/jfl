/**
 * @flow
 *
 * This module provides functions for constructing `RegExp`s.
 *
 * Every `RegExp` consists of a string `source` and a string `flags`, which
 * determine its behavior.
 *
 * For using `RegExp`s for matching `string`s use the `Str` module. For basic
 * construction use JavaScript built-ins.
 *
 * @ex import {REx} from 'jfl'
 * @ex const pattern = /hello \w+/i
 * @ex const pattern = new RegExp("hello \\w+", "i")
 */

import type {$Array} from './types.flow';

import * as Ar from './array';
import * as Cl from './collection';
import * as St from './set';
import * as Str from './string';

/// Check

/**
 * Returns whether given value is a `RegExp`.
 *
 * @time O(1)
 * @space O(1)
 * @ex REx.isRegExp(/a/) // true
 * @see Str.isString
 */
export function isRegExp(value: mixed): %checks {
  return value instanceof RegExp;
}

/**
 * Returns whether given `RegExp`s are equal.
 *
 * For patterns to be equal their source and flags must be strictly equal.
 *
 * @time O(1)
 * @space O(1)
 * @ex REx.equals(/a/i, /a/i) // true
 * @see Str.equals
 */
export function equals(pattern: RegExp, ...patterns: $Array<RegExp>): boolean {
  for (const compared of patterns) {
    if (compared === pattern) {
      continue;
    }
    if (compared.source !== pattern.source) {
      return false;
    }
    if (compared.flags !== pattern.flags) {
      return false;
    }
  }
  return true;
}

/// Combine

/**
 * Create a new `RegExp` by combining the sources of given `patterns`.
 *
 * The new `RegExp` inherits the flags from the last given pattern.
 *
 * @time O(n)
 * @space O(n)
 * @ex REx.concat(/a/, /b/m) // /ab/m
 * @see REx.append, REx.prepend
 */
export function concat(...patterns: $Array<RegExp>): RegExp {
  const sources = Ar.map(patterns, pattern => pattern.source);
  return new RegExp(Str.join(sources, ''), Cl.lastX(patterns).flags);
}

/**
 * Create a new `RegExp` by adding `appended` to the end of the source of
 * the given `pattern`.
 *
 * @time O(n)
 * @space O(n)
 * @ex REx.append(/a/i, 'b') // /ab/i
 * @ex REx.append(/a/i, /b/m) // /ab/i
 * @see REx.prepend, REx.addFlags
 */
export function append(pattern: RegExp, appended: string | RegExp): RegExp {
  const addedSource = isRegExp(appended) ? appended.source : appended;
  return new RegExp(pattern.source + addedSource, pattern.flags);
}

/**
 * Create a new `RegExp` by adding `prepended` at the start of the source of
 * the given `pattern`.
 *
 * @time O(n)
 * @space O(n)
 * @ex REx.prepend(/a/i, 'b') // /ba/i
 * @ex REx.prepend(/a/i, /b/m) // /ba/i
 * @see REx.append, REx.addFlags
 */
export function prepend(pattern: RegExp, prepended: string | RegExp): RegExp {
  const prependedSource = isRegExp(prepended) ? prepended.source : prepended;
  return new RegExp(prependedSource + pattern.source, pattern.flags);
}

/**
 * Returns a `RegExp` which includes flags from `pattern` and given
 * `flags`.
 *
 * This function throws if the given `flags` include invalid characters.
 *
 * @time O(n)
 * @space O(n)
 * @ex REx.addFlags(/a/g, 'i') // /a/gi
 * @see REx.removeFlags
 */
export function addFlags(pattern: RegExp, flags: string): RegExp {
  if (flags.length === 1 && pattern.flags.includes(flags)) {
    return pattern;
  }
  const newFlags = St.from(Str.splitChars(pattern.flags + flags));
  if (newFlags.size === pattern.flags.length) {
    return pattern;
  }
  return new RegExp(pattern.source, Str.joinChars(newFlags));
}

/**
 * Returns a `RegExp` which includes flags from `pattern` not present in
 * given `flags`.
 *
 * @time O(n)
 * @space O(n)
 * @ex REx.removeFlags(/a/g, 'gi') // /a/
 * @see REx.addFlags
 */
export function removeFlags(pattern: RegExp, flags: string): RegExp {
  if (flags.length === 1 && !pattern.flags.includes(flags)) {
    return pattern;
  }
  const newFlags = St.diff(
    Str.splitChars(pattern.flags),
    Str.splitChars(flags),
  );
  if (newFlags.size === pattern.flags.length) {
    return pattern;
  }
  return new RegExp(pattern.source, Str.joinChars(newFlags));
}
