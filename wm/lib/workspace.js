const X11 = require('./x11');
const Window = require('./window');
const Wrapper = require('./wrapper');
const Container = require('./container');
const yoga = require('yoga-layout-prebuilt');
const Logger = require('spice-logger/logger.cjs');

class Workspace extends Container {
  #active;

  constructor(screen = { i: 0, x: 0, y: 0, w: 100, h: 100 }) {
    super();
    this.pad = 5;
    this.active = false;
    this.screen = screen;
    this.node.setFlexGrow(1);
    this.node.setWidthAuto();
    this.node.setHeightAuto();
    this.node.setFlexShrink(0);
    this.node.setWidth(screen.w);
    this.node.setHeight(screen.h);
    this.node.setFlexWrap(yoga.WRAP_WRAP);
    this.node.setAlignItems(yoga.ALIGN_STRETCH);
    this.node.setAlignContent(yoga.ALIGN_STRETCH);
    this.node.setFlexDirection(yoga.FLEX_DIRECTION_ROW);
    this.node.setJustifyContent(yoga.JUSTIFY_FLEX_START);

    new Wrapper(this);
    Logger.info(`Creating Workspace (${this.id}) with screen: ${JSON.stringify(this.screen)}`);
  }

  get active() {
    return this.#active;
  }

  set active(v) {
    this.#active = !!v;

    if (!!v) {
      const others = Workspace.getByScreen(this.screen.i).filter(ws => ws !== this);
      others.forEach(ws => (ws.active = false));
      this.redraw();
    } else {
      this.windows.forEach(w => {
        Window.getById(w).hide();
      });
    }
  }

  redraw() {
    if (!this.active) return;
    this.windows.forEach(w => {
      Window.getById(w).draw();
    });
  }

  append(C) {
    super.append(C);
    C.full = true;
  }

  remove(C) {
    if (this.children.length === 1) return;
    super.remove(C);
  }

  get windows() {
    return this.children.map(c => Wrapper.getById(c).children).flat();
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

  static getByScreen(i) {
    return Workspace.getAll().filter(ws => ws.screen.i === i);
  }

  static getByCoords(x, y) {
    return Workspace.getAll().find(c => {
      const geo = c.geo;
      return c.active
        && x >= geo.x
        && x <= (geo.x + geo.w)
        && y >= geo.y
        && y <= (geo.y + geo.h);
    });
  }
}

module.exports = Workspace;