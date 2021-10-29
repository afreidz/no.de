import Logger from 'spice-logger';
import Container from './container.js';
import yoga from 'yoga-layout-prebuilt';

export default class Wrapper extends Container {
  constructor(parent) {
    super({}, parent);

    this.node.setJustifyContent(yoga.JUSTIFY_FLEX_START);
    this.node.setFlexDirection(yoga.FLEX_DIRECTION_ROW);
    this.node.setAlignItems(yoga.ALIGN_STRETCH);

    Logger.info(`Creating Wrapper (${this.id}) with geo: ${JSON.stringify(this.geo)}`);
  }

  set full(v = false) {
    const p = Container.getById(this.parent);
    if (!p) return;

    if (!v) {
      this.node.setHeightAuto();
      this.node.setWidthAuto();
    } else if (!!v && p.node.getFlexDirection() === yoga.FLEX_DIRECTION_ROW) {
      this.node.setHeightAuto();
      this.node.setWidthPercent(100);
    } else if (!!v && p.node.getFlexDirection() === yoga.FLEX_DIRECTION_COLUMN) {
      this.node.setWidthAuto();
      this.node.setHeightPercent(100);
    }

    this.root.refresh();
  }

  remove(C) {
    super.remove(C);
    if (this.children.length === 0) {
      const p = Container.getById(this.parent);
      if (p.children.length > 1) p.remove(this);
    }
  }

  static getAll() {
    return Container.getByType(this);
  }
}