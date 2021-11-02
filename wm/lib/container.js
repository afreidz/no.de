const uuid = require('uuid');
const X11 = require('./x11');
const yoga = require('yoga-layout-prebuilt');
const Logger = require('spice-logger/logger.cjs');

const Cache = new Map();

module.exports = class Container {
  #children;

  constructor(opts = { x11: null, id: null }) {
    if (opts.x11 && !(opts.x11 instanceof X11)) throw new Error(`opts.x11 must be an instance of X11`);
    if (opts.id && Cache.has(opts.id)) throw new Error(`Container with ID: ${opts.id} already exists`);
    const node = yoga.Node.create();

    this.node = node;
    this.X11 = opts.x11;
    this.#children = new Set;
    this.id = opts.id || uuid.v4();

    if (opts.w) this.node.setWidth(opts.w);
    if (opts.h) this.node.setHeight(opts.h);

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
    const layout = this.node.getComputedLayout();

    if (this.parent && !!Container.getById(this.parent)) {
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
    if (!this.X11 || !(this.X11 instanceof X11)) throw new Error(`Cannot draw container with no X11 client`);
    this.root.refresh();
    Logger.info(`Drawing window ${this.id} at ${JSON.stringify(this.geo)}`);
    this.X11.client.MapWindow(this.id);
    this.X11.client.MoveWindow(this.id, this.geo.x, this.geo.y);
    this.X11.client.ResizeWindow(this.id, this.geo.w, this.geo.h);
  }

  append(container) {
    if (!(container instanceof Container)) throw new Error(`Cannot append to ${this.id}.  ${container} is not an instance of Container`);
    if (this.ancestors.includes(container.id)) throw new Error(`Cannot append ${container.id}. It is an ancestor of ${this.id}`);
    if (this.#children.has(container.id)) throw new Error(`Cannot append ${container.id}.  It is already a child of ${this.id}`);
    Logger.info(`Appending ${container?.id} to ${this.id}`);
    container.parent = this.id;
    this.node.insertChild(container.node, this.node.getChildCount());
    this.#children.add(container.id);
  }

  remove(container) {
    if (!(container instanceof Container)) throw new Error(`Cannot revmove from ${this.id}.  ${container} is not an instance of Container`);
    if (!this.#children.has(container.id)) throw new Error(`Cannot remove ${container.id}.  It is not a child of ${this.id}`);
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
    return [...Cache.values()].filter(c => (c instanceof type));
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

exports = module.exports;
exports.Cache = Cache;