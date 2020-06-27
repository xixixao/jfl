/**
 * @flow
 *
 * This is the main module from which you can easily import all the others,
 * plus a few utilities for working in Flow/TypeScript in general.
 *
 * @ex import {Ar, $Ar, Cl, Mp, $Mp, Mth, REx, St, $St, Str} from 'jfl'
 * @ex import {nullthrows, invariant} from 'jfl'
 */

export * as Ar from './array';
export {$Ar} from './array';
export * as Cl from './collection';
export * as Mp from './map';
export {$Mp} from './map';
export * as Mth from './math';
export * as REx from './regexp';
export * as St from './set';
export {$St} from './set';
export * as Str from './string';

/// Type

/**
 * Returns `value` if it's not null or undefined, throws otherwise.
 *
 * Useful for coercing the nullable type of `value` to non-nullable when using
 * Flow.
 *
 * @ex nullthrows(null) // throws
 * @ex nullthrows('a') // 'a'
 */
export function nullthrows<T>(
  value: ?T,
  message?: string = 'Got unexpected null or undefined',
): T {
  if (value != null) {
    return value;
  }
  const error: Error & {framesToPop?: number, ...} = new Error(message);
  error.framesToPop = 1; // Skip nullthrows own stack frame.
  throw error;
}

/**
 * Throws an error with `message` if `condition` is false.
 *
 * Both Flow and TypeScript will consider the `condition` to be an assertion
 * and will infer types correspondingly.
 *
 * @ex invariant(typeof 3 === 'string', 'expecting a string') // throws
 * @ex invariant(typeof 'a' === 'string', 'expecting a string') // no-op
 */
export function invariant(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}
