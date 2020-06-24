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
 * TODO
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

// TODO: invariant
export function invariant(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}
