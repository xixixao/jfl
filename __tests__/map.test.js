// @flow

const {Ar, Cl, St, $St, Mp, $Mp, Mth} = require('..');
const {setup} = require('../test/test-util.js');

const {test, tru, eq, eqq, eqqq, not, throws} = setup(
  Mp.equals,
  Cl.equalsNested,
);

test('equals', () => {
  tru(Mp.equals($Mp({a: 1, b: 2, c: 3}), $Mp({a: 1, b: 2, c: 3})));
  not.tru(Mp.equals($Mp({a: 1, b: 2, c: 3}), $Mp({b: 2, c: 3})));
  not.tru(Mp.equals($Mp({a: 1, b: 2}), $Mp({a: 1, b: 2, c: 3})));
});

test('equalsOrderIgnored', () => {
  tru(Mp.equalsOrderIgnored($Mp({a: 1, b: 2, c: 3}), $Mp({b: 2, c: 3, a: 1})));
  not.tru(Mp.equalsOrderIgnored($Mp({a: 1, b: 2, c: 3}), $Mp({b: 2, c: 3})));
  not.tru(Mp.equalsOrderIgnored($Mp({a: 1, b: 2}), $Mp({a: 1, b: 2, c: 3})));
});

test('equalsNested', () => {
  tru(Mp.equalsNested($Mp({a: [1, 2], b: 3}), $Mp({a: [1, 2], b: 3})));
  tru(
    Mp.equalsNested(
      Mp.of([
        [1, 2],
        [3, 4],
      ]),
      Mp.of([
        [1, 2],
        [3, 4],
      ]),
    ),
  );
  not.tru(Mp.equalsNested($Mp({a: 1, b: 2, c: 3}), $Mp({b: 2, c: 3})));
  not.tru(Mp.equalsNested($Mp({a: [1, 2]}), $Mp({a: [1, 2], b: 3})));
});

test('$Mp', async () => {
  eq(
    $Mp({a: 1, b: 2, c: 3}),
    new Map([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]),
  );
});

test('isMap', () => {
  tru(Mp.isMap($Mp()));
  tru(Mp.isMap(new Map([])));
  not.tru(Mp.isMap([]));
  not.tru(Mp.isMap($St()));
});

test('of', () => {
  eqq(
    Mp.of([
      [0, 1],
      [1, 1],
    ]),
    Mp.of([
      [0, 1],
      [1, 1],
    ]),
  );
});

test('from', () => {
  eq(Mp.from([1, 1]), Mp.of([0, 1], [1, 1]));
  eq(Mp.from($St(1, 2)), Mp.of([1, 1], [2, 2]));
});

test('fromAsync', async () => {
  eq(
    await Mp.fromAsync([(async () => 1)(), (async () => 2)()]),
    Mp.of([0, 1], [1, 2]),
  );
});

test('fromValues', () => {
  eq(
    Mp.fromValues([1, 2], value => `${value}`),
    $Mp({'1': 1, '2': 2}),
  );
});

test('fromKeys', () => {
  eq(
    Mp.fromKeys([1, 2], key => key * 2),
    Mp.of([1, 2], [2, 4]),
  );
});

test('fromEntries', () => {
  eq(
    Mp.fromEntries([
      [1, 2],
      [3, 4],
    ]),
    Mp.of([1, 2], [3, 4]),
  );
  eq(Mp.fromEntries($St([1, 2], [3, 4])), Mp.of([1, 2], [3, 4]));
});

test('unzip', () => {
  eq(Mp.unzip([1, 2], [3, 4]), Mp.of([1, 3], [2, 4]));
});

test('toObject', () => {
  eq($Mp(Mp.toObject($Mp({a: 1, b: 2}))), $Mp({a: 1, b: 2}));
});

test('merge', () => {
  eq(Mp.merge($Mp({a: 1, b: 2}), $Mp({a: 2, c: 3})), $Mp({a: 2, b: 2, c: 3}));
});

test('map', () => {
  eq(
    Mp.map($Mp({a: 1, b: 2}), x => x * 2),
    $Mp({a: 2, b: 4}),
  );
});

test('mapToEntries', () => {
  eq(
    Mp.mapToEntries(['a', 'b'], (x, i) => [x, i]),
    $Mp({a: 0, b: 1}),
  );
});

test('groupBy', () => {
  eqq(Mp.groupBy([1, 2, 3], Mth.isOdd), Mp.of([true, [1, 3]], [false, [2]]));
});
