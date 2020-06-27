// @flow

export function defaultCompareFn(a: any, b: any): number {
  return a > b ? 1 : a < b ? -1 : 0;
}
