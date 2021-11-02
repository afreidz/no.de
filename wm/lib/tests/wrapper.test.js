// Mocks
const { nodeMock } = require('./mocks/yoga.mock');
const yoga = require('./mocks/yoga.mock');
require('./mocks/x11.mock');
require('./mocks/logger.mock');
require('./mocks/screen.mock');
// jest.mock('../workspace');

// Unit
const Screens = require('../screen');
const Wrapper = require('../wrapper');
const Workspace = require('../workspace');
const Container = require('../container');

// Setup
let ws;
let screens;
beforeAll(async () => {
  screens = await Screens();
  ws = new Workspace(screens[0]);
});
afterEach(() => {
  ws.children.forEach(c => {
    ws.remove(Wrapper.getById(c));
  });
});
beforeEach(() => {
  Object.values(nodeMock).forEach(m => m.mockReset());
});

// Specs
describe('Wrapper', () => {
  test('It should throw a meaningful error if not constructed properly', () => {
    const badp = new Container();
    expect(() => new Wrapper(badp)).toThrow('Workspace');
    expect(() => { wrap = new Wrapper(ws) }).not.toThrow();
  });
  test('It should statically return all instances', () => {
    expect(Wrapper.getAll().length).toBe(1);
    const w1 = new Wrapper(ws);
    const w2 = new Wrapper(ws);
    const w3 = new Wrapper(ws);
    expect(Wrapper.getAll().length).toBe(4);
  });
  test('It should set "wrapper" node properties', () => {
    new Wrapper(ws);
    expect(nodeMock.setFlexGrow).toHaveBeenCalledWith(1);
    expect(nodeMock.setFlexShrink).toHaveBeenCalledWith(0);

    expect(nodeMock.setWidthAuto).toHaveBeenCalledTimes(1);
    expect(nodeMock.setHeightAuto).toHaveBeenCalledTimes(1);

    expect(nodeMock.setAlignItems).toHaveBeenCalledWith(yoga.ALIGN_STRETCH);
    expect(nodeMock.setAlignItems).toHaveBeenCalledTimes(1);

    expect(nodeMock.setFlexDirection).toHaveBeenCalledWith(yoga.FLEX_DIRECTION_ROW);
    expect(nodeMock.setFlexDirection).toHaveBeenCalledTimes(1);

    expect(nodeMock.setJustifyContent).toHaveBeenCalledWith(yoga.JUSTIFY_FLEX_START);
    expect(nodeMock.setJustifyContent).toHaveBeenCalledTimes(1);
  });
  test('it should remove itself when emptied', () => {
    const wrap = new Wrapper(ws);
    const child = new Container();
    const id = `${wrap.id}`;

    wrap.append(child);
    expect(Wrapper.getById(id)).toBeTruthy();
    expect(wrap.children).toContain(child.id);
    wrap.remove(child);
    expect(Wrapper.getById(id)).toBeFalsy();
  });
  test('It should be able to take up the full space on a flex axis', () => {
    const wrap = new Wrapper(ws);
    nodeMock.setWidthAuto.mockReset();
    nodeMock.setHeightAuto.mockReset();
    nodeMock.setWidthPercent.mockReset();
    nodeMock.setHeightPercent.mockReset();
    wrap.full = false;
    expect(wrap.full).toBe(false);
    expect(nodeMock.setWidthAuto).toHaveBeenCalledTimes(1);
    expect(nodeMock.setHeightAuto).toHaveBeenCalledTimes(1);
    expect(nodeMock.setWidthPercent).not.toHaveBeenCalled();
    expect(nodeMock.setHeightPercent).not.toHaveBeenCalled();
    nodeMock.setWidthAuto.mockReset();
    nodeMock.setHeightAuto.mockReset();
    nodeMock.setWidthPercent.mockReset();
    nodeMock.setHeightPercent.mockReset();
    nodeMock.getFlexDirection.mockImplementation(() => yoga.FLEX_DIRECTION_ROW);
    wrap.full = true;
    expect(wrap.full).toBe(true);
    expect(nodeMock.setWidthAuto).not.toHaveBeenCalled();
    expect(nodeMock.setHeightAuto).toHaveBeenCalledTimes(1);
    expect(nodeMock.setHeightPercent).not.toHaveBeenCalled();
    expect(nodeMock.setWidthPercent).toHaveBeenCalledWith(100);
    nodeMock.setWidthAuto.mockReset();
    nodeMock.setHeightAuto.mockReset();
    nodeMock.setWidthPercent.mockReset();
    nodeMock.setHeightPercent.mockReset();
    nodeMock.getFlexDirection.mockImplementation(() => yoga.FLEX_DIRECTION_COLUMN);
    wrap.full = true;
    expect(wrap.full).toBe(true);
    expect(nodeMock.setHeightAuto).not.toHaveBeenCalled();
    expect(nodeMock.setWidthAuto).toHaveBeenCalledTimes(1);
    expect(nodeMock.setWidthPercent).not.toHaveBeenCalled();
    expect(nodeMock.setHeightPercent).toHaveBeenCalledWith(100);
  });
});