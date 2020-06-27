// @flow

import {$Mp, $St, Cl, Mp, Mth, St} from '..';
import {test, tru, eq, is, not, nil, throws} from '../dev/test-setup.js';

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
  is(Cl.count([]), 0);
  is(Cl.count($St()), 0);
  is(Cl.count($Mp()), 0);
  is(Cl.count(['a', 'b']), 2);
  is(Cl.count($St('a', 'b')), 2);
  is(Cl.count($Mp({a: 'adam', b: 'boris'})), 2);
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
  not.tru(Cl.any([]));
  not.tru(Cl.any($St()));
  not.tru(Cl.any($Mp()));
  not.tru(Cl.any([false, false]));
  not.tru(Cl.any($St(false, false)));
  not.tru(Cl.any($Mp({k: false, m: false, n: false})));
  tru(Cl.any([false, true]));
  tru(Cl.any($St(false, true)));
  tru(Cl.any($Mp({k: false, m: true, n: false})));

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
  tru(Cl.every([]));
  tru(Cl.every($St()));
  tru(Cl.every($Mp()));
  not.tru(Cl.every([false, true]));
  not.tru(Cl.every($St(false, true)));
  not.tru(Cl.every($Mp({k: false, m: true, n: false})));
  tru(Cl.every([true, true]));
  tru(Cl.every($St(true, true)));
  tru(Cl.every($Mp({k: true, m: true, n: true})));

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

test('isSorted', () => {
  tru(Cl.isSorted([]));
  tru(Cl.isSorted($St()));
  tru(Cl.isSorted($Mp()));

  tru(Cl.isSorted([1, 2, 3]));
  tru(Cl.isSorted($St('a', 'b', 'c')));
  tru(Cl.isSorted($Mp({n: 'a', m: 'b', k: 'c'})));

  not.tru(Cl.isSorted([3, 1, 2]));
  not.tru(Cl.isSorted($St('c', 'b', 'a')));
  not.tru(Cl.isSorted($Mp({k: 'a', m: 'c', n: 'b'})));

  tru(Cl.isSorted($St('c', 'a', 'b'), (a, b) => a.length - b.length));
});

test('isSortedBy', () => {
  tru(Cl.isSortedBy([3, 1, 5, 2], n => n % 3));
});

