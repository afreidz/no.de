import Section from './section.js';
import Container, { ContainerConstructor, Dir } from './container.js';

export default class Window extends Container {
  constructor(opts: ContainerConstructor = {}) {
    super(opts);
    this.isWin = true;
  }

  append() {
    throw new Error('windows may not have children');
  }

  appendTo(c: Section, i?: number) {
    super.append(c, i);
  }

  remove() {
    throw new Error('windows may not have children');
  }

  static getAll(): Array<Section> {
    return Container.getByType(Section);
  }
}