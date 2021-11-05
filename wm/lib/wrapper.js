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
    this.node.setJustifyContent(yoga.JUSTIFY_FLEX_START);
    this.node.setFlexDirection(yoga.FLEX_DIRECTION_COLUMN);

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

  increase(v = 2, wid = null) {

    const n = this.children.length;
    if (n === 1) return;

    const win = Container.getById(wid) || Container.getById(this.children[0]);
    const current = win.node.getFlexGrow();
    const val = current + (v / 10);
    this.emit('info', `setting ${win.id} to fg: ${val <= 1 ? 1 : val}`);
    win.node.setFlexGrow(val <= 1 ? 1 : val);

    Container.getById(this.parent).redraw();
  }

  decrease(v = 2, wid = null) {
    const n = this.children.length;
    if (n === 1) return;

    const win = Container.getById(wid)
      || Container.getById(this.children[0]);

    this.children.forEach(c => {
      if (c === win.id) return;
      const us = Container.getById(c);

      const current = us.node.getFlexGrow();
      const val = current + (v / 10);
      us.node.setFlexGrow(val <= 1 ? 1 : val);
    });

    Container.getById(this.parent).redraw();
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

  static getByCoords(x, y) {
    return Wrapper.getAll().find(c => {
      const geo = c.geo;
      return !!Container.getById(c.parent).active
        && x >= geo.x
        && x <= (geo.x + geo.w)
        && y >= geo.y
        && y <= (geo.y + geo.h);
    });
  }
}

module.exports = Wrapper;