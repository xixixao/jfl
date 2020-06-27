// @flow

import {eq, is, test, throws, tru} from '../dev/test-setup.js';
import {Str} from '../src';

test('ignoreCase', () => {
  tru(Str.ignoreCase('abc', 'AbC', Str.equals));
  tru(Str.ignoreCase('abc', /AbC/, Str.equals));
});

test('repeat', () => {
  is(Str.repeat('a', NaN), '');
  is(Str.repeat('a', 7), 'aaaaaaa');
});

test('toNumber', () => {
  is(Str.toNumber('123'), 123);
  is(Str.toNumber('123.5'), 123.5);
  is(Str.toNumber('123,5'), NaN);
  is(Str.toNumber('123,5', ','), 123.5);
  is(Str.toNumber('4,123'), NaN);
  throws(() => Str.toNumber('4.123', '.', '.'));
  is(Str.toNumber('4,123', '.', ','), 4123);
  is(Str.toNumber('4.123,5', ',', '.'), 4123.5);
});

test('trim', () => {
  is(Str.trim('adam '), 'adam');
  is(Str.trim('  adam'), 'adam');
  is(Str.trim('  adam '), 'adam');
  is(Str.trim('\r\n  adam\n\t '), 'adam');

  is(Str.trim('bad adam eve', 'bad'), ' adam eve');
  is(Str.trim('adam eve bad', 'bad'), 'adam eve ');
  is(Str.trim('bad adam eve bad', 'bad'), ' adam eve ');

  is(Str.trim('$$adam eve$', /\$/), '$adam eve');
  is(Str.trim('$$adam eve$', /\$*/), 'adam eve');

  is(Str.trim('abaca', /a\wa/), 'ca');
});

test('trimStart', () => {
  is(Str.trimStart('adam '), 'adam ');
  is(Str.trimStart('  adam'), 'adam');
  is(Str.trimStart('  adam '), 'adam ');
  is(Str.trimStart('\r\n  adam\n\t '), 'adam\n\t ');

  is(Str.trimStart('bad adam eve', 'bad'), ' adam eve');
  is(Str.trimStart('adam eve bad', 'bad'), 'adam eve bad');
  is(Str.trimStart('bad adam eve bad', 'bad'), ' adam eve bad');

  is(Str.trimStart('$$adam eve$', /\$/), '$adam eve$');
  is(Str.trimStart('$$adam eve$', /\$*/), 'adam eve$');
});

test('trimEnd', () => {
  is(Str.trimEnd('adam '), 'adam');
  is(Str.trimEnd('  adam'), '  adam');
  is(Str.trimEnd('  adam '), '  adam');
  is(Str.trimEnd('\r\n  adam\n\t '), '\r\n  adam');

  is(Str.trimEnd('bad adam eve', 'bad'), 'bad adam eve');
  is(Str.trimEnd('adam eve bad', 'bad'), 'adam eve ');
  is(Str.trimEnd('bad adam eve bad', 'bad'), 'bad adam eve ');

  is(Str.trimEnd('$$adam eve$$', /\$/), '$$adam eve$');
  is(Str.trimEnd('$$adam eve$$', /\$*/), '$$adam eve');
});

test('replaceEvery', () => {
  is(Str.replaceEvery('', '', 'apple'), 'apple');
  is(Str.replaceEvery('', 'a', 'apple'), '');
  is(Str.replaceEvery('a', 'a', 'apple'), 'apple');
  is(Str.replaceEvery('aa', 'a', 'apple'), 'appleapple');
  is(Str.replaceEvery('a-a', 'a', 'apple'), 'apple-apple');

  is(Str.replaceEvery('a-a', /a/, 'apple'), 'apple-apple');
  is(
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
