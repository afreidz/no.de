import * as x11 from 'x11';
import iohook from 'iohook';
import Window from '../window';
import Section from '../section';
import Workspace from '../workspace';
import { exec } from 'child_process';
import IPCClient from '@no.de/ipc/src/client';
import Manager, { gaps, dir2 } from '../manager';
import Container, { Geography } from '../container';

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
  static client: any;
  static display: any;
  static xscreen: any;
  static ipc: any;
  desktop: number;

  static async setup() {
    const xd = await xInit();
    this.display = xd;
    this.client = xd.client;
    this.xscreen = xd.screen[0];
    this.ipc = new IPCClient(['wm']);
  }

  constructor(screens: Array<Geography>, geo: Geography) {
    super(screens,geo);
  }

  listen() {
    const ipc = XorgManager.ipc; 
    const client = XorgManager.client;
    const root = XorgManager.xscreen.root;

    client.ChangeWindowAttributes(root, masks.manager); 

    iohook.on('mousedown', e => (this.drag = { x: e.x, y: e.y }));
    iohook.on('mouseup', e => (this.drag = null));

    iohook.on('mousedrag', e => {
      if (this.active.win?.floating) {
        const x = this.active.win.geo.x - (this.drag.x - e.x); 
        const y = this.active.win.geo.y - (this.drag.y - e.y);
        const w = this.active.win.geo.w;
        const h = this.active.win.geo.h;
        this.drag = { x: e.x, y: e.y };
        this.active.win.geo = {x,y,w,h};
        client.MoveWindow(this.active.win.id, x,y);
      }
    })
    
    iohook.on('mousemove', e => {
      this.mouse = { x: e.x , y: e.y };
    });

    iohook.on('mouseclick', e => {
      if (e.clicks === 2) {
        this.toggleFloatWin(this.active.win);
      } else if (this.active?.win) {
        client.RaiseWindow(this.active.win.id);
      }
    });

    iohook.start();

    client.on('event', e => {
      const { wid, name } = e;
      console.log('Event', wid, name);
      switch (name) {
        case 'MapRequest': this.handleMap(wid); break;
        case 'EnterNotify': this.handleEnter(wid); break;
        case 'LeaveNotify': this.handleLeave(wid); break;
        case 'DestroyNotify': this.handleDestroy(wid); break;
      }
    });

    client.on('error', err => {
      console.error(err);
    })

    ipc.on('wm', (data) => {
      const { msg } = data;
      console.log('IPC', data);
      switch (msg) {
        case 'command':
          const { command } = data;
          switch (command) {
            case 'kill': this.kill(); break;
            case 'flip': this.flipDir(); break;
            case 'resize': this.resize(...data.args); break;
            case 'cycle-workspace': this.cycleWorkspace(); break;
            case 'toggle-fullscreen': this.toggleFullscreenWin(); break;
            case 'move-within': this.moveWithinWorkspace(data.args[0]); break;
            case 'moveto-workspace': this.moveToWorkspace(data.args[0]); break;
            case 'activate-workspace': this.activateWorkspace(data.args[0]); break;
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
    console.log('Kill', this.active.win?.id);
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

  activateWorkspace(name: String | number) {
    const ws = Workspace.getByName(`${name}`);
    if (!ws) return;
    ws.active = true;
    this.draw();
    this.sendUpdate();
  }

  cycleWorkspace() {
    if (!this.active?.ws) return;
    this.activateWorkspace(this.active.ws.next.name);
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

  moveToWorkspace(name: string | number) {
    const win = this.active.win;
    const ws = Workspace.getByName(`${name}`);
    if (!win || !ws) return;
    const sec = ws.children[ws.children.length-1];
    win.parent.remove(win);
    sec.append(win);
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
    const client = XorgManager.client;
    client.ChangeWindowAttributes(id, { borderPixel: 0x7f39fb });
    client.SetInputFocus(id);
    this.activeWin = Window.getById(id);
  }

  handleLeave(id: number) {
    const client = XorgManager.client;
    client.ChangeWindowAttributes(id, { borderPixel: 0x0e1018 });
    client.SetInputFocus(XorgManager.xscreen.root);
    this.activeWin = null;
  }

  async handleMap(id: number) {
    if(!!Window.getById(id)) return console.log('ID',id,'exists');
    const name = await this.getWinName(id);
    if (name === 'no.de-desktop') {
      this.createDesktop(id);
    } else {
      this.createWindow(id);
    }
  }

  handleDestroy(id: number) {
    const win = Window.getById(id);
    if (!win) return;
    this.destroyWindow(win);
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
    client.ChangeWindowAttributes(wid, { borderPixel: 0x0e1018, ...masks.window });
    this.draw(Window.getById(wid).workspace);
    this.split = false;
  }

  destroyWindow(win: Window){
    if (win.id === this.desktop) return;
    console.log('Destroy', win.id);
    const ws = win.workspace;
    super.destroyWindow(win);
    this.draw(ws);
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
      })
    });
  }

  draw(node?: Container) {
    const windows = (node || this.root).descendents.filter(d => d instanceof Window);
    const client = XorgManager.client;

    windows.forEach(win => {
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

