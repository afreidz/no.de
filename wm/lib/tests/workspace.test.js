// Mocks
const { nodeMock } = require('./mocks/yoga.mock');
const yoga = require('./mocks/yoga.mock');
const X11 = require('./mocks/x11.mock');
require('./mocks/logger.mock');
require('./mocks/screen.mock');

// Unit
const Window = require('../window');
const Screens = require('../screen');
const Wrapper = require('../wrapper');
const Workspace = require('../workspace');

// Setup
let x11;
let screens;
beforeAll(async () => {
  x11 = await (new X11());
  screens = await Screens();
});

// Specs
describe('Workspace', () => {
  test('It should call draw on all children when the workspace is redrawn', () => {
    const ws = new Workspace(screens[0]);
    ws.active = true;
    const wrapper = Wrapper.getById(ws.children[0]);
    const w1 = new Window(wrapper, 1, x11);
    const w2 = new Window(wrapper, 2, x11);
    const wrapper2 = new Wrapper(ws);
    const w3 = new Window(wrapper2, 3, x11);

    const windows = ws.children.map(c => Wrapper.getById(c).children).flat();
    const spies = [];
    windows.forEach(w => {
      const win = Window.getById(w);
      spies.push(jest.spyOn(win, 'draw'));
    });
    spies.forEach(s => {
      expect(s).not.toHaveBeenCalled();
    });
    ws.redraw();
    spies.forEach(s => {
      expect(s).toHaveBeenCalledTimes(1);
    });
  });
});