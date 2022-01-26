import * as x11 from 'x11';
import input from './input.js';
import IPCClient from '@no.de/ipc';
import { exec } from 'child_process';
import Window from '../../window.js';
import Section from '../../section.js';
import tokens from '../../tokens.json'; 
import Workspace from '../../workspace.js';
import Manager, { gaps, dir2 } from '../../manager.js';
import Container, { Geography } from '../../container.js';

const {
  EnterWindow,
  LeaveWindow,
  SubstructureNotify,
  SubstructureRedirect,
} = x11.eventMask;


const masks = {
  manager: { eventMask: SubstructureNotify | SubstructureRedirect },
  window: { eventMask: EnterWindow | LeaveWindow },
}

type Dir = 'n' | 's' | 'e' | 'w';

function xInit(): Promise<any> {
  return new Promise((resolve, reject) => {
    x11.createClient((err, display) => {
      if (err) return reject(err);
      return resolve(display);
    });
  });
}

export default class XorgManager extends Manager {
  static ipc: any;
  static client: any;
  static display: any;
  static xscreen: any;
  static borderColor1: any;
  static borderColor2: any;
  desktop: number
  
  static async setup() {
    const xd = await xInit();
    this.display = xd;
    this.client = xd.client;
    this.xscreen = xd.screen[0];
    this.ipc = new IPCClient(['wm']);
    this.borderColor1 = tokens.color.black['0'].replace('#','0x');
    this.borderColor2 = tokens.color.highlights.blue.replace('#','0x');
  }

  constructor(screens: Array<Geography>, geo: Geography) {
    super(screens,geo);
  }

  listen() {
    const ipc = XorgManager.ipc; 
    const client = XorgManager.client;
    const root = XorgManager.xscreen.root;

    client.ChangeWindowAttributes(root, masks.manager); 
    
    const inputListener = input();
    inputListener.on('drag', drag => (this.drag = drag));
    inputListener.on('mouse', mouse => (this.mouse = mouse));
    inputListener.on('float', () => this.toggleFloatWin(this.active.win));
    inputListener.on('raise', () => {
      if (this.active.win?.floating) client.RaiseWindow(this.active.win?.id);
    });
    inputListener.on('move', e => {
      const target = this.active.win;
      if (!target?.floating) return;
      const x = target.geo.x - (this.drag.x - e.x); 
      const y = target.geo.y - (this.drag.y - e.y);
      const w = target.geo.w;
      const h = target.geo.h;
      target.geo = {x,y,w,h};
      this.drag = { x: e.x, y: e.y };
      client.MoveWindow(target.id, x,y);
      const ws = Workspace.getByCoords({ x, y });
      if (target.workspace !== ws) console.log('move', target.id, 'to', ws.id);
      if (target.workspace !== ws) this.moveToWorkspace(ws.name);
    });
    inputListener.on('resize', e => {
      const target = this.active.win;
      if (!target?.floating) return;
      const x = target.geo.x; 
      const y = target.geo.y;
      const w = target.geo.w - (this.drag.x - e.x);
      const h = target.geo.h - (this.drag.y - e.y);
      target.geo = {x,y,w,h};
      this.drag = { x: e.x, y: e.y };
      client.ResizeWindow(target.id, w,h);
    });

    client.on('event', async e => {
      const { wid, name } = e;
      console.log('Event', wid, name);
      switch (name) {
        case 'EnterNotify': this.handleEnter(wid); break;
        case 'LeaveNotify': this.handleLeave(wid); break;
        case 'MapRequest': await this.handleMap(wid); break;
        case 'DestroyNotify': this.handleDestroy(wid); break;
      }
    });

    client.on('error', err => {
      console.error(err);
    })

    ipc.on('wm', (data) => {
      const { msg } = data;
      switch (msg) {
        case 'command':
          const { command } = data;
          switch (command) {
            case 'kill': this.kill(); break;
            case 'flip': this.flipDir(); break;
            case 'resize': this.resize(...data.args); break;
            case 'remove-workspace': this.removeWorkspace(); break;
            case 'add-workspace': this.addWorkspace(null, true); break;
            case 'toggle-fullscreen': this.toggleFullscreenWin(); break;
            case 'cycle-workspace': this.cycleWorkspace(data.args[0]); break;
            case 'move-within': this.moveWithinWorkspace(data.args[0]); break;
            case 'exec': 
              if (data.args[1] === 'split') {
                this.split = true;
                this.run(data.args[0]);
              } else {
                this.run(data.args.join(' ')); 
              }
            break;
          }
        break;
        case 'query': this.sendUpdate(); break; 
      }
    });
  }

