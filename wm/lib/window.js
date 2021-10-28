import Logger from 'spice-logger';
import Container from './container.js';
import yoga from 'yoga-layout-prebuilt';

export default class Window extends Container {
  constructor(opts = {}, parent = false) {
    super(opts);
    this.margin = 5;

    this.node.setJustifyContent(yoga.JUSTIFY_FLEX_START);
    this.node.setFlexDirection(yoga.FLEX_DIRECTION_ROW);
    this.node.setAlignContent(yoga.ALIGN_STRETCH);
    this.node.setAlignItems(yoga.ALIGN_STRETCH);
    this.node.setAlignSelf(yoga.ALIGN_AUTO);
    this.node.setHeightAuto();
    this.node.setWidthAuto();
    this.node.setFlexGrow(1);

    if (parent) parent.append(this);

    Logger.info(`Creating Window (${this.id}) with opts: ${JSON.stringify(opts)}`);
  }

  static getAll() {
    return Container.getByType(this);
  }

  static getByCoords(x, y) {
    return Window.getAll().find(c => {
      const geo = c.geo;
      return x >= geo.x
        && x <= (geo.x + geo.w)
        && y >= geo.y
        && y <= (geo.y + geo.h);
    });
  }
}