import Window from './window.js';
import Workspace from './workspace.js';
import Container, { ContainerConstructor, Geography } from './container.js';

export default class Section extends Container {
  constructor(opts: ContainerConstructor = {}) {
    super(opts);
  }

  get geo(): Geography {
    if (this.children.length > 1 && this.layoutChildren.length === 0) {
      return { x: 0, y: 0, w: 0, h: 0 };
    } else {
      return super.geo;
    }
  }

  set geo(g: Geography) {
    super.geo = g;
  }

  append(c: Window, i?: number) {
    super.append(c, i);
  }

  appendTo(c: Workspace, i?: number) {
    super.appendTo(c, i);
  }

  remove(c: Window) {
    super.remove(c);
    if (this.children.length === 0 && this.parent.children.length > 1) this.parent.remove(this);
  }

  static getAll(): Array<Section> {
    return Container.getByType(Section);
  }
}