  sendUpdate(){
    const ipc = XorgManager.ipc;
    const workspaces = Workspace.getAll().map(ws => ws.serialize());
    ipc.send('wm', { msg: 'update', workspaces, screens: this.root.screens });
  }

  run(cmd: string) {
    exec(cmd);
  }

  kill() {
    if (!this.active.win?.id) return;
    XorgManager.client.DestroyWindow(this.active.win.id);
  }

  resize(...args) {
    super.resize(...args, this.active.ws.id);
    this.draw(this.active.ws);
  }

  flipDir(ws?: Workspace) {
    super.flipDir(ws);
    this.draw(ws);
    this.sendUpdate();
  }

  addWorkspace(target: Geography | null = null, activate: Boolean = false): Workspace {
    const screen = target ? target : this.root.getScreenByCoords(this.mouse);
    if (!screen) { 
      console.error('no screen to add ws'); 
      return; 
    }
    const ws = super.addWorkspace(screen);
    if (activate) this.activateWorkspace(ws);
    return ws;
  }

  removeWorkspace(): void {
    super.removeWorkspace(this.active.ws);
    this.draw();
    this.sendUpdate();
  }

  activateWorkspace(ws: Workspace) {
    if (!ws) return console.error(`no ws ${ws}`);
    const all = Workspace.getAllOnScreen(ws.screen);
    all.forEach(ws => (ws.active = false));
    ws.active = true;
    this.draw();
    this.sendUpdate();
  }

  cycleWorkspace(includeEmpty: Boolean = false) {
    if (!this.active?.ws) return;
    if (!includeEmpty && !this.active.ws.nextOccupied) return;
    this.activateWorkspace(
      includeEmpty 
      ? this.active.ws.next
      : this.active.ws.nextOccupied
    );
  }

  toggleFloatWin(win: Window): void {
    const target = win || this.active.win;
    if (!target) return;

    const client = XorgManager.client;
    super.toggleFloatWin(target);
    this.draw();
  }

  toggleFullscreenWin(win?: Window) {
    const target = win || this.active.win;
    if (!target) return;
    
    const client = XorgManager.client;
    super.toggleFullscreenWin(target);
    this.draw();
    client.RaiseWindow(target.id);

    const borderWidth = target.fullscreen ? 0 : 1;
    client.ConfigureWindow(target.id, { borderWidth });
  }

  moveToWorkspace(name: string, win?: Window) {
    const target = win || this.active.win;
    const ws = Workspace.getByName(name);
    if (!target || !ws) return;
    const sec = ws.children[ws.children.length-1];
    target.parent.remove(target);
    sec.append(target);
    this.draw();
  }

  moveWithinWorkspace(dir: Dir) {
    const win = this.active.win;
    if (!win) return;
    
    let target: Container;
    let index: number | null;

    if (win.workspace.dir === 'ltr') {
      switch(dir) {
        case 'n':
          target = win.workspace.children[win.workspace.children.indexOf(win.parent) - 1];
          if (!target) break;
          index = null;
        break;
        case 's':
          target = win.workspace.children[win.workspace.children.indexOf(win.parent) + 1];
          if (!target) {
            const sec = new Section({ dir: dir2, gaps });
            win.workspace.append(sec);
            target = sec;
          }
          index = null;
        break;
        case 'e':
          target = win.parent;
          index = win.parent.children.indexOf(win) === win.parent.children.length
            ? win.parent.children.length
            : win.parent.children.indexOf(win) + 1;
        break;
        case 'w':
          target = win.parent;
          index = win.parent.children.indexOf(win) === 0
            ? 0
            : win.parent.children.indexOf(win) - 1;
        break;
      }
    } else {
      switch(dir) {
        case 'w':
          target = win.workspace.children[win.workspace.children.indexOf(win.parent) - 1];
          if (!target) break;
          index = null;
        break;
        case 'e':
          target = win.workspace.children[win.workspace.children.indexOf(win.parent) + 1];
          if (!target) {
            const sec = new Section({ dir: dir2, gaps });
            win.workspace.append(sec);
            target = sec;
          }
          index = null;
        break;
        case 's':
          target = win.parent;
          index = win.parent.children.indexOf(win) === win.parent.children.length
            ? win.parent.children.length
            : win.parent.children.indexOf(win) + 1;
        break;
        case 'n':
          target = win.parent;
          index = win.parent.children.indexOf(win) === 0
            ? 0
            : win.parent.children.indexOf(win) - 1;
        break;
      }
    }
    if (!target) return;
    win.parent.remove(win);
    target.append(win, index);
    this.draw(win.workspace);
  }

