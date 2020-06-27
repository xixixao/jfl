// @flow

import {test as testFn} from '@jest/globals';
import {expect} from '@jest/globals';
import {Cl} from '../src';

expect.extend({
  tru(_, b) {
    return format(this, b === true, 'expected $0e to $not be true', b);
  },
  eq(_, a, b) {
    const pass = Cl.equals(a, b);
    return format(this, pass, 'expected $0r to $not match $1e', a, b);
  },
  eqq(_, a, b) {
    const pass = Cl.equalsNested(a, b);
    return format(this, pass, 'expected $0r to $not match $1e', a, b);
  },
  is(_, a, b) {
    return format(
      this,
      a === b || (a !== a && b !== b),
      `expected $0r to $not === $1e`,
      a,
      b,
    );
  },
  nil(_, a) {
    return format(this, a == null, `expected $0r to be null`, a);
  },
});

const exp = expect();

export const test: (
  name: string,
  fn: () => void | Promise<void>,
) => void = testFn;

export const tru: (value: boolean) => void = exp.tru;
export const eq: <V>(a: V, B: V) => void = exp.eq;
export const eqq: <V>(a: V, B: V) => void = exp.eqq;
export const is: <V>(a: V, B: V) => void = exp.is;
export const nil: <V>(a: V) => void = exp.nil;
export const not: {tru: (value: boolean) => void} = exp.not;
export function throws(fn: () => mixed): void {
  expect(fn).toThrow();
}

function format({utils}, pass, message, ...args) {
  return {
    pass,
    message: () => {
      let reply = pass
        ? message.replace(/\$not /g, 'not ')
        : message.replace(/\$not /g, '');
      for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        reply = reply.replace(
          new RegExp('\\$' + i + 'e', 'g'),
          utils.printExpected(arg),
        );
        reply = reply.replace(
          new RegExp('\\$' + i + 'r', 'g'),
          utils.printReceived(arg),
        );
      }
      return reply;
    },
  };
}
