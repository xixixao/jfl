// @flow

import type {$Array} from './types.flow';

import * as Str from './string';
import * as St from './set';
import {Ar, Cl} from '.';

/// Check

/**
 * TODO
 */
export function isRegExp(value: mixed): %checks {
  return value instanceof RegExp;
}

/// Combine

// TODO:
export function concat(...patterns: $Array<RegExp>): RegExp {
  const sources = Ar.map(patterns, pattern => pattern.source);
  return new RegExp(Str.join(sources, ''), Cl.lastX(patterns).flags);
}

/**
 * TODO
 */
export function append(pattern: RegExp, appended: string | RegExp): RegExp {
  const addedSource = isRegExp(appended) ? appended.source : appended;
  return new RegExp(pattern.source + addedSource, pattern.flags);
}

/**
 * TODO
 */
export function prepend(pattern: RegExp, prepended: string | RegExp): RegExp {
  const prependedSource = isRegExp(prepended) ? prepended.source : prepended;
  return new RegExp(prependedSource + pattern.source, pattern.flags);
}

/**
 * TODO
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
 * TODO
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
