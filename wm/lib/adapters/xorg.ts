import * as x11 from 'x11';
import iohook from 'iohook';
import Window from '../window';
import Manager from '../manager';
import { exec } from 'child_process';
import IPCClient from '@no.de/ipc/src/client';
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
 
  static async setup() {
    const xd = await xInit();
    this.display = xd;
    this.client = xd.client;
    this.xscreen = xd.screen[0];
  }

  constructor(screens: Array<Geography>, geo: Geography) {
    super(screens,geo);
  }

  listen() {
    const ipc = new IPCClient(['wm']);
    const client = XorgManager.client;
    const root = XorgManager.xscreen.root;

    client.ChangeWindowAttributes(root, masks.manager); 

    iohook.on('mousemove', e => (this.mouse = { x: e.x , y: e.y }));
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
            case 'resize': this.resize(...data.args); break;
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
      }
    });
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

  handleEnter(id: number) {
    const client = XorgManager.client;
    client.ChangeWindowAttributes(id, { borderPixel: 0x7f39fb });
  }

  handleLeave(id: number) {
    const client = XorgManager.client;
    client.ChangeWindowAttributes(id, { borderPixel: 0x0e1018 });
  }

  handleMap(id: number) {
    if(!!Window.getById(id)) return console.log('ID',id,'exists');
    this.createWindow(id);
  }

  handleDestroy(id: number) {
    const win = Window.getById(id);
    if (!win) return;
    this.destroyWindow(win);
  }
  
  createWindow(wid: number) {
    super.createWindow(wid, this.split);

    const client = XorgManager.client;
    client.ConfigureWindow(wid, { borderWidth: 2 });
    client.ChangeWindowAttributes(wid, { borderPixel: 0x0e1018, ...masks.window });
    this.draw(Window.getById(wid).workspace);
    this.split = false;
  }

  destroyWindow(win: Window){
    console.log('Destroy', win.id);
    const ws = win.workspace;
    super.destroyWindow(win);
    this.draw(ws);
  }

  draw(node?: Container) {
    const windows = (node || this.root).descendents.filter(d => d instanceof Window);
    const client = XorgManager.client;

    windows.forEach(win => {
      console.log('Drawing wid', win.id);
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

