import Root from './root.js';
import Section from './section.js';
import Container, { ContainerConstructor, Geography, Gaps, Coord } from './container.js';

interface WorkspaceConstructor extends ContainerConstructor {
  strut?: Gaps,
  name?: String,
  screen: number,
};

export let count = 1;

export default class Workspace extends Container {
  constructor(opts: WorkspaceConstructor) {
    super(opts);
    this.strut = opts.strut;
    this.screen = this.root.screens[opts.screen];
    this.isWorkspace = true;
    this.dir = opts.dir || 'ltr';
    this.name = opts.name || `${count}`;

    this.active = true;

    count += 1;
  }

  get geo(): Geography {
    return {
      x: this.screen.x + (this.strut?.l || 0),
      y: this.screen.y + (this.strut?.t || 0),
      w: this.screen.w - ((this.strut?.l + this.strut?.r) || 0),
      h: this.screen.h - ((this.strut?.t + this.strut?.b) || 0),
    }
  }

  set geo(g: Geography) {
    super.geo = g;
  }

  get active(): Boolean {
    return super.active;
  }

  set active(v: Boolean) {
    const all = Workspace.getAllOnScreen(this.screen);
    super.active = v;
    if (v === true) {
      all.forEach(ws => {
        if (ws !== this) ws.active = false;
      });
    }
  }

  get layoutChildren(): Array<Container> {
    const lc = super.layoutChildren.filter(c => c.layoutChildren.length);
    return lc.length === 0 ? super.children : lc;
  }

  get children(): Array<Container> {
    return [...super.children];
  }

  append(c: Section, i?: number) {
    if (
      this.children.length === 0
      || this.children.every(c => c.children.length > 0)
    ) {
      super.append(c, i);
    } else {
      throw new Error('not every section has a child');
    }
  }

  appendTo(c: Root, i?: number) {
    super.appendTo(c, i);
  }

  remove(c: Section) {
    if (this.children.length <= 1) {
      throw new Error('workspace must have 1 section');
    } else {
      super.remove(c);
      c.deref();
    }
  }

  static getAllActive(): Array<Workspace> {
    return this.getAll().filter(w => w.active);
  }
  
  static getAll(): Array<Workspace> {
    return Container.getByType(Workspace);
  }

  static getAllOnScreen(s: Geography): Array<Workspace> {
    return Workspace.getAll().filter(ws => ws.screen === s);
  }

  static getByCoords(c: Coord): Workspace {
    const { x, y } = c;
    return Workspace.getAll().find(c => {
      const geo = c.screen;
      return c.active
        && x >= geo.x
        && x <= (geo.x + geo.w)
        && y >= geo.y
        && y <= (geo.y + geo.h);
    });
  }
}
