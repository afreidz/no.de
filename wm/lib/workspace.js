import Logger from 'spice-logger';
import Wrapper from './wrapper.js';
import Container from './container.js';
import yoga from 'yoga-layout-prebuilt';

export default class Workspace extends Container {
  constructor(opts = {}) {
    super(opts.screen);

    this.pad = 5;
    this.screen = opts.screen;

    this.node.setJustifyContent(yoga.JUSTIFY_FLEX_START);
    this.node.setFlexDirection(yoga.FLEX_DIRECTION_ROW);
    this.node.setAlignContent(yoga.ALIGN_STRETCH);
    this.node.setAlignItems(yoga.ALIGN_STRETCH);
    this.node.setFlexWrap(yoga.WRAP_WRAP);
    this.node.setHeight(opts.screen.h);
    this.node.setWidth(opts.screen.w);

    this.append(new Wrapper());

    Logger.info(`Creating Workspace (${this.id}) with geo: ${JSON.stringify(this.geo)}`);
  }

  append(C) {
    super.append(C);
    C.full = true;
  }

  destroy(C) {
    super.destroy(C);
    if (this.children.length === 0) {
      this.append(new Wrapper());
    }
  }

  get geo() {
    const layout = super.geo;
    layout.x += this.screen.x;
    layout.y += this.screen.y;
    return layout;
  }

  static getAll() {
    return Container.getByType(this);
  }

  static getByCoords(x, y) {
    return Workspace.getAll().find(c => {
      const geo = c.geo;
      return x >= geo.x
        && x <= (geo.x + geo.w)
        && y >= geo.y
        && y <= (geo.y + geo.h);
    });
  }
}