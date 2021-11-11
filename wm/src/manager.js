const X11 = require('./x11.js');
const ioHook = require('iohook');
const { join } = require('path');
const Window = require('./window.js');
const Wrapper = require('./splitter.js');
const { exec } = require('child_process');
const updateLayout = require('./layout.js');
const getScreenInfo = require('./screen.js');
const { Workspace } = require('./workspace.js');
const Logger = require('no-de-logger/logger.cjs');

class Manager extends Logger {
  constructor(opts = { dbug: false }) {
    super('Window Manager');

    this.split = false;
    this.id = +new Date;
    this.desktop = null;
    this.workspaces = [];
    this.debug = opts.debug;
    this.mouse = { x: 0, y: 0 };

    return this.init();
  }

  get desktopId() {
    return `desktop_${this.id}`;
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
      this.emit('info', `Initializing Window Manager...`);
      client.ChangeWindowAttributes(this.xscreen.root, X11.eventMasks.manager, e => this.emit('error', e.message));
      this.emit('info', `${this.xscreen.root} is now the window manager`);
    }

    ioHook.on('mousemove', e => (this.mouse = [e.x, e.y]));
    ioHook.start();

    this.listen();
    exec(`${join(__dirname, '../../ui/bin', 'desktop.cjs')} ${this.id}`);
    return this;
  }

  addWorkspace(screen = 0) {
    const sdims = this.screens[screen];
    const geo = {
      y: sdims.y + 40,
      h: sdims.h - 45,
      x: sdims.x + 5,
      w: sdims.w - 10,
    };
    const ws = new Workspace(geo, screen);
    new Wrapper({ parent: ws.id });
    this.workspaces.push(ws);
    this.activateWorkspace(this.workspaces.length - 1);
  }

  activateWorkspace(n = 0) {
    const ws = this.workspaces[n];
    const others = Workspace.getByScreen(ws.screen).filter(w => ws.id !== w.id);
    ws.active = true;
    this.layout(ws.id);
    others.forEach(ws => this.layout(ws.id));
  }

  exec(cmd) {
    exec(cmd);
  }

  kill() {
    if (!this.focusedWindow) return;
    this.client.DestroyWindow(this.focusedWindow.id);
  }

  layout(ws) {
    updateLayout(ws);

    const workspace = Workspace.getById(ws);
    const windows = workspace.descendents.filter(d => !!(Window.getById(d) instanceof Window));

    windows.forEach(w => {
      const win = Window.getById(w);
      if (!workspace.active) {
        this.client.UnmapWindow(win.id);
        win.mapped = false;
      } else {
        this.client.MoveWindow(win.id, win.geo.x, win.geo.y);
        this.client.ResizeWindow(win.id, win.geo.w, win.geo.h);
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
  }

  getWinName(wid) {
    const { WM_NAME, STRING } = this.client.atoms;
    return new Promise(r => {
      this.client.GetProperty(0, wid, WM_NAME, STRING, 0, 10000000, (err, prop) => {
        if (err) return this.emit('error', err);
        const name = prop.data.toString();
        r(name);
      });
    });
  }

  async setDesktop(wid) {
    if (!!this.desktop) return;
    this.emit('info', `Checking if ${wid} is desktop`);
    if (this.desktopId === await this.getWinName(wid)) {
      this.emit('info', `${wid} is now desktop`);
      this.desktop = wid;
    }
  }

  handleMap(wid) {
    this.emit('info', `Map Request for ${wid}`);
    if (this.desktop === wid) {
      this.client.MoveWindow(wid, 0, 0);
      this.client.ResizeWindow(wid, this.xscreen.pixel_width, this.xscreen.pixel_height);
      this.client.MapWindow(wid);
      return;
    }

    if (!!Window.getById(wid)) return;
    this.client.ChangeWindowAttributes(wid, X11.eventMasks.window);

    let ws = Workspace.getById(this.focusedWindow?.root);

    if (!ws) ws = this.getWorkspaceByCoords(...this.mouse);
    if (!ws) ws = this.workspaces[0];

    let wrapper = Wrapper.getById(this.focusedWindow?.parent);

    if (!wrapper) wrapper = ws.getWrapperByCoords(...this.mouse);
    if (!wrapper) wrapper = Wrapper.getById(ws.children[ws.children.length - 1] || ws.children[0]);
    if (this.split && wrapper.children.length !== 0) wrapper = new Wrapper({ parent: ws.id });

    const win = new Window({ parent: wrapper.id, id: wid });
    this.layout(ws.id);
    this.client.MapWindow(wid);
  }

  handleDestroy(wid) {
    this.emit('info', `Destroy Request for ${wid}`);
    const win = Window.getById(wid);
    if (!win) return;

    const wrap = Wrapper.getById(win.parent);
    const ws = Workspace.getById(win.root);
    wrap.remove(win);
    if (wrap.children.length === 0 && ws.children.length > 1) ws.remove(wrap);
    this.layout(ws.id);
    this.focusedWindow = Window.getByCoords(...this.mouse);
  }

  handleEnter(wid) {
    this.emit('info', `Mouse Enter Notify for ${wid}`);
    this.focusedWindow = Window.getById(wid);
    this.client.SetInputFocus(wid);
  }

  handleExit(wid) {
    this.emit('info', `Mouse Exit Notify for ${wid}`);
    this.focusedWindow = null;
    this.client.SetInputFocus(this.xscreen.root);
  }

  async listen() {
    if (this.debug) return;
    this.client.on('event', async e => {
      const { wid, name } = e;
      if (!wid) return;

      switch (name) {
        case 'CreateNotify': await this.setDesktop(wid); break;
        case 'DestroyNotify': this.handleDestroy(wid); break;
        case 'EnterNotify': this.handleEnter(wid); break;
        case 'LeaveNotify': this.handleExit(wid); break;
        case 'MapRequest': this.handleMap(wid); break;
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