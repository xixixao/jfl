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
