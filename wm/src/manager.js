const X11 = require('./x11.js');
const ioHook = require('iohook');
const { join } = require('path');
const Float = require('./float.js');
const Window = require('./window.js');
const Wrapper = require('./splitter.js');
const { exec } = require('child_process');
const updateLayout = require('./layout.js');
const getScreenInfo = require('./screen.js');
const IPCClient = require('no.de-ipc/client');
const { Workspace } = require('./workspace.js');

class Manager {
  constructor(opts = { dbug: false, id: +new Date }) {
    this.drag = null;
    this.brain = null;
    this.split = false;
    this.desktop = null;
    this.mouse = [0, 0];
    this.workspaces = [];
    this.debug = opts.debug;
    this.brainActive = false;
    this.id = opts.id || +new Date;
    this.ipc = new IPCClient(['wm']);

    this.ipc.on('wm', data => {
      // console.log(data);
      try {
        switch (data.msg) {
          case 'query':
            if (data.type === 'workspaces') {
              this.ipc.send('wm', { message: 'workspaces', workspaces: this.workspaces.map(ws => ws.serialize()) });
            }
            break;
          case 'command':
            switch (data.command) {
              case 'activate-workspace': this.activateWorkspace(...data.args); break;
              case 'change-horizontal': this.changeHorizontal(...data.args); break;
              case 'change-vertical': this.changeVertical(...data.args); break;
              case 'toggle-brain':
                const arg = data.args?.[0]
                  ? (data.args[0] == 'true')
                  : null;
                this.toggleBrain(arg);
                break;
              case 'add-workspace': this.addWorkspace(...data.args); break;
              case 'cycle-workspace': this.cycleWorkspace(); break;
              case 'toggle-split': this.split = !this.split; break;
              case 'toggle-float': this.toggleFloat(); break;
              case 'exec': this.exec(...data.args); break;
              case 'flip': this.flip(); break;
              case 'kill': this.kill(); break;
            }
            if (data.command === 'activate-workspace') {
              this.activateWorkspace(data.args[0]);
            }
            break;
        }
      } catch (err) {
        console.log(err);
      }
    });

    return this.init();
  }

  async init() {
    const x11 = await (new X11());
    const { client, display } = x11;
    const screens = await getScreenInfo();

    this.x11 = x11;
    this.client = client;
    this.screens = screens;
    this.xscreen = display.screen[0];

    if (!this.debug) {
      console.log('info', `Initializing Window Manager...`);
      client.ChangeWindowAttributes(this.xscreen.root, X11.eventMasks.manager, e => console.log('error', e.message));
      console.log('info', `${this.xscreen.root} is now the window manager`);
    }

    ioHook.on('mousedrag', e => {
      if (e.shiftKey && e.metaKey) {
        this.resizeCurrent(e.x, e.y);
      } else if (e.metaKey && !e.shiftKey) {
        this.moveCurrent(e.x, e.y)
      }
    });
    ioHook.on('mousemove', e => (this.mouse = [e.x, e.y]));
    ioHook.on('mouseclick', e => this.raiseCurrent());
    ioHook.start();

    await this.listen();
    await this.ipc.send('wm', { msg: 'initialized' });
    return this;
  }

  addWorkspace(screen = 0, title) {
    const sdims = this.screens[screen];
    const geo = {
      y: sdims.y + 40,
      h: sdims.h - 45,
      x: sdims.x + 5,
      w: sdims.w - 10,
    };
    const ws = new Workspace(geo, screen, title);
    new Wrapper({ parent: ws.id });
    new Float({ parent: ws.id });
    this.workspaces.push(ws);
    this.activateWorkspace(this.workspaces.length - 1);
    this.ipc.send('wm', { message: 'workspace-added', workspaces: this.workspaces.map(ws => ws.serialize()) });
  }

  activateWorkspace(n = 0) {
    const ws = this.workspaces[n];
    const others = Workspace.getByScreen(ws.screen).filter(w => ws.id !== w.id);
    ws.active = true;
    this.layout(ws.id);
    others.forEach(ws => this.layout(ws.id));
    this.ipc.send('wm', { message: 'workspace-activated', workspaces: this.workspaces.map(ws => ws.serialize()) });
  }

  cycleWorkspace() {
    const ws = this.getWorkspaceByCoords(...this.mouse);
    const screenws = Workspace.getByScreen(ws.screen);
    const ci = screenws.indexOf(ws);
    const n = ci + 1 >= screenws.length ? 0 : ci + 1;
    const nextws = screenws[n];
    const ni = this.workspaces.indexOf(nextws);
    return this.activateWorkspace(ni);
  }

