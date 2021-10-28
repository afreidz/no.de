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

  destroy(C) {
    super.destroy(C);
    if (this.children.length === 0) {
      Container.getById(this.parent).destroy(this);
    }
  }

  static getAll() {
    return Container.getByType(this);
  }

  static getByCoords(x, y) {
    return Wrapper.getAll().find(c => {
      const geo = c.geo;
      return x >= geo.x
        && x <= (geo.x + geo.w)
        && y >= geo.y
        && y <= (geo.y + geo.h);
    });
  }
}