// Mocks
const X11 = require('./mocks/x11.mock');
require('./mocks/logger.mock');
require('./mocks/yoga.mock');

// Unit
const Container = require('../container');

// Specs
describe('Container', () => {
  test('It should throw a meaningful error if not constructed properly', async () => {
    const x11 = await (new X11());
    const parent = new Container({ x11 });
    expect(() => new Container()).toThrow('X11');
    expect(() => new Container({ x11, parent: new Date })).toThrow('Container');
    expect(() => new Container({ x11, parent })).not.toThrow();
  });
  test('It should report its ancestors (including root) accurately', async () => {
    const x11 = await (new X11());
    const grand = new Container({ x11 });
    const parent = new Container({ x11, parent: grand });
    const child = new Container({ x11, parent });
    expect(grand.ancestors).toStrictEqual([]);
    expect(parent.ancestors).toStrictEqual([grand.id]);
    expect(child.ancestors).toContain(parent.id);
    expect(child.ancestors).toContain(grand.id);
    expect(child.ancestors.length).toBe(2);
    expect(grand.root.id).toBe(grand.id);
    expect(parent.root.id).toBe(grand.id);
    expect(child.root.id).toBe(grand.id);
  });
});