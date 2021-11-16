const Cache = new Map();

class Container {
  #children;

  constructor(opts = {}) {
    // super();

    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
    this.dir = opts.dir;
    this.gaps = opts.gaps;
    this.#children = new Set;
    this.parent = opts.parent;
    this.ratios = opts.ratios;
    this.isRoot = !this.parent;
    this.id = opts.id || Cache.size + 1;

    //For Debugging
    this.emit = console.log;
    this.decorate = !!opts.decorate;

    if (this.parent) Container.getById(this.parent).append(this);

    Cache.set(this.id, this);
  }

  set geo(geo = {}) {
    this.x = geo.x;
    this.y = geo.y;
    this.w = geo.w;
    this.h = geo.h;
  }

  get geo() {
    return {
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
    }
  }

  get root() {
    if (this.isRoot) return this.id;
    return this.ancestors.find(a => Container.getById(a).isRoot);
  }

  get children() {
    return [...this.#children];
  }

  get ancestors() {
    if (!this.parent) return [];
    return [this.parent, Container.getById(this.parent).ancestors].flat();
  }

  get descendents() {
    if (this.children.length === 0) return [];
    return this.children.map(c => ([c, Container.getById(c).descendents].flat())).flat();
  }

  append(c) {
    if (!(c instanceof Container)) return this.emit('error', 'Appended node must be a <Container>');
    c.parent = this.id;
    this.#children.add(c.id);
  }

  remove(c) {
    if (!(c instanceof Container)) return this.emit('error', 'Appended node must be a <Container>');
    c.parent = null;
    this.#children.delete(c.id);
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
};

module.exports = Container;