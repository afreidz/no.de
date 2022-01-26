import Root from './root.js';
import Window from './window.js';
import Section from './section.js';
import Container, { ContainerConstructor, Geography, Gaps, Coord } from './container.js';

interface WorkspaceConstructor extends ContainerConstructor {
  strut?: Gaps,
  name?: string,
  screen: Geography,
};

export let count = 1;

export default class Workspace extends Container {
  constructor(opts: WorkspaceConstructor) {
    super(opts);
    this.isWorkspace = true;
    this.strut = opts.strut;
    this.screen = opts.screen;
    this.dir = opts.dir || 'ltr';
    this.name = opts.name || `${count}`;

    this.active = false;

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

  get next() {
    const all = Workspace.getAllOnScreen(this.screen);
    const ci = all.indexOf(this);
    return all[(ci+1)%all.length];
  }

  get nextOccupied() {
    if (!Workspace.getAllOnScreen(this.screen).some(ws => ws.hasWindows)) return;
    if (this.next.hasWindows) return this.next;
    return this.next.nextOccupied;
  }

  get hasWindows(): Boolean {
    return this.descendents.some(c => c instanceof Window);
  }

  get layoutChildren(): Array<Container> {
    const lc = super.layoutChildren.filter(c => c.layoutChildren.length);
    return lc.length === 0 ? super.children : lc;
  }

  get children(): Array<Container> {
    return [...super.children];
  }

  get isOnlyChild(): Boolean {
    return Workspace.getAllOnScreen(this.screen).length === 1;
  }

  append(c: Section, i?: number) {
    if (
      this.children.length === 0
      || this.children.every(c => c.children.length > 0)
    ) {
      super.append(c, i);
    } else {
      console.error('not every section has a child');
    }
  }
  
  appendTo(c: Root, i?: number) {
    super.appendTo(c, i);
  }

  remove(c: Section) {
    super.remove(c);
    c.deref();
  }

  static getAllActive(): Array<Workspace> {
    return this.getAll().filter(w => w.active);
  }
  
  static getAll(): Array<Workspace> {
    return Container.getByType(this);
  }

  static getAllOnScreen(s: Geography): Array<Workspace> {
    return this.getAll().filter(ws => (ws.screen === s));
  }

  static getByCoords(c: Coord): Workspace {
    const { x, y } = c;
    return this.getAll().find(c => {
      const geo = c.screen;
      return c.active
        && x >= geo.x
        && x <= (geo.x + geo.w)
        && y >= geo.y
        && y <= (geo.y + geo.h);
    });
  }

  static getByName(name: string): Workspace {
    return this.getAll().find(w => w.name == name);
  }
}
