const X11 = require('./x11');
const Container = require('./container');
const yoga = require('yoga-layout-prebuilt');

class Window extends Container {
  #floating;

  constructor(parent = null, id = null, x11 = null) {
    if (parent?.constructor.name !== 'Wrapper') throw new Error(`Window must have a parent of Wrapper`);
    super({ x11, id });
    this.margin = 5;

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
    this.emit('info', `Creating Window (${this.id}), Parent Wrapper: (${parent.id})`);
  }

  get floating() {
    return this.#floating;
  }

  float() {
    const parent = Container.getById(this.parent);
    this.#floating = true;

    this.node.setPositionType(yoga.POSITION_TYPE_ABSOLUTE);
    this.node.setWidth(800);
    this.node.setHeight(600);
    this.node.setPosition(yoga.EDGE_TOP, 50);
    this.node.setPosition(yoga.EDGE_LEFT, 50);

    const allFloating = parent.children.every(c => {
      return Container.getById(c).floating;
    });

    if (allFloating) parent.collapse();

    Container.getById(parent.parent).redraw();
  }

  unfloat() {
    const parent = Container.getById(this.parent);
    this.#floating = false;

    this.node.setPositionType(yoga.POSITION_TYPE_RELATIVE);
    this.node.setWidthAuto();
    this.node.setHeightAuto();
    this.node.setPosition(yoga.EDGE_TOP, 0);
    this.node.setPosition(yoga.EDGE_LEFT, 0);
    parent.uncollapse();

    Container.getById(parent.parent).redraw();
  }

  static getAll() {
    return Container.getByType(this);
  }
}

module.exports = Window;