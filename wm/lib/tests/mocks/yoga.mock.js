const yoga = require('yoga-layout-prebuilt');

const nodeMock = {
  getWidth: jest.fn(),
  getHeight: jest.fn(),
  setFlexGrow: jest.fn(),
  insertChild: jest.fn(),
  setWidthAuto: jest.fn(),
  setHeightAuto: jest.fn(),
  setFlexShrink: jest.fn(),
  setAlignItems: jest.fn(),
  getChildCount: jest.fn(),
  calculateLayout: jest.fn(),
  setJustifyContent: jest.fn(),
  setFlexDirection: jest.fn(),
};

yoga.Node.create.mockImplementation(() => nodeMock);
jest.mock('yoga-layout-prebuilt');

module.exports = yoga;
exports.nodeMock = nodeMock;