// @flow

import {Cl, invariant, nullthrows} from '..';
import {setup} from '../dev/test-util.js';

const {test, eqqq, throws} = setup(Cl.equals, Cl.equalsNested);

test('nullthrows', () => {
  throws(() => nullthrows(null));
  eqqq(nullthrows('a'), 'a');
});

test('invariant', () => {
  throws(() => invariant(typeof 3 === 'string', 'expected string'));
  invariant(typeof 'a' === 'string', 'expected string');
});
