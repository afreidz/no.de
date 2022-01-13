import Root from './root';
import Window from './window';
import Section from './section';
import Workspace from './workspace';
import Container, { Gaps, Dir, Geography } from './container';

const dir1: Dir = 'ltr';
const strut: Gaps = { t: 40, b: 10, l: 10, r: 10 };
export const dir2: Dir = dir1 === 'ltr' ? 'ttb' : 'ltr';
export const gaps: Gaps = { t: 10, b: 10, l: 10, r: 10 };

export type Mouse = {
  x: number,
  y: number,
} | null;

export type Axis = 'n' | 's' | 'e' | 'w';

export default class Manager {
  root: Root;
  drag: Mouse;
  mouse: Mouse;
  ctrl: Boolean;
  meta: Boolean;
  split: Boolean;
  activeWin: Window | null;

  constructor(screens: Array<Geography>, geo: Geography) {
    this.drag = null;
    this.meta = false;
    this.ctrl = false;
    this.split = false;
    this.activeWin = null;
    this.mouse = { x: 0, y: 0 };
    this.root = new Root({ screens, geo });
  }
  
  get active() {
    const win: Window = this.activeWin || Window.getByCoords(this.mouse);
    const ws: Workspace = win?.workspace
      || Workspace.getByCoords(this.mouse)
      || Workspace.getAll().find(ws => ws.active);
    const sec: Section = win?.parent || ws.children[ws.children.length-1];

    return {
      win,
      sec,
      ws,
    }
  }

  draw() {
    //noop: use adapters
  }

  addWorkspace(screen: number = 0, name: String | null = null) {
    const ws = new Workspace({ dir: dir1, screen, strut, name });
    const sc = new Section({ dir: dir2, gaps });
    this.root.append(ws);
    ws.append(sc);
  }

  run(cmd) {
    //noop: use adapters
  }

  resize(axis: Axis = 'n', px: number = 1, ...rest: any) {
    if (!this.active.win) return;
    const container: Container = this.active.win.workspace.dir === 'ltr'
      ? (axis === 'n' || axis === 's')
        ? this.active.sec
        : this.active.win
      : (axis === 'n' || axis === 's')
        ? this.active.win
        : this.active.sec;
    const geoa = container.workspace.dir === 'ltr' ? 'h' : 'w';

    const ratio = container.ratio || 1;
    const newRatio = ((container.geo.h + px) * ratio) / container.geo[geoa];

    container.ratio = newRatio;
    container.update();
  }

  toggleFloatWin(win: Window) {
    const target = win || this.active.win;
    if (!target) throw new Error('no window to float');
    target.floating = !target.floating;
  }

  toggleFullscreenWin(win?: Window) {
    const target = win || this.active.win;
    if (!target) throw new Error('no window to fullscreen');
    target.fullscreen = !target.fullscreen;
  }

  moveFloatingWindow(win: Window) {

  }

  resizeFloatingWindow(win: Window) {

  }

  flipDir(ws?: Workspace) {
    const target = ws || this.active.ws;
    if (!target) throw new Error('no workspace to flip');
    target.dir = target.dir === 'ltr' ? 'ttb' : 'ltr';
    target.children.forEach(c => (c.dir = target.dir === 'ttb' ? 'ltr' : 'ttb'));
    target.update();
  }

  getWinClass(wid) {
    // const { WM_CLASS, STRING } = this.client.atoms;
    // return new Promise(r => {
    //   this.client.GetProperty(0, wid, WM_CLASS, STRING, 0, 10000000, (err, prop) => {
    //     if (err) return console.error(err);
    //     const val = prop.data.toString();
    //     r(val);
    //   });
    // });
  }

  createWindow(wid: number = null, split?: Boolean) {
    const ws = this.active.ws;

    let sc: Section;
    if (this.split || split) {
      sc = new Section({ dir: dir2, gaps });
      ws.append(sc);
    } else {
      sc = this.active.sec || ws.children[0];
    }

    const win = new Window({ id: wid });
    sc.append(win);
  }

  destroyWindow(win: Window) {
    if (win) {
      win.parent.remove(win);
      win.deref();
    }
  }

  setType(wid) {
    // const name = await this.getWinName(wid);

    // if (name.includes(`desktop_${this.id}`)) {
    //   this.desktop = wid;
    //   this.specialWids.push(wid);
    // }

    // if (name.includes(`brain_${this.id}`)) {
    //   this.brain = wid;
    //   this.specialWids.push(wid);
    // }
  }
}
