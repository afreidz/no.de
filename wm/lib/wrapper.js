const X11 = require('./x11');
const Container = require('./container');
const yoga = require('yoga-layout-prebuilt');
const Logger = require('spice-logger/logger.cjs');

class Wrapper extends Container {
  #isFull;

  constructor(parent = null) {
    if (parent.constructor.name !== 'Workspace') throw new Error('Wrapper must have a parent of Workspace');
    super();

    this.#isFull = false;
    this.node.setFlexGrow(1);
    this.node.setWidthAuto();
    this.node.setHeightAuto();
    this.node.setFlexShrink(0);
    this.node.setAlignItems(yoga.ALIGN_STRETCH);
    this.node.setFlexDirection(yoga.FLEX_DIRECTION_ROW);
    this.node.setJustifyContent(yoga.JUSTIFY_FLEX_START);

    parent.append(this);
    Logger.info(`Creating Wrapper (${this.id}), Parent Workspace: (${parent.id})`);
  }

  get full() {
    return !!this.#isFull;
  }

  set full(v = false) {
    if (!this.parent) return;
    const p = Container.getById(this.parent);

    if (!v) {
      this.#isFull = false;
      this.node.setHeightAuto();
      this.node.setWidthAuto();
    } else if (!!v && p.node.getFlexDirection() === yoga.FLEX_DIRECTION_ROW) {
      this.#isFull = true;
      this.node.setHeightAuto();
      this.node.setWidthPercent(100);
    } else if (!!v && p.node.getFlexDirection() === yoga.FLEX_DIRECTION_COLUMN) {
      this.#isFull = true;
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

module.exports = Wrapper;