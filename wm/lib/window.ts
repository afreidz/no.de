import Section from './section.js';
import Container, { ContainerConstructor, Coord } from './container.js';

export default class Window extends Container {
  mapped?: Boolean;

  constructor(opts: ContainerConstructor = {}) {
    super(opts);
    this.isWin = true;
  }

  append(c: Container, i: number) {
    throw new Error('windows may not have children');
  }

  appendTo(c: Section, i?: number) {
    super.append(c, i);
  }

  remove(c: Container) {
    throw new Error('windows may not have children');
  }

  static getAll(): Array<Window> {
    return Container.getByType(this);
  }

  static getByCoords(c: Coord): Window {
    const { x, y } = c;
     return this.getAll().find(w => {
      const geo = w.geo;
      return w.workspace.active
        && x >= geo.x
        && x <= (geo.x + geo.w)
        && y >= geo.y
        && y <= (geo.y + geo.h);
    });
  }
}
