// @flow

export interface Collection<+V> {
  values(): Iterator<V>;
}

export interface KeyedCollection<+K, +V> extends Collection<V> {
  keys(): Iterator<K>;
  entries(): Iterator<[K, V]>;
  forEach(fn: (V, K, KeyedCollection<K, V>) => void, thisArg?: any): void;
}

export type $Array<V> = $ReadOnlyArray<V>;
export type $Set<V> = $ReadOnlySet<V>;
