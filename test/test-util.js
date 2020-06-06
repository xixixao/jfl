exports.setup = (shallowMatcher, deepMatcher) => {
  expect.extend({
    tru(_, b) {
      return format(this, b === true, 'expected $0e to $not be true', b);
    },
    eq(_, a, b) {
      const pass = shallowMatcher(a, b);
      return format(this, pass, 'expected $0r to $not match $1e', a, b);
    },
    eqq(_, a, b) {
      const pass = deepMatcher(a, b);
      return format(this, pass, 'expected $0r to $not match $1e', a, b);
    },
    eqqq(_, a, b) {
      return format(this, a === b, `expected $0r to $not === $1e`, a, b);
    },
    nil(_, a) {
      return format(this, a == null, `expected $0r to be null`, a);
    },
  });
  const exp = expect();
  exp.test = test;
  exp.expect = expect;
  exp.throws = (fn) => {
    expect(fn).toThrow();
  }
  return exp;
};

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
