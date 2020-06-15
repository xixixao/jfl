// @flow

const {Ar, Cl, St, $St, Mp, $Mp, Mth, Str} = require('..');
const {setup} = require('../dev/test-util.js');

const {test, tru, eq, eqq, eqqq, not, nil, throws} = setup(
  Cl.equals,
  Cl.equalsNested,
);

test('replaceEvery', () => {
  eqqq(Str.replaceEvery('', '', 'apple'), 'apple');
  eqqq(Str.replaceEvery('', 'a', 'apple'), '');
  eqqq(Str.replaceEvery('a', 'a', 'apple'), 'apple');
  eqqq(Str.replaceEvery('aa', 'a', 'apple'), 'appleapple');
  eqqq(Str.replaceEvery('a-a', 'a', 'apple'), 'apple-apple');
});

test('words', () => {
  eq(Str.words('adam eve'), ['adam', 'eve']);
  eq(Str.words(' adam eve'), ['adam', 'eve']);
  eq(Str.words(' adam eve '), ['adam', 'eve']);
  eq(Str.words(' adam\neve '), ['adam', 'eve']);
  eq(Str.words(' adam\n\teve '), ['adam', 'eve']);
});

test('lines', () => {
  eq(Str.lines('adam\neve'), ['adam', 'eve']);
  eq(Str.lines('adam\r\neve'), ['adam', 'eve']);
  eq(Str.lines('adam\n\neve'), ['adam', '', 'eve']);
  eq(Str.lines('adam\n\neve\n'), ['adam', '', 'eve', '']);
  eq(Str.lines('adam\n\neve\n', true), ['adam', '', 'eve']);
});
