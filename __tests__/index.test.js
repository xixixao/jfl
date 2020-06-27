// @flow

import {invariant, nullthrows} from '..';
import {is, test, throws} from '../dev/test-setup.js';

test('nullthrows', () => {
  throws(() => nullthrows(null));
  is(nullthrows('a'), 'a');
});

test('invariant', () => {
  throws(() => invariant(typeof 3 === 'string', 'expected string'));
  invariant(typeof 'a' === 'string', 'expected string');
});
