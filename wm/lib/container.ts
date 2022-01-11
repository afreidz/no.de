export const Cache = new Map<number, Container>();

export type Dir = 'ltr' | 'ttb';

export type Coord = {
  x: number,
  y: number,
};

export type Geography = {
  i?: number,
  x: number,
  y: number,
  w: number,
  h: number,
};

export interface ContainerConstructor {
  dir?: Dir,
  id?: number,
  gaps?: Gaps,
  geo?: Geography,
  parent?: Container,
};

const defaultGeo: Geography = {
  x: 0,
  y: 0,
  w: 1,
  h: 1,
};

export type Gaps = null | {
  t: number,
  b: number,
  l: number,
  r: number,
};

export default class Container {
  dir?: Dir;
  id: number;
  gaps: Gaps;
  strut?: Gaps;
  name?: String;
  ratio: number;
  isWin: Boolean;
  #geo: Geography;
  isRoot: Boolean;
  mapped?: Boolean;
  parent: Container;
  #active?: Boolean;
  screen?: Geography;
  #floating?: Boolean;
  isWorkspace: Boolean;
  #fullscreen?: Boolean;
  #children: Set<Container>;
  screens?: Array<Geography>;

  constructor(opts: ContainerConstructor = {}) {
    this.ratio = 1;
    this.isWin = false;
    this.isRoot = false;
    this.gaps = opts.gaps;
    this.isWorkspace = false;
    this.dir = opts.dir || 'ltr';
    this.#geo = opts?.geo || defaultGeo;
    this.id = opts?.id || Cache.size + 1;
    this.#children = new Set();

    Cache.set(this.id, this);
  }

  get geo(): Geography {
    if (this.fullscreen) {
      return this.workspace.screen;
    } else {
      return this.#geo;
    }
  }

  set geo(g: Geography) {
    this.#geo = g;
  }

  get floating(): Boolean {
    return this.#floating;
  }

  set floating(v: Boolean) {
    this.#floating = v;
    if (v) {
      const floaters = this.parent.children.filter(c => c.floating);
      const ox = this.workspace.geo.x + (10 * floaters.length);
      const oy = this.workspace.geo.y + (10 * floaters.length);
      this.geo = { x: ox, y: oy, w: 800, h: 600 };
    }
    if (!this.isRoot) layout(this.workspace);
  }

  get fullscreen(): Boolean {
    return this.#fullscreen;
  }

  set fullscreen(v: Boolean) {
    this.#fullscreen = v;
    if (!this.isRoot) layout(this.workspace);
  }

  get gappedGeo(): Geography {
    const gapAdjusted = { ...this.geo };

    gapAdjusted.y += this.gaps?.t || 0;
    gapAdjusted.x += this.gaps?.l || 0;
    gapAdjusted.w -= (this.gaps?.l + this.gaps?.r) || 0;
    gapAdjusted.h -= (this.gaps?.t + this.gaps?.b) || 0;

    return gapAdjusted;
  }

  get active(): Boolean {
    return this.#active;
  }

  set active(v: Boolean) {
    this.#active = v;
  }

  get childrenIds(): Array<number> {
    return [...this.#children].map(c => c.id);
  }

  get children(): Array<Container> {
    return [...this.#children];
  }

  get next(): Container {
    const all = Container.getAll();
    const ci = all.indexOf(this);
    return all[(ci+1)%all.length];
  }

  get descendents(): Array<Container> {
    if (this.children.length === 0) return [];
    return this.children.map(c => ([c, c.descendents].flat())).flat();
  }

  get layoutChildren(): Array<Container> {
    return [...this.#children].filter(c => (!c.floating && !c.fullscreen));
  }

  get ancestors(): Array<Container> {
    if (!this.parent) return [];
    return [this.parent, this.parent.ancestors].flat();
  }

  get workspace() {
    if (this.isWorkspace) return this;
    return this.ancestors.find(a => a.isWorkspace);
  }

  get root() {
    if (this.isRoot) return this;
    return this.ancestors.find(a => a.isRoot)
      || Container.getAll().find(c => c.isRoot);
  }

  serialize() {
    return {
      id: this.id,
      dir: this.dir,
      name: this.name,
      active: this.active,
      screen: this.screen?.i,
    }
  }

  update() {
    layout(this.workspace);
  }

  deref() {
    this.children.forEach(c => c.deref());
    Cache.delete(this.id);
  }

  append(c: Container, i?: number) {
    c.parent = this;
    if (i || i === 0) {
      const kids = [...this.children];
      kids.splice(i, 0, c);
      this.#children = new Set(kids);
    } else {
      this.#children.add(c);
    }
    if (!this.isRoot) layout(this.workspace);
  }

  appendTo(c: Container, i?: number) {
    c.append(this, i);
  }

  remove(c: Container) {
    c.parent = null;
    this.#children.delete(c);
    if (!this.isRoot) layout(this.workspace);
  }

  static getById(id): Container {
    return Cache.get(id);
  }

  static getAll(): Array<Container> {
    return [...Cache.values()];
  }

  static getByType(type): Array<Container> {
    return [...Cache.values()].filter(c => (c instanceof type));
  }

  static getByCoords(c: Coord): Container {
    const { x, y } = c;
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

function layout(n) {
  const p = n.parent;
  let geo: Geography = { x: null, w: null, h: null, y: null };

  if (p.isRoot) {
    geo.x = n.geo.x;
    geo.y = n.geo.y;
    geo.w = n.geo.w;
    geo.h = n.geo.h;
  } else {
    const size1 = p.dir === 'ttb' ? 'w' : 'h';
    const size2 = p.dir === 'ttb' ? 'h' : 'w';
    const pos1 = p.dir === 'ttb' ? 'y' : 'x';
    const pos2 = p.dir === 'ttb' ? 'x' : 'y';
    const gap1 = p.dir === 'ttb' ? 'l' : 't';
    const gap2 = p.dir === 'ttb' ? 'r' : 'b';
    const gap3 = p.dir === 'ttb' ? 'b' : 'r';
    const gap4 = p.dir === 'ttb' ? 't' : 'l';

    const ma = (p.geo[size1] / p.layoutChildren.length) * n.ratio;
    const prev = p.layoutChildren[p.layoutChildren.indexOf(n) - 1];

    geo[size1] = ma - ((p.gaps?.[gap1] + p.gaps?.[gap2]) || 0);
    geo[pos1] = p.geo[pos1] + (p.gaps?.[gap3] || 0);
    geo[size2] = p.geo[size2] - ((p.gaps?.[gap3] + p.gaps?.[gap4]) || 0);
    geo[pos2] = !!prev
      ? (prev.geo[size1] + prev.geo[pos2]) + ((p.gaps?.[gap1] + p.gaps?.[gap2]) || 0)
      : p.geo[pos2] + (p.gaps?.[gap1] || 0);
  }

  n.geo = geo;

  const ratioCheck = n.layoutChildren.reduce((a, b) => (a += b.ratio), 0);
  if (ratioCheck !== n.layoutChildren.length) {
    const diff = n.layoutChildren.length - ratioCheck;
    n.layoutChildren.forEach(c => {
      c.ratio += diff / n.layoutChildren.length;
    });
  }

  n.layoutChildren.forEach(c => layout(c));
}