  handleEnter(id: number) {
    if (!Window.exists(id)) return;
    const client = XorgManager.client;
    client.ChangeWindowAttributes(id, { borderPixel: XorgManager.borderColor2 });
    client.SetInputFocus(id);
    this.activeWin = Window.getById(id);
  }

  handleLeave(id: number) {
    if (!Window.exists(id)) return;
    const client = XorgManager.client;
    client.ChangeWindowAttributes(id, { borderPixel: XorgManager.borderColor1 });
    client.SetInputFocus(XorgManager.xscreen.root);
    this.activeWin = null;
  }

  async handleMap(id: number) {
    const name = await this.getWinName(id);
    const or = await this.getOverrideRedirect(id);

    if (Window.exists(id)) return;

    if (name === 'no.de-desktop') {
      this.createDesktop(id);
    } else if (or) {
      XorgManager.client.MapWindow(id);
    } else {
      this.createWindow(id);
    }
  }

  handleDestroy(id: number) {
    if (Window.exists(id)) this.destroyWindow(Window.getById(id));
  }

  createDesktop(wid: number) {
    this.desktop = wid;
    const client = XorgManager.client;
    const { x, y, w: width, h: height } = this.root.geo;
    client.ConfigureWindow(wid, { x, y, width, height});
    client.MapWindow(wid);
    client.LowerWindow(wid);
  }
  
  createWindow(wid: number) {
    super.createWindow(wid, this.split);

    const client = XorgManager.client;
    client.ConfigureWindow(wid, { borderWidth: 1 });
    client.ChangeWindowAttributes(wid, { borderPixel: XorgManager.borderColor1, ...masks.window });
    this.draw(Window.getById(wid).workspace);
    this.sendUpdate();
    this.split = false;
  }

  destroyWindow(win: Window){
    if (win.id === this.desktop) return;
    const ws = win.workspace;
    super.destroyWindow(win);
    this.draw(ws);
    this.sendUpdate();
  }

  async getOverrideRedirect(wid: number): Promise<Boolean> {
    const client = XorgManager.client;
    return new Promise(r => {
      client.GetWindowAttributes(wid, (err, attrs) => {
        if (err) {
          console.error(err);
          r(null);
        } else {
          if (attrs?.overrideRedirect === 1) return r(true);
          return r(false);
        }
      });
    });
  }

  getWinName(wid: number): Promise<string| null> {
    const client = XorgManager.client;
    const { WM_NAME, STRING} = client.atoms;

    return new Promise(r => {
      client.GetProperty(0, wid, WM_NAME, STRING, 0, 10000000, (err, prop) => {
        if (err) {
          console.error(err);
          r(null);
        } else {
          const val = prop.data.toString();
          r(val);
        } 
      });
    });
  }

  draw(node?: Container) {
    const windows = (node || this.root).descendents.filter(d => d instanceof Window);
    const client = XorgManager.client;

    windows.forEach(win => {
      if (!Window.exists(win.id)) return; // this is weaksauce :(
      if (!win.workspace.active) {
        client.UnmapWindow(win.id);
        win.mapped = false;
      } else {
        client.MoveResizeWindow(win.id, win.geo.x, win.geo.y, win.geo.w, win.geo.h);
        if (!win.mapped) {
          client.MapWindow(win.id);
          win.mapped = true;
        }
      }
    });
  }
}

