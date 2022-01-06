import Section from './section.js';
import Container, { ContainerConstructor } from './container.js';

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

  static getAll(): Array<Section> {
    return Container.getByType(Section);
  }
}
