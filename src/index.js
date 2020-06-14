// @flow

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
