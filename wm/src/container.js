const Cache = new Map();

class Container {
  #children;
  #ratioCache;

  constructor(parent, id) {
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
    this.parent = parent;
    this.#ratioCache = null;
    this.#children = new Set;
    this.id = id || Cache.size + 1;
    Cache.set(this.id, this);

    if (this.parent) Container.getById(this.parent).append(this);
  }

  get ratio() {
    const p = Container.getById(this.parent);
    if (p.children.length === 1) return 1;
    return this.#ratioCache || 1;
  }

  set ratio(n) {
    this.#ratioCache = +n;
  }

  set ratioCache(n) {
    this.#ratioCache = n;
  }

  get isRoot() {
    return !this.parent;
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

  append(c, i = null) {
    if (!(c instanceof Container)) return this.emit('error', 'Appended node must be a <Container>');
    c.parent = this.id;
    if (i !== null) {
      const kids = this.children;
      kids.splice(i, 0, c.id);
      this.#children = new Set(kids);
    } else {
      this.#children.add(c.id);
    }
  }

  remove(c) {
    if (!(c instanceof Container)) return this.emit('error', 'Removed node must be a <Container>');
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