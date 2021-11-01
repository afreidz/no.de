const X11 = require('../../x11');

let counter = 0;

const clientMock = {
  require: jest.fn(),
  MapWindow: jest.fn(),
  MoveWindow: jest.fn(),
  ResizeWindow: jest.fn(),
  AllocID: jest.fn(() => (counter += 1)),
};

X11.mockImplementation(() => {
  const inst = Object.create(X11.prototype);
  inst.client = clientMock;
  return inst;
});

jest.mock('x11');
jest.mock('../../x11');

module.exports = X11;
exports = module.exports;
exports.clientMock = clientMock;