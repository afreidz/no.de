const X11 = require('./x11');
const Container = require('./container');
const yoga = require('yoga-layout-prebuilt');
const Logger = require('spice-logger/logger.cjs');

class Window extends Container {
  constructor(parent = null, id = null, x11 = null) {
    if (parent?.constructor.name !== 'Wrapper') throw new Error(`Window must have a parent of Wrapper`);
    super({ x11, id });
    this.margin = 10;

    this.node.setJustifyContent(yoga.JUSTIFY_FLEX_START);
    this.node.setFlexDirection(yoga.FLEX_DIRECTION_ROW);
    this.node.setAlignContent(yoga.ALIGN_STRETCH);
    this.node.setAlignItems(yoga.ALIGN_STRETCH);
    this.node.setAlignSelf(yoga.ALIGN_AUTO);
    this.node.setFlexShrink(0);
    this.node.setHeightAuto();
    this.node.setWidthAuto();
    this.node.setFlexGrow(1);

    parent.append(this);
    Logger.info(`Creating Window (${this.id}), Parent Wrapper: (${parent.id})`);
  }

  static getAll() {
    return Container.getByType(this);
  }
}

module.exports = Window;