import xinit from './xinit.js';
import Logger from 'spice-logger';
import yoga from 'yoga-layout-prebuilt';

export const Cache = new Map();

const { Node } = yoga;
const { client } = await xinit;

export default class Container {
  #children;

  constructor(opts = {}, parent = null) {
    if (opts.id && Cache.has(opts.id)) throw new Error(`Container with ID: ${opts.id} already exists`);
    const node = Node.create();

    this.id = opts.id || client.AllocID();
    this.parent = null;

    this.#children = new Set;
    this.node = node;

    if (opts.w) this.width = opts.w;
    if (opts.h) this.height = opts.h;

    this.node.setFlexGrow(1);
    this.node.setWidthAuto();
    this.node.setHeightAuto();
    this.node.setFlexShrink(0);
    this.node.setAlignItems(yoga.ALIGN_STRETCH);
    this.node.setJustifyContent(yoga.JUSTIFY_STRETCH);
    this.node.setFlexDirection(yoga.FLEX_DIRECTION_ROW);

    if (parent) parent.append(this);

    Cache.set(this.id, this);
  }

  set full(v = false) {
    const p = Container.getById(this.parent);
    if (!p) return;

    if (!v) {
      this.node.setHeightAuto();
      this.node.setWidthAuto();
    }
    if (!!v && p.node.getFlexDirection() === yoga.FLEX_DIRECTION_ROW) {
      this.node.setHeightAuto();
      this.node.setWidthPercent(100);
    }
    if (!!v && p.node.getFlexDirection() === yoga.FLEX_DIRECTION_COLUMN) {
      this.node.setWidthAuto();
      this.node.setHeightPercent(100);
    }
    Container.getById(this.root).refresh();
  }

  set margin(n = 0) {
    this.node.setMargin(yoga.EDGE_ALL, n);
  }

  set pad(n = 0) {
    this.node.setPadding(yoga.EDGE_ALL, n);
  }

  set width(n = 0) {
    this.node.setWidth(n);
  }

  set height(n = 0) {
    this.node.setHeight(n);
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
    return root || this.id;
  }

  get geo() {
    Container.getById(this.root).refresh();
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
    Container.getById(this.root).refresh();
    Logger.info(`Drawing window ${this.id} at ${JSON.stringify(this.geo)}`);
    client.MapWindow(this.id);
    client.MoveWindow(this.id, this.geo.x, this.geo.y);
    client.ResizeWindow(this.id, this.geo.w, this.geo.h);
  }

  append(container) {
    if (!container instanceof Container) throw new Error(`Cannot append to ${this.id}.  Item is not an instance of Container`);
    container.parent = this.id;
    this.node.insertChild(container.node, this.node.getChildCount());
    this.#children.add(container.id);
    Container.getById(this.root).refresh();
  }

  destroy(container) {
    if (!container instanceof Container) throw new Error(`Cannot destroy to ${this.id}.  Item is not an instance of Container`);
    Logger.info(`Destroying ${container?.id} on ${this.id}`);
    this.node.removeChild(container.node);
    this.#children.delete(container.id);
    Container.getById(this.root).refresh();
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
}