test('find', () => {
  nil(Cl.find([], x => Mth.isOdd(x)));
  nil(Cl.find($St(), x => Mth.isOdd(x)));
  nil(Cl.find($Mp(), x => Mth.isOdd(x)));
  nil(Cl.find([2, 4, 8], x => Mth.isOdd(x)));
  nil(Cl.find($St(2, 4, 8), x => Mth.isOdd(x)));
  nil(Cl.find($Mp({k: 2, m: 4, n: 8}), x => Mth.isOdd(x)));
  is(
    Cl.find([2, 3, 8], x => Mth.isOdd(x)),
    3,
  );
  is(
    Cl.find($St(2, 3, 8), x => Mth.isOdd(x)),
    3,
  );
  is(
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
  is(
    Cl.findX([2, 3, 8], x => Mth.isOdd(x)),
    3,
  );
  is(
    Cl.findX($St(2, 3, 8), x => Mth.isOdd(x)),
    3,
  );
  is(
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
  is(
    Cl.findKey([2, 3, 8], x => Mth.isOdd(x)),
    1,
  );
  is(
    Cl.findKey($St(2, 3, 8), x => Mth.isOdd(x)),
    3,
  );
  is(
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
  is(
    Cl.findKeyX([2, 3, 8], x => Mth.isOdd(x)),
    1,
  );
  is(
    Cl.findKeyX($St(2, 3, 8), x => Mth.isOdd(x)),
    3,
  );
  is(
    Cl.findKeyX($Mp({k: 2, m: 3, n: 8}), x => Mth.isOdd(x)),
    'm',
  );
});

test('first', () => {
  nil(Cl.first([]));
  nil(Cl.first($St()));
  nil(Cl.first($Mp()));
  is(Cl.first(['a', 'b', 'c']), 'a');
  is(Cl.first($St('a', 'b', 'c')), 'a');
  is(Cl.first($Mp({k: 'adam', m: 'boris', n: 'cecil'})), 'adam');
});

test('firstX', () => {
  throws(() => Cl.firstX([]));
  throws(() => Cl.firstX($St()));
  throws(() => Cl.firstX($Mp()));
  is(Cl.firstX(['a', 'b', 'c']), 'a');
  is(Cl.firstX($St('a', 'b', 'c')), 'a');
  is(Cl.firstX($Mp({k: 'adam', m: 'boris', n: 'cecil'})), 'adam');
});

test('onlyX', () => {
  throws(() => Cl.onlyX([]));
  throws(() => Cl.onlyX($St()));
  throws(() => Cl.onlyX($Mp()));
  throws(() => Cl.onlyX(['a', 'b', 'c']));
  throws(() => Cl.onlyX($St('a', 'b', 'c')));
  throws(() => Cl.onlyX($Mp({k: 'adam', m: 'boris', n: 'cecil'})));
  is(Cl.onlyX(['b']), 'b');
  is(Cl.onlyX($St('b')), 'b');
  is(Cl.onlyX($Mp({k: 'boris'})), 'boris');
});

test('last', () => {
  nil(Cl.last([]));
  nil(Cl.last($St()));
  nil(Cl.last($Mp()));
  is(Cl.last(['a', 'b', 'c']), 'c');
  is(Cl.last($St('a', 'b', 'c')), 'c');
  is(Cl.last($Mp({k: 'adam', m: 'boris', n: 'cecil'})), 'cecil');
});

test('lastX', () => {
  throws(() => Cl.lastX([]));
  throws(() => Cl.lastX($St()));
  throws(() => Cl.lastX($Mp()));
  is(Cl.lastX(['a', 'b', 'c']), 'c');
  is(Cl.lastX($St('a', 'b', 'c')), 'c');
  is(Cl.lastX($Mp({k: 'adam', m: 'boris', n: 'cecil'})), 'cecil');
});

test('at', () => {
  nil(Cl.at([], 1));
  nil(Cl.at($St(), 1));
  nil(Cl.at($Mp(), 1));
  is(Cl.at(['a', 'b', 'c'], 1), 'b');
  is(Cl.at($St('a', 'b', 'c'), 1), 'b');
  is(Cl.at($Mp({k: 'adam', m: 'boris', n: 'cecil'}), 1), 'boris');
});

test('atX', () => {
  throws(() => Cl.atX([], 1));
  throws(() => Cl.atX($St(), 1));
  throws(() => Cl.atX($Mp(), 1));
  is(Cl.atX(['a', 'b', 'c'], 1), 'b');
  is(Cl.atX($St('a', 'b', 'c'), 1), 'b');
  is(Cl.atX($Mp({k: 'adam', m: 'boris', n: 'cecil'}), 1), 'boris');
});

test('atFromEnd', () => {
  nil(Cl.atFromEnd([], 1));
  nil(Cl.atFromEnd($St(), 1));
  nil(Cl.atFromEnd($Mp(), 1));
  is(Cl.atFromEnd(['a', 'b', 'c', 'd'], 0), 'd');
  is(Cl.atFromEnd(['a', 'b', 'c', 'd'], 1), 'c');
  is(Cl.atFromEnd($St('a', 'b', 'c', 'd'), 0), 'd');
  is(Cl.atFromEnd($St('a', 'b', 'c', 'd'), 1), 'c');
  is(Cl.atFromEnd($Mp({k: 'a', m: 'b', n: 'c', o: 'd'}), 0), 'd');
  is(Cl.atFromEnd($Mp({k: 'a', m: 'b', n: 'c', o: 'd'}), 1), 'c');
});

test('atFromEndX', () => {
  throws(() => Cl.atFromEndX([], 1));
  throws(() => Cl.atFromEndX($St(), 1));
  throws(() => Cl.atFromEndX($Mp(), 1));
  is(Cl.atFromEndX(['a', 'b', 'c', 'd'], 1), 'c');
  is(Cl.atFromEndX($St('a', 'b', 'c', 'd'), 1), 'c');
  is(Cl.atFromEndX($Mp({k: 'a', m: 'b', n: 'c', o: 'd'}), 1), 'c');
});

test('atDynamic', () => {
  nil(Cl.atDynamic([], 1));
  nil(Cl.atDynamic($St(), 1));
  nil(Cl.atDynamic($Mp(), 1));
  is(Cl.atDynamic(['a', 'b', 'c', 'd'], 0), 'a');
  is(Cl.atDynamic(['a', 'b', 'c', 'd'], 1), 'b');
  is(Cl.atDynamic(['a', 'b', 'c', 'd'], -1), 'd');
  is(Cl.atDynamic(['a', 'b', 'c', 'd'], -2), 'c');
  is(Cl.atDynamic($St('a', 'b', 'c', 'd'), 0), 'a');
  is(Cl.atDynamic($St('a', 'b', 'c', 'd'), 1), 'b');
  is(Cl.atDynamic($St('a', 'b', 'c', 'd'), -1), 'd');
  is(Cl.atDynamic($St('a', 'b', 'c', 'd'), -2), 'c');
  is(Cl.atDynamic($Mp({k: 'a', m: 'b', n: 'c', o: 'd'}), 0), 'a');
  is(Cl.atDynamic($Mp({k: 'a', m: 'b', n: 'c', o: 'd'}), 1), 'b');
  is(Cl.atDynamic($Mp({k: 'a', m: 'b', n: 'c', o: 'd'}), -1), 'd');
  is(Cl.atDynamic($Mp({k: 'a', m: 'b', n: 'c', o: 'd'}), -2), 'c');
});

test('firstKey', () => {
  nil(Cl.firstKey([]));
  nil(Cl.firstKey($St()));
  nil(Cl.firstKey($Mp()));
  is(Cl.firstKey(['a', 'b', 'c']), 0);
  is(Cl.firstKey($St('a', 'b', 'c')), 'a');
  is(Cl.firstKey($Mp({k: 'adam', m: 'boris', n: 'cecil'})), 'k');
});

test('firstKeyX', () => {
  throws(() => Cl.firstKeyX([]));
  throws(() => Cl.firstKeyX($St()));
  throws(() => Cl.firstKeyX($Mp()));
  is(Cl.firstKeyX(['a', 'b', 'c']), 0);
  is(Cl.firstKeyX($St('a', 'b', 'c')), 'a');
  is(Cl.firstKeyX($Mp({k: 'adam', m: 'boris', n: 'cecil'})), 'k');
});

test('lastKey', () => {
  nil(Cl.lastKey([]));
  nil(Cl.lastKey($St()));
  nil(Cl.lastKey($Mp()));
  is(Cl.lastKey(['a', 'b', 'c']), 2);
  is(Cl.lastKey($St('a', 'b', 'c')), 'c');
  is(Cl.lastKey($Mp({k: 'adam', m: 'boris', n: 'cecil'})), 'n');
});

test('lastKeyX', () => {
  throws(() => Cl.lastKeyX([]));
  throws(() => Cl.lastKeyX($St()));
  throws(() => Cl.lastKeyX($Mp()));
  is(Cl.lastKeyX(['a', 'b', 'c']), 2);
  is(Cl.lastKeyX($St('a', 'b', 'c')), 'c');
  is(Cl.lastKeyX($Mp({k: 'adam', m: 'boris', n: 'cecil'})), 'n');
});

test('forEach', () => {
  let word;
  word = '';
  Cl.forEach(['a', 'b', 'c'], letter => {
    word += letter;
  });
  is(word, 'abc');
  word = '';
  Cl.forEach($St('a', 'b', 'c'), letter => {
    word += letter;
  });
  is(word, 'abc');
  word = '';
  Cl.forEach($Mp({k: 'adam', m: 'boris', n: 'cecil'}), name => {
    word += name;
  });
  is(word, 'adamboriscecil');
});

test('reduce', () => {
  // Without initialValue
  is(
    Cl.reduce(['a', 'b', 'c'], (word, letter) => word + letter),
    'abc',
  );
  is(
    Cl.reduce($St('a', 'b', 'c'), (word, letter) => word + letter),
    'abc',
  );
  is(
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
