exports.setup = matcher => {
  expect.extend({
    tru(_, argument) {
      const pass = argument === true;
      if (pass) {
        return {
          message: () => `expected ${argument} to be true`,
          pass: true,
        };
      } else {
        return {
          message: () => `expected ${argument} to be true`,
          pass: false,
        };
      }
    },
    eq(_, a, b) {
      const pass = matcher(a, b);
      if (pass) {
        return {
          message: () => `expected ${a} to match ${b}`,
          pass: true,
        };
      } else {
        return {
          message: () => `expected ${a} to match ${b}`,
          pass: false,
        };
      }
    },
    eqq(_, a, b) {
      const pass = a === b;
      if (pass) {
        return {
          message: () => `expected ${a} to === ${b}`,
          pass: true,
        };
      } else {
        return {
          message: () => `expected ${a} to === ${b}`,
          pass: false,
        };
      }
    },
  });
  const exp = expect();
  exp.test = test;
  return exp;
};