  toggleFloat(wid) {
    const win = !!wid
      ? Window.getById(wid)
      : (this.focusedWindow
        || Window.getByCoords(...this.mouse));

    if (!win) return;

    win.floating = !win.floating;
    this.layout(win.root);

    if (win.floating) {
      this.client.RaiseWindow(win.id);
      this.client.MoveWindow(win.id, win.x, win.y);
      this.client.ResizeWindow(win.id, win.w, win.h);
    }
  }

  exec(cmd) {
    exec(cmd);
  }

  kill() {
    if (!this.focusedWindow || this.focusedWindow.id === this.brain) return;
    this.client.DestroyWindow(this.focusedWindow.id);
  }

  layout(ws) {
    updateLayout(ws);

    const workspace = Workspace.getById(ws);
    const windows = workspace.descendents.filter(d => !!(Window.getById(d) instanceof Window));
    const floaters = workspace.floatContainer.children;

    [...windows, ...floaters].forEach(w => {
      const win = Window.getById(w);
      if (!workspace.active) {
        this.client.UnmapWindow(win.id);
        win.mapped = false;
      } else {
        if (!win.floating) {
          this.client.MoveWindow(win.id, win.geo.x, win.geo.y);
          this.client.ResizeWindow(win.id, win.geo.w, win.geo.h);
        }
        if (!win.mapped) {
          win.mapped = true;
          this.client.MapWindow(win.id);
        }
      }
    });
  }

  changeVertical(px = 1) {
    const ws = this.focusedWindow
      ? Workspace.getById(this.focusedWindow.root)
      : this.getWorkspaceByCoords(...this.mouse);

    const wrap = this.focusedWindow
      ? Wrapper.getById(this.focusedWindow.parent)
      : ws.getWrapperByCoords(...this.mouse);

    if (!wrap) return;

    const idx = ws.children.indexOf(wrap.id);
    const existingRatio = ws.ratios[idx];
    const newRatio = ((wrap.h + px) * existingRatio) / wrap.h;
    const ratioDelta = newRatio - existingRatio;
    const spreadRatio = ratioDelta / (ws.children.length - 1);

    ws.ratios.forEach((r, i) => {
      if (i === idx) return ws.ratios[i] = newRatio;
      return ws.ratios[i] = ws.ratios[i] - spreadRatio;
    });

    this.layout(ws.id);
  }

  changeHorizontal(px = 1) {
    const wrap = this.focusedWindow
      ? Wrapper.getById(this.focusedWindow.parent)
      : this.getWorkspaceByCoords(...this.mouse);

    const win = this.focusedWindow || Window.getByCoords(...this.mouse);

    if (!win) return;

    const idx = wrap.children.indexOf(win.id);
    const existingRatio = wrap.ratios[idx];
    const newRatio = ((win.w + px) * existingRatio) / win.w;
    const ratioDelta = newRatio - existingRatio;
    const spreadRatio = ratioDelta / (wrap.children.length - 1);

    wrap.ratios.forEach((r, i) => {
      if (i === idx) return wrap.ratios[i] = newRatio;
      return wrap.ratios[i] = wrap.ratios[i] - spreadRatio;
    });

    this.layout(wrap.parent);
  }

  flip() {
    const ws = Workspace.getByCoords(...this.mouse)
    if (!ws) return;

    ws.flip();
    this.layout(ws.id);
    this.ipc.send('wm', { message: 'layout-flip', workspaces: this.workspaces.map(ws => ws.serialize()) });
  }

  toggleBrain(forceOpen = null) {
    console.log('Brain forceOpen', forceOpen);
    if (!this.brain) return;
    if ((forceOpen === null && this.brainActive) || forceOpen === false) {
      this.client.UnmapWindow(this.brain);
      this.brainActive = false;
    } else if (forceOpen === true || (forceOpen === null && !this.brainActive)) {
      const ws = this.getWorkspaceByCoords(...this.mouse);
      const screen = this.screens[ws.screen];
      this.client.MoveWindow(this.brain, screen.x, screen.y);
      this.client.ResizeWindow(this.brain, screen.w, screen.h);
      this.client.MapWindow(this.brain);
      this.client.RaiseWindow(this.brain);
      this.client.SetInputFocus(this.brain);
      this.brainActive = true;
    }
  }

  getWinName(wid) {
    const { WM_NAME, STRING } = this.client.atoms;
    return new Promise(r => {
      this.client.GetProperty(0, wid, WM_NAME, STRING, 0, 10000000, (err, prop) => {
        if (err) return console.error('error', err);
        const val = prop.data.toString();
        r(val);
      });
    });
  }

  getWinClass(wid) {
    const { WM_CLASS, STRING } = this.client.atoms;
    return new Promise(r => {
      this.client.GetProperty(0, wid, WM_CLASS, STRING, 0, 10000000, (err, prop) => {
        if (err) return console.error('error', err);
        const val = prop.data.toString();
        r(val);
      });
    });
  }

