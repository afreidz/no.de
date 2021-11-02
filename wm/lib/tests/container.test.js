// Mocks
const { clientMock } = require('./mocks/x11.mock');
const X11 = require('./mocks/x11.mock');
require('./mocks/logger.mock');
require('./mocks/yoga.mock');

// Unit
const Container = require('../container');
const { Cache } = require('../container');

// Setup
let x11;
beforeAll(async () => {
  x11 = await (new X11());
});


// Specs
describe('Container', () => {
  test('It should throw a meaningful error if not constructed properly', () => {
    expect(() => new Container({ x11: new Date })).toThrow('X11');
    expect(() => new Container({ x11 })).not.toThrow();
  });
  test('It should report its ancestors (including root) accurately', () => {
    const grand = new Container({ x11 });
    const parent = new Container({ x11 });
    const child = new Container({ x11 });
    grand.append(parent);
    parent.append(child);
    expect(grand.ancestors).toStrictEqual([]);
    expect(parent.ancestors).toStrictEqual([grand.id]);
    expect(child.ancestors).toContain(parent.id);
    expect(child.ancestors).toContain(grand.id);
    expect(child.ancestors.length).toBe(2);
    expect(grand.root.id).toBe(grand.id);
    expect(parent.root.id).toBe(grand.id);
    expect(child.root.id).toBe(grand.id);
  });
  test('It should calculate its geometry', () => {
    const c1 = new Container({ x11 });
    expect(c1.geo.x).toBe(5);
    expect(c1.geo.y).toBe(5);
    expect(c1.geo.w).toBe(100);
    expect(c1.geo.h).toBe(100);

    const c2 = new Container({ x11 });
    c1.append(c2);
    expect(c2.geo.x).toBe(10);
    expect(c2.geo.y).toBe(10);
    expect(c2.geo.w).toBe(100);
    expect(c2.geo.h).toBe(100);
  });
  test('It should report its children', () => {
    const p = new Container({ x11 });
    expect(p.children).toStrictEqual([]);

    const c = new Container({ x11 });
    p.append(c);
    expect(c.children).toStrictEqual([]);
    expect(p.children).toContain(c.id);
    expect(p.children.length).toBe(1);
  });
  test('It should be able to draw itself', () => {
    const parent = new Container({ x11 });
    const parentRefreshSpy = jest.spyOn(parent, 'refresh');
    parent.draw();
    expect(parentRefreshSpy).toHaveBeenCalledTimes(1);
    expect(clientMock.MapWindow).toHaveBeenCalledTimes(1);
    expect(clientMock.MoveWindow).toHaveBeenCalledTimes(1);
    expect(clientMock.UnmapWindow).toHaveBeenCalledTimes(1);
    expect(clientMock.ResizeWindow).toHaveBeenCalledTimes(1);

    const child = new Container({ x11 });
    parent.append(child);
    const childRefreshSpy = jest.spyOn(child, 'refresh');
    child.draw();
    expect(childRefreshSpy).not.toHaveBeenCalled();
    expect(parentRefreshSpy).toHaveBeenCalledTimes(2);
    expect(clientMock.MapWindow).toHaveBeenCalledTimes(2);
    expect(clientMock.MoveWindow).toHaveBeenCalledTimes(2);
    expect(clientMock.UnmapWindow).toHaveBeenCalledTimes(2);
    expect(clientMock.ResizeWindow).toHaveBeenCalledTimes(2);
  });
  test('Append/Remove should throw meaningful errors', () => {
    const parent = new Container({ x11 });
    const child = new Container({ x11 });
    parent.append(child);
    expect(() => child.append(new Date)).toThrow('Container');
    expect(() => child.append(parent)).toThrow('ancestor');
    expect(() => parent.append(child)).toThrow('child');
    expect(() => parent.remove(new Date)).toThrow('Container');
    expect(() => parent.remove(child)).not.toThrow();
    expect(() => parent.remove(child)).toThrow('child');
  });
  test('When removed, a container should be dereferenced', () => {
    const parent = new Container({ x11 });
    const child = new Container({ x11 });
    parent.append(child);
    expect(Cache.has(parent.id)).toBe(true);
    expect(Cache.has(child.id)).toBe(true);
    parent.remove(child);
    expect(Cache.has(parent.id)).toBe(true);
    expect(Cache.has(child.id)).toBe(false);
  });
});