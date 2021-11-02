const yoga = require('yoga-layout-prebuilt');

const nodeMock = {
  getWidth: jest.fn(),
  setWidth: jest.fn(),
  getHeight: jest.fn(),
  setHeight: jest.fn(),
  setMargin: jest.fn(),
  setPadding: jest.fn(),
  setFlexGrow: jest.fn(),
  insertChild: jest.fn(),
  setFlexWrap: jest.fn(),
  removeChild: jest.fn(),
  setAlignSelf: jest.fn(),
  setWidthAuto: jest.fn(),
  setHeightAuto: jest.fn(),
  setFlexShrink: jest.fn(),
  setAlignItems: jest.fn(),
  getChildCount: jest.fn(),
  setAlignContent: jest.fn(),
  calculateLayout: jest.fn(),
  setWidthPercent: jest.fn(),
  setHeightPercent: jest.fn(),
  getFlexDirection: jest.fn(),
  setFlexDirection: jest.fn(),
  setJustifyContent: jest.fn(),
  getComputedLayout: jest.fn(() => ({
    top: 5,
    left: 5,
    width: 100,
    height: 100,
  })),
  setJustifyContent: jest.fn(),
};

yoga.Node.create.mockImplementation(() => nodeMock);
jest.mock('yoga-layout-prebuilt');

module.exports = yoga;
exports = module.exports;
exports.nodeMock = nodeMock;