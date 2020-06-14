// @flow

const {Ar, Cl, St, $St, Mp, $Mp, Mth} = require('..');
const {setup} = require('../dev/test-util.js');

const {test, tru, eq, eqq, eqqq, not, nil, throws} = setup(
  Cl.equals,
  Cl.equalsNested,
);

test('equals', () => {
  tru(Cl.equals([1, 2, 3], [1, 2, 3]));
  not.tru(Cl.equals([1, 2, 3], [2, 3]));
  not.tru(Cl.equals([1, 2], [1, 2, 3]));
  tru(Cl.equals($St(1, 2, 3), $St(1, 2, 3)));
  not.tru(Cl.equals($St(1, 2, 3), $St(2, 3)));
  not.tru(Cl.equals($St(1, 2), $St(1, 2, 3)));
  tru(Cl.equals($Mp({a: 1, b: 2, c: 3}), $Mp({a: 1, b: 2, c: 3})));
  not.tru(Cl.equals($Mp({a: 1, b: 2, c: 3}), $Mp({b: 2, c: 3})));
  not.tru(Cl.equals($Mp({a: 1, b: 2}), $Mp({a: 1, b: 2, c: 3})));
});

test('equalsNested', () => {
  tru(Cl.equalsNested([[1, 2], 3], [[1, 2], 3]));
  not.tru(Cl.equalsNested([[1, 2, 3]], [[2, 3]]));
  not.tru(Cl.equalsNested([[1, 2]], [[1, 2], 3]));
  tru(Cl.equalsNested($St([1, 2], 3), $St([1, 2], 3)));
  not.tru(Cl.equalsNested($St([1, 2, 3]), $St([2, 3])));
  not.tru(Cl.equalsNested($St([1, 2]), $St([1, 2], 3)));
  tru(Cl.equalsNested($Mp({a: [1, 2], b: 3}), $Mp({a: [1, 2], b: 3})));
  tru(
    Cl.equalsNested(
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
  not.tru(Cl.equalsNested($Mp({a: 1, b: 2, c: 3}), $Mp({b: 2, c: 3})));
  not.tru(Cl.equalsNested($Mp({a: [1, 2]}), $Mp({a: [1, 2], b: 3})));
});

test('isEmpty', () => {
  tru(Cl.isEmpty([]));
  tru(Cl.isEmpty($St()));
  tru(Cl.isEmpty($Mp()));
});

test('count', () => {
  eqqq(Cl.count([]), 0);
  eqqq(Cl.count($St()), 0);
  eqqq(Cl.count($Mp()), 0);
  eqqq(Cl.count(['a', 'b']), 2);
  eqqq(Cl.count($St('a', 'b')), 2);
  eqqq(Cl.count($Mp({a: 'adam', b: 'boris'})), 2);
});

test('contains', () => {
  not.tru(Cl.contains([], 'a'));
  not.tru(Cl.contains($St(), 'a'));
  not.tru(Cl.contains($Mp(), 'adam'));
  tru(Cl.contains(['a'], 'a'));
  tru(Cl.contains($St('a'), 'a'));
  tru(Cl.contains($Mp({k: 'adam'}), 'adam'));
});

test('containsKey', () => {
  not.tru(Cl.containsKey([], 2));
  not.tru(Cl.containsKey($St(), 'a'));
  not.tru(Cl.containsKey($Mp(), 'a'));
  not.tru(Cl.containsKey(['a'], 2));
  not.tru(Cl.containsKey($St('b'), 'a'));
  not.tru(Cl.containsKey($Mp({m: 'adam'}), 'k'));
  tru(Cl.containsKey(['a', 'b', 'c'], 2));
  tru(Cl.containsKey($St('a'), 'a'));
  tru(Cl.containsKey($Mp({k: 'adam'}), 'k'));
});

test('any', () => {
  not.tru(Cl.any([], x => x === 'b'));
  not.tru(Cl.any($St(), x => x === 'b'));
  not.tru(Cl.any($Mp(), x => x === 'boris'));
  not.tru(Cl.any(['a', 'c'], x => x === 'b'));
  not.tru(Cl.any($St('a', 'c'), x => x === 'b'));
  not.tru(Cl.any($Mp({k: 'adam', n: 'cecil'}), x => x === 'boris'));
  tru(Cl.any(['a', 'b', 'c'], x => x === 'b'));
  tru(Cl.any($St('a', 'b', 'c'), x => x === 'b'));
  tru(Cl.any($Mp({k: 'adam', m: 'boris', n: 'cecil'}), x => x === 'boris'));
});

test('every', () => {
  tru(Cl.every([], x => x === 'b'));
  tru(Cl.every($St(), x => x === 'b'));
  tru(Cl.every($Mp(), x => x === 'boris'));
  not.tru(Cl.every(['a', 'b', 'c'], x => x === 'b'));
  not.tru(Cl.every($St('a', 'b', 'c'), x => x === 'b'));
  not.tru(
    Cl.every($Mp({k: 'adam', m: 'boris', n: 'cecil'}), x => x === 'boris'),
  );
  tru(Cl.every(['b', 'b', 'b'], x => x === 'b'));
  tru(Cl.every($St('b'), x => x === 'b'));
  tru(Cl.every($Mp({k: 'boris', m: 'boris', n: 'boris'}), x => x === 'boris'));
});

test('find', () => {
  nil(Cl.find([], x => Mth.isOdd(x)));
  nil(Cl.find($St(), x => Mth.isOdd(x)));
  nil(Cl.find($Mp(), x => Mth.isOdd(x)));
  nil(Cl.find([2, 4, 8], x => Mth.isOdd(x)));
  nil(Cl.find($St(2, 4, 8), x => Mth.isOdd(x)));
  nil(Cl.find($Mp({k: 2, m: 4, n: 8}), x => Mth.isOdd(x)));
  eqqq(
    Cl.find([2, 3, 8], x => Mth.isOdd(x)),
    3,
  );
  eqqq(
    Cl.find($St(2, 3, 8), x => Mth.isOdd(x)),
    3,
  );
  eqqq(
    Cl.find($Mp({k: 2, m: 3, n: 8}), x => Mth.isOdd(x)),
    3,
  );
});

test('findX', () => {
  throws(() => Cl.findX([], x => Mth.isOdd(x)));
  throws(() => Cl.findX($St(), x => Mth.isOdd(x)));
  throws(() => Cl.findX($Mp(), x => Mth.isOdd(x)));
  throws(() => Cl.findX([2, 4, 8], x => Mth.isOdd(x)));
  throws(() => Cl.findX($St(2, 4, 8), x => Mth.isOdd(x)));
  throws(() => Cl.findX($Mp({k: 2, m: 4, n: 8}), x => Mth.isOdd(x)));
  eqqq(
    Cl.findX([2, 3, 8], x => Mth.isOdd(x)),
    3,
  );
  eqqq(
    Cl.findX($St(2, 3, 8), x => Mth.isOdd(x)),
    3,
  );
  eqqq(
    Cl.findX($Mp({k: 2, m: 3, n: 8}), x => Mth.isOdd(x)),
    3,
  );
});

test('findKey', () => {
  nil(Cl.findKey([], x => Mth.isOdd(x)));
  nil(Cl.findKey($St(), x => Mth.isOdd(x)));
  nil(Cl.findKey($Mp(), x => Mth.isOdd(x)));
  nil(Cl.findKey([2, 4, 8], x => Mth.isOdd(x)));
  nil(Cl.findKey($St(2, 4, 8), x => Mth.isOdd(x)));
  nil(Cl.findKey($Mp({k: 2, m: 4, n: 8}), x => Mth.isOdd(x)));
  eqqq(
    Cl.findKey([2, 3, 8], x => Mth.isOdd(x)),
    1,
  );
  eqqq(
    Cl.findKey($St(2, 3, 8), x => Mth.isOdd(x)),
    3,
  );
  eqqq(
    Cl.findKey($Mp({k: 2, m: 3, n: 8}), x => Mth.isOdd(x)),
    'm',
  );
});

test('findKeyX', () => {
  throws(() => Cl.findKeyX([], x => Mth.isOdd(x)));
  throws(() => Cl.findKeyX($St(), x => Mth.isOdd(x)));
  throws(() => Cl.findKeyX($Mp(), x => Mth.isOdd(x)));
  throws(() => Cl.findKeyX([2, 4, 8], x => Mth.isOdd(x)));
  throws(() => Cl.findKeyX($St(2, 4, 8), x => Mth.isOdd(x)));
  throws(() => Cl.findKeyX($Mp({k: 2, m: 4, n: 8}), x => Mth.isOdd(x)));
  eqqq(
    Cl.findKeyX([2, 3, 8], x => Mth.isOdd(x)),
    1,
  );
  eqqq(
    Cl.findKeyX($St(2, 3, 8), x => Mth.isOdd(x)),
    3,
  );
  eqqq(
    Cl.findKeyX($Mp({k: 2, m: 3, n: 8}), x => Mth.isOdd(x)),
    'm',
  );
});

test('first', () => {
  nil(Cl.first([]));
  nil(Cl.first($St()));
  nil(Cl.first($Mp()));
  eqqq(Cl.first(['a', 'b', 'c']), 'a');
  eqqq(Cl.first($St('a', 'b', 'c')), 'a');
  eqqq(Cl.first($Mp({k: 'adam', m: 'boris', n: 'cecil'})), 'adam');
});

test('firstX', () => {
  throws(() => Cl.firstX([]));
  throws(() => Cl.firstX($St()));
  throws(() => Cl.firstX($Mp()));
  eqqq(Cl.firstX(['a', 'b', 'c']), 'a');
  eqqq(Cl.firstX($St('a', 'b', 'c')), 'a');
  eqqq(Cl.firstX($Mp({k: 'adam', m: 'boris', n: 'cecil'})), 'adam');
});

test('onlyX', () => {
  throws(() => Cl.onlyX([]));
  throws(() => Cl.onlyX($St()));
  throws(() => Cl.onlyX($Mp()));
  throws(() => Cl.onlyX(['a', 'b', 'c']));
  throws(() => Cl.onlyX($St('a', 'b', 'c')));
  throws(() => Cl.onlyX($Mp({k: 'adam', m: 'boris', n: 'cecil'})));
  eqqq(Cl.onlyX(['b']), 'b');
  eqqq(Cl.onlyX($St('b')), 'b');
  eqqq(Cl.onlyX($Mp({k: 'boris'})), 'boris');
});

test('last', () => {
  nil(Cl.last([]));
  nil(Cl.last($St()));
  nil(Cl.last($Mp()));
  eqqq(Cl.last(['a', 'b', 'c']), 'c');
  eqqq(Cl.last($St('a', 'b', 'c')), 'c');
  eqqq(Cl.last($Mp({k: 'adam', m: 'boris', n: 'cecil'})), 'cecil');
});

test('lastX', () => {
  throws(() => Cl.lastX([]));
  throws(() => Cl.lastX($St()));
  throws(() => Cl.lastX($Mp()));
  eqqq(Cl.lastX(['a', 'b', 'c']), 'c');
  eqqq(Cl.lastX($St('a', 'b', 'c')), 'c');
  eqqq(Cl.lastX($Mp({k: 'adam', m: 'boris', n: 'cecil'})), 'cecil');
});

test('at', () => {
  nil(Cl.at([], 1));
  nil(Cl.at($St(), 1));
  nil(Cl.at($Mp(), 1));
  eqqq(Cl.at(['a', 'b', 'c'], 1), 'b');
  eqqq(Cl.at($St('a', 'b', 'c'), 1), 'b');
  eqqq(Cl.at($Mp({k: 'adam', m: 'boris', n: 'cecil'}), 1), 'boris');
});

test('atX', () => {
  throws(() => Cl.atX([], 1));
  throws(() => Cl.atX($St(), 1));
  throws(() => Cl.atX($Mp(), 1));
  eqqq(Cl.atX(['a', 'b', 'c'], 1), 'b');
  eqqq(Cl.atX($St('a', 'b', 'c'), 1), 'b');
  eqqq(Cl.atX($Mp({k: 'adam', m: 'boris', n: 'cecil'}), 1), 'boris');
});

test('firstKey', () => {
  nil(Cl.firstKey([]));
  nil(Cl.firstKey($St()));
  nil(Cl.firstKey($Mp()));
  eqqq(Cl.firstKey(['a', 'b', 'c']), 0);
  eqqq(Cl.firstKey($St('a', 'b', 'c')), 'a');
  eqqq(Cl.firstKey($Mp({k: 'adam', m: 'boris', n: 'cecil'})), 'k');
});

test('firstKeyX', () => {
  throws(() => Cl.firstKeyX([]));
  throws(() => Cl.firstKeyX($St()));
  throws(() => Cl.firstKeyX($Mp()));
  eqqq(Cl.firstKeyX(['a', 'b', 'c']), 0);
  eqqq(Cl.firstKeyX($St('a', 'b', 'c')), 'a');
  eqqq(Cl.firstKeyX($Mp({k: 'adam', m: 'boris', n: 'cecil'})), 'k');
});

test('lastKey', () => {
  nil(Cl.lastKey([]));
  nil(Cl.lastKey($St()));
  nil(Cl.lastKey($Mp()));
  eqqq(Cl.lastKey(['a', 'b', 'c']), 2);
  eqqq(Cl.lastKey($St('a', 'b', 'c')), 'c');
  eqqq(Cl.lastKey($Mp({k: 'adam', m: 'boris', n: 'cecil'})), 'n');
});

test('lastKeyX', () => {
  throws(() => Cl.lastKeyX([]));
  throws(() => Cl.lastKeyX($St()));
  throws(() => Cl.lastKeyX($Mp()));
  eqqq(Cl.lastKeyX(['a', 'b', 'c']), 2);
  eqqq(Cl.lastKeyX($St('a', 'b', 'c')), 'c');
  eqqq(Cl.lastKeyX($Mp({k: 'adam', m: 'boris', n: 'cecil'})), 'n');
});

test('forEach', () => {
  let word;
  word = '';
  Cl.forEach(['a', 'b', 'c'], letter => {
    word += letter;
  });
  eqqq(word, 'abc');
  word = '';
  Cl.forEach($St('a', 'b', 'c'), letter => {
    word += letter;
  });
  eqqq(word, 'abc');
  word = '';
  Cl.forEach($Mp({k: 'adam', m: 'boris', n: 'cecil'}), name => {
    word += name;
  });
  eqqq(word, 'adamboriscecil');
});

test('reduce', () => {
  // Without initialValue
  eqqq(
    Cl.reduce(['a', 'b', 'c'], (word, letter) => word + letter),
    'abc',
  );
  eqqq(
    Cl.reduce($St('a', 'b', 'c'), (word, letter) => word + letter),
    'abc',
  );
  eqqq(
    Cl.reduce(
      $Mp({k: 'adam', m: 'boris', n: 'cecil'}),
      (phrase, word) => phrase + ' ' + word,
    ),
    'adam boris cecil',
  );
  // With initialValue
  eq(
    Cl.reduce(['a', 'b', 'b'], (set, letter) => St.add(set, letter), $St()),
    $St('a', 'b'),
  );
  eq(
    Cl.reduce(
      $St('a', 'b', 'c'),
      (map, letter) => Mp.set(map, letter, 0),
      $Mp(),
    ),
    $Mp({a: 0, b: 0, c: 0}),
  );
  eq(
    Cl.reduce(
      $Mp({k: 'adam', m: 'boris', n: 'cecil'}),
      (map, word) => Mp.set(map, word, 0),
      $Mp(),
    ),
    $Mp({adam: 0, boris: 0, cecil: 0}),
  );
  eq(
    Cl.reduce(
      ['a', 'b', 'c'],
      (map, letter, index) => Mp.set(map, letter, index),
      $Mp(),
    ),
    $Mp({a: 0, b: 1, c: 2}),
  );
  eq(
    Cl.reduce(
      $Mp({k: 'adam', m: 'boris', n: 'cecil'}),
      (map, letter, key) => Mp.set(map, letter, key),
      $Mp(),
    ),
    $Mp({adam: 'k', boris: 'm', cecil: 'n'}),
  );
});
