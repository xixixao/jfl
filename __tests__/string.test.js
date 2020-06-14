// @flow

const {Ar, Cl, St, $St, Mp, $Mp, Mth, Str} = require('..');
const {setup} = require('../dev/test-util.js');

const {test, tru, eq, eqq, eqqq, not, nil, throws} = setup(
  Cl.equals,
  Cl.equalsNested,
);

test('replace', () => {
  eqqq(Str.replace('', '', 'apple'), 'apple');
  eqqq(Str.replace('', 'a', 'apple'), '');
  eqqq(Str.replace('a', 'a', 'apple'), 'apple');
  eqqq(Str.replace('aa', 'a', 'apple'), 'appleapple');
  eqqq(Str.replace('a-a', 'a', 'apple'), 'apple-apple');
});
