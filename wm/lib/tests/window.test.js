// Mocks
const { nodeMock } = require('./mocks/yoga.mock');
const yoga = require('./mocks/yoga.mock');
const X11 = require('./mocks/x11.mock');
require('./mocks/logger.mock');
jest.mock('../wrapper');

// Unit
const Window = require('../window');

// Other
const Wrapper = require('../wrapper');
const Container = require('../container');

// Setup
beforeEach(() => {
  Object.values(nodeMock).forEach(m => m.mockReset());
});

// Specs
describe('Window', () => {
  test('It should throw a meaningful error if not constructed properly', () => {
    const badp = new Container();
    expect(() => new Window(badp)).toThrow('Wrapper');
    const parent = new Wrapper();
    let win;
    expect(() => { win = new Window(parent) }).not.toThrow();
    win.deref();
  });
  test('It should statically return all instances', () => {
    const w1 = new Window(new Wrapper());
    const w2 = new Window(new Wrapper());
    const w3 = new Window(new Wrapper());
    const all = Window.getAll();
    expect(Window.getAll().length).toBe(3);
  });
  test('It should set "window" node properties', () => {
    const w1 = new Window(new Wrapper());
    expect(nodeMock.setJustifyContent).toHaveBeenCalledWith(yoga.JUSTIFY_FLEX_START);
    expect(nodeMock.setJustifyContent).toHaveBeenCalledTimes(1);

    expect(nodeMock.setMargin).toHaveBeenCalledWith(yoga.EDGE_ALL, 5);
    expect(nodeMock.setMargin).toHaveBeenCalledTimes(1);

    expect(nodeMock.setFlexDirection).toHaveBeenCalledWith(yoga.FLEX_DIRECTION_ROW);
    expect(nodeMock.setFlexDirection).toHaveBeenCalledTimes(1);

    expect(nodeMock.setAlignContent).toHaveBeenCalledWith(yoga.ALIGN_STRETCH);
    expect(nodeMock.setAlignContent).toHaveBeenCalledTimes(1);

    expect(nodeMock.setAlignItems).toHaveBeenCalledWith(yoga.ALIGN_STRETCH);
    expect(nodeMock.setAlignItems).toHaveBeenCalledTimes(1);

    expect(nodeMock.setAlignSelf).toHaveBeenCalledWith(yoga.ALIGN_AUTO);
    expect(nodeMock.setAlignSelf).toHaveBeenCalledTimes(1);

    expect(nodeMock.setHeightAuto).toHaveBeenCalledTimes(1);
    expect(nodeMock.setWidthAuto).toHaveBeenCalledTimes(1);

    expect(nodeMock.setFlexGrow).toHaveBeenCalledTimes(1);
    expect(nodeMock.setFlexGrow).toHaveBeenCalledWith(1);
  });
});