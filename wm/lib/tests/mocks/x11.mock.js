const X11 = require('../../x11');

let counter = 0;
X11.mockImplementation(() => {
  const inst = Object.create(X11.prototype);
  inst.client = {
    AllocID: jest.fn(() => (counter += 1)),
  };
  return inst;
});

jest.mock('../../x11');
module.exports = X11;