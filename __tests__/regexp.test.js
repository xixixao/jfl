// @flow

import {not, test, tru} from '../dev/test-setup.js';
import {REx} from '../src';

test('isRegExp', () => {
  tru(REx.isRegExp(/a/));
  not.tru(REx.isRegExp('a'));
});

test('equals', () => {
  not.tru(/a/ === /a/);
  tru(REx.equals(/a/, /a/));
  tru(REx.equals(/a/, /a/, /a/));
  not.tru(REx.equals(/a/, /a/i));
});

test('concat', () => {
  tru(REx.equals(REx.concat(/a/, /b/m), /ab/m));
  tru(REx.equals(REx.concat(/a/g, /b/m), /ab/m));
});

test('append', () => {
  tru(REx.equals(REx.append(/a/i, 'b'), /ab/i));
  tru(REx.equals(REx.append(/a/i, /b/m), /ab/i));
});

test('prepend', () => {
  tru(REx.equals(REx.prepend(/a/i, 'b'), /ba/i));
  tru(REx.equals(REx.prepend(/a/i, /b/m), /ba/i));
});

test('addFlags', () => {
  tru(REx.equals(REx.addFlags(/a/g, 'g'), /a/g));
  tru(REx.equals(REx.addFlags(/a/gi, 'ig'), /a/gi));
  tru(REx.equals(REx.addFlags(/a/g, 'i'), /a/gi));
});

test('removeFlags', () => {
  tru(REx.equals(REx.removeFlags(/a/g, 'i'), /a/g));
  tru(REx.equals(REx.removeFlags(/a/g, 'gi'), /a/));
});
