// @flow

import {Cl, Str} from '../src';
import {setup} from '../dev/test-util.js';

const {test, tru, eq, eqqq, throws} = setup(Cl.equals, Cl.equalsNested);

test('ignoreCase', () => {
  tru(Str.ignoreCase('abc', 'AbC', Str.equals));
  tru(Str.ignoreCase('abc', /AbC/, Str.equals));
});

test('repeat', () => {
  eqqq(Str.repeat('a', NaN), '');
  eqqq(Str.repeat('a', 7), 'aaaaaaa');
});

test('toNumber', () => {
  eqqq(Str.toNumber('123'), 123);
  eqqq(Str.toNumber('123.5'), 123.5);
  eqqq(Str.toNumber('123,5'), NaN);
  eqqq(Str.toNumber('123,5', ','), 123.5);
  eqqq(Str.toNumber('4,123'), NaN);
  throws(() => Str.toNumber('4.123', '.', '.'));
  eqqq(Str.toNumber('4,123', '.', ','), 4123);
  eqqq(Str.toNumber('4.123,5', ',', '.'), 4123.5);
});

test('trim', () => {
  eqqq(Str.trim('adam '), 'adam');
  eqqq(Str.trim('  adam'), 'adam');
  eqqq(Str.trim('  adam '), 'adam');
  eqqq(Str.trim('\r\n  adam\n\t '), 'adam');

  eqqq(Str.trim('bad adam eve', 'bad'), ' adam eve');
  eqqq(Str.trim('adam eve bad', 'bad'), 'adam eve ');
  eqqq(Str.trim('bad adam eve bad', 'bad'), ' adam eve ');

  eqqq(Str.trim('$$adam eve$', /\$/), '$adam eve');
  eqqq(Str.trim('$$adam eve$', /\$*/), 'adam eve');

  eqqq(Str.trim('abaca', /a\wa/), 'ca');
});

test('trimStart', () => {
  eqqq(Str.trimStart('adam '), 'adam ');
  eqqq(Str.trimStart('  adam'), 'adam');
  eqqq(Str.trimStart('  adam '), 'adam ');
  eqqq(Str.trimStart('\r\n  adam\n\t '), 'adam\n\t ');

  eqqq(Str.trimStart('bad adam eve', 'bad'), ' adam eve');
  eqqq(Str.trimStart('adam eve bad', 'bad'), 'adam eve bad');
  eqqq(Str.trimStart('bad adam eve bad', 'bad'), ' adam eve bad');

  eqqq(Str.trimStart('$$adam eve$', /\$/), '$adam eve$');
  eqqq(Str.trimStart('$$adam eve$', /\$*/), 'adam eve$');
});

test('trimEnd', () => {
  eqqq(Str.trimEnd('adam '), 'adam');
  eqqq(Str.trimEnd('  adam'), '  adam');
  eqqq(Str.trimEnd('  adam '), '  adam');
  eqqq(Str.trimEnd('\r\n  adam\n\t '), '\r\n  adam');

  eqqq(Str.trimEnd('bad adam eve', 'bad'), 'bad adam eve');
  eqqq(Str.trimEnd('adam eve bad', 'bad'), 'adam eve ');
  eqqq(Str.trimEnd('bad adam eve bad', 'bad'), 'bad adam eve ');

  eqqq(Str.trimEnd('$$adam eve$$', /\$/), '$$adam eve$');
  eqqq(Str.trimEnd('$$adam eve$$', /\$*/), '$$adam eve');
});

test('replaceEvery', () => {
  eqqq(Str.replaceEvery('', '', 'apple'), 'apple');
  eqqq(Str.replaceEvery('', 'a', 'apple'), '');
  eqqq(Str.replaceEvery('a', 'a', 'apple'), 'apple');
  eqqq(Str.replaceEvery('aa', 'a', 'apple'), 'appleapple');
  eqqq(Str.replaceEvery('a-a', 'a', 'apple'), 'apple-apple');

  eqqq(Str.replaceEvery('a-a', /a/, 'apple'), 'apple-apple');
  eqqq(
    Str.replaceEvery('aa-a', /a+/, substring => '' + substring.length),
    '2-1',
  );
});

test('splitWords', () => {
  eq(Str.splitWords('adam eve'), ['adam', 'eve']);
  eq(Str.splitWords(' adam eve'), ['adam', 'eve']);
  eq(Str.splitWords(' adam eve '), ['adam', 'eve']);
  eq(Str.splitWords(' adam\neve '), ['adam', 'eve']);
  eq(Str.splitWords(' adam\n\teve '), ['adam', 'eve']);
});

test('splitLines', () => {
  eq(Str.splitLines('adam\neve'), ['adam', 'eve']);
  eq(Str.splitLines('adam\r\neve'), ['adam', 'eve']);
  eq(Str.splitLines('adam\n\neve'), ['adam', '', 'eve']);
  eq(Str.splitLines('adam\n\neve\n'), ['adam', '', 'eve', '']);
  eq(Str.splitLines('adam\n\neve\n', true), ['adam', '', 'eve']);
});
