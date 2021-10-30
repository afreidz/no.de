const X11 = require('./x11');
const yoga = require('yoga-layout-prebuilt');
const Logger = require('spice-logger/logger.cjs');

const Cache = new Map();

exports.Cache = Cache;
module.exports = class Container {
  #children;

  constructor(opts = { x11: null, id: null, parent: null }) {
    if (!(opts.x11 instanceof X11)) throw new Error(`opts.x11 must be an instance of X11`);
    if (opts.id && Cache.has(opts.id)) throw new Error(`Container with ID: ${opts.id} already exists`);
    if (opts.parent && !(opts.parent instanceof Container)) throw new Error(`opts.parent must be an instance of Container`);
    const node = yoga.Node.create();

    this.X11 = opts.x11;
    this.#children = new Set;
    this.id = opts.id || this.X11.client.AllocID();

    this.node = node;
    this.node.setFlexGrow(1);
    this.node.setWidthAuto();
    this.node.setHeightAuto();
    this.node.setFlexShrink(0);
    this.node.setAlignItems(yoga.ALIGN_STRETCH);
    this.node.setJustifyContent(yoga.JUSTIFY_STRETCH);
    this.node.setFlexDirection(yoga.FLEX_DIRECTION_ROW);

    if (opts.w) this.node.setWidth(opts.w);
    if (opts.h) this.node.setHeight(opts.h);

    if (opts.parent) opts.parent.append(this);
    Cache.set(this.id, this);
  }

  set margin(n = 0) {
    this.node.setMargin(yoga.EDGE_ALL, n);
  }

  set pad(n = 0) {
    this.node.setPadding(yoga.EDGE_ALL, n);
  }

  get ancestors() {
    if (!this.parent) return [];
    const p = Container.getById(this.parent);
    return [p?.id, p?.ancestors].flat();
  }

  get root() {
    const root = this.ancestors.find(a => {
      const p = Container.getById(a);
      return !p?.parent;
    });
    return Container.getById(root) || this;
  }

  get geo() {
    this.root.refresh();
    const layout = this.node.getComputedLayout();

    if (this.parent) {
      const p = Container.getById(this.parent);
      layout.top += p.geo.y;
      layout.left += p.geo.x;
    }

    return {
      y: layout.top,
      x: layout.left,
      w: layout.width,
      h: layout.height,
    }
  }

  get children() {
    return [...this.#children];
  }

  refresh() {
    this.node.calculateLayout(this.node.getWidth(), this.node.getHeight(), yoga.DIRECTION_LTR);
  }

  draw() {
    this.root.refresh();
    Logger.info(`Drawing window ${this.id} at ${JSON.stringify(this.geo)}`);
    this.X11.client.MapWindow(this.id);
    this.X11.client.MoveWindow(this.id, this.geo.x, this.geo.y);
    this.X11.client.ResizeWindow(this.id, this.geo.w, this.geo.h);
  }

  append(container) {
    if (this.#children.has(container.id)) throw new Error(`Cannot append ${container.id}.  It is already a child of ${this.id}`);
    if (!container instanceof Container) throw new Error(`Cannot append to ${this.id}.  ${container} is not an instance of Container`);
    Logger.info(`Appending ${container?.id} to ${this.id}`);
    container.parent = this.id;
    this.node.insertChild(container.node, this.node.getChildCount());
    this.#children.add(container.id);
    this.root.refresh();
  }

  remove(container) {
    if (!this.#children.has(container.id)) throw new Error(`Cannot remove ${container.id}.  It is not a child of ${this.id}`);
    if (!container instanceof Container) throw new Error(`Cannot revmove from ${this.id}.  ${container} is not an instance of Container`);
    Logger.info(`Removing ${container?.id} from ${this.id}`);
    container.parent = null;
    this.node.removeChild(container.node);
    this.#children.delete(container.id);
    this.root.refresh();
    container.deref();
  }

  deref() {
    Cache.delete(this.id);
  }

  static getById(id) {
    return Cache.get(id);
  }

  static getByType(type) {
    return [...Cache.values()].filter(c => c instanceof type);
  }

  static getAll() {
    return [...Cache.values()];
  }

  static getByCoords(x, y) {
    return Container.getAll().find(c => {
      const geo = c.geo;
      return c instanceof this
        && x >= geo.x
        && x <= (geo.x + geo.w)
        && y >= geo.y
        && y <= (geo.y + geo.h);
    });
  }
}