  async handleMap(wid) {
    const name = await this.getWinName(wid);
    console.log('info', `Map Request for ${wid}:${name}`);
    await this.setType(wid);
    console.log('Special WIDS:', this.brain, this.desktop);

    if (this.desktop === wid) {
      console.log(this.xscreen.pixel_width, this.xscreen.pixel_height);
      this.client.MoveWindow(wid, 0, 0);
      this.client.ResizeWindow(wid, this.xscreen.pixel_width, this.xscreen.pixel_height);
      this.client.MapWindow(wid);
      return;
    }

    this.client.ChangeWindowAttributes(wid, X11.eventMasks.window);

    if (this.brain === wid) return;
    if (!!Window.getById(wid)) return;

    let ws = Workspace.getById(this.focusedWindow?.root);

    if (!ws) ws = this.getWorkspaceByCoords(...this.mouse);
    if (!ws) ws = this.workspaces[0];

    let wrapper = Wrapper.getById(this.focusedWindow?.parent);

    if (!wrapper) wrapper = ws.getWrapperByCoords(...this.mouse);
    if (!wrapper) wrapper = Wrapper.getById(ws.children[ws.children.length - 1] || ws.children[0]);
    if (this.split && wrapper.children.length !== 0) wrapper = new Wrapper({ parent: ws.id });

    const win = new Window({ parent: wrapper.id, id: wid });
    const wmclass = await this.getWinClass(win.id);

    if (wmclass.toLowerCase().includes('nautilus')) {
      this.toggleFloat(win.id);
    } else {
      this.layout(ws.id);
    }

    this.client.MapWindow(wid);

    if (this.brainActive && this.brain) this.client.RaiseWindow(this.brain);
  }

  handleDestroy(wid) {
    console.log('info', `Destroy Request for ${wid}`);
    const win = Window.getById(wid);
    if (!win) return;

    const wrap = Wrapper.getById(win.parent);
    const ws = Workspace.getById(win.root);
    wrap.remove(win);
    win.deref();
    if (wrap.children.length === 0 && ws.children.length > 1) ws.remove(wrap);
    this.layout(ws.id);
    this.focusedWindow = Window.getByCoords(...this.mouse);
  }

  handleEnter(wid) {
    console.log('info', `Mouse Enter Notify for ${wid}`);
    this.focusedWindow = Window.getById(wid);
    this.client.SetInputFocus(wid);
  }

  handleExit(wid) {
    console.log('info', `Mouse Exit Notify for ${wid}`);
    this.focusedWindow = null;
    this.client.SetInputFocus(this.xscreen.root);
  }

  moveCurrent(x, y) {
    if (!this.focusedWindow?.floating) return;
    if (!this.drag) this.drag = { x, y };
    const win = this.focusedWindow;
    const dx = x - this.drag.x;
    const dy = y - this.drag.y;
    this.client.MoveWindow(win.id, (win.x + dx), (win.y + dy));
    win.x += dx;
    win.y += dy;
    this.drag = { x, y };
  }

  resizeCurrent(x, y) {
    if (!this.focusedWindow?.floating) return;
    if (!this.drag) this.drag = { x, y };
    const win = this.focusedWindow;
    const dx = x - this.drag.x;
    const dy = y - this.drag.y;
    this.client.ResizeWindow(win.id, (win.w + dx), (win.h + dy));
    win.w += dx;
    win.h += dy;
    this.drag = { x, y };
  }

  raiseCurrent() {
    if (!this.focusedWindow?.floating) return;
    this.client.RaiseWindow(this.focusedWindow.id);
  }

  async setType(wid) {
    const name = await this.getWinName(wid);

    if (name.includes(`desktop_${this.id}`)) {
      this.desktop = wid;
    }

    if (name.includes(`brain_${this.id}`)) {
      this.brain = wid;
    }
  }

  async listen() {
    if (this.debug) return;
    this.client.on('event', async e => {
      const { wid, name } = e;
      if (!wid) return;

      switch (name) {
        case 'DestroyNotify': this.handleDestroy(wid); break;
        case 'MapRequest': await this.handleMap(wid); break;
        case 'EnterNotify': this.handleEnter(wid); break;
        case 'LeaveNotify': this.handleExit(wid); break;
      }
    });
  }

  getWorkspaceByCoords(x, y) {
    const screen = this.screens.find(s => {
      return x >= s.x
        && x <= (s.x + s.w)
        && y >= s.y
        && y <= (s.y + s.h);
    });
    return Workspace.getAll().find(ws => {
      return ws.active
        && ws.screen === this.screens.indexOf(screen);
    });
  }
}

module.exports = Manager;