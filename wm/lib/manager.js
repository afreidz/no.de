const uuid = require('uuid');
const X11 = require('./x11.js');
const ioHook = require('iohook');
const { join } = require('path');
const Window = require('./window');
const Wrapper = require('./wrapper');
const Workspace = require('./workspace');
const { exec } = require('child_process');
const getScreenInfo = require('./screen');
const Logger = require('spice-logger/logger.cjs');

class Manager extends Logger {
  constructor(opts = { dbug: false }) {
    super('Window Manager');
    this.debug = opts.debug;
    this.split = false;
    this.id = uuid.v4();
    this.workspaces = [];
    this.desktop = null;
    this.mouse = { x: 0, y: 0 };

    if (this.debug) return;
    return this.init();
  }

  get desktopId() {
    return `desktop_${this.id}`;
  }

  addWorkspace(screen = 0) {
    const ws = new Workspace(this.screens[screen]);
    this.workspaces.push(ws);
    ws.active = true;
  }

  async init() {
    const x11 = await (new X11());
    const { client, display } = x11;
    const screens = await getScreenInfo();

    this.x11 = x11;
    this.client = client;
    this.screens = screens;
    this.xscreen = display.screen[0];

    this.emit('info', `Initializing Window Manager...`);
    client.ChangeWindowAttributes(this.xscreen.root, X11.eventMasks.manager, e => this.emit('error', e.message));
    this.emit('info', `${this.xscreen.root} is now the window manager`);

    ioHook.on('mousemove', e => (this.mouse = [e.x, e.y]));
    ioHook.start();

    this.listen();
    exec(`${join(__dirname, '../../ui/bin', 'desktop.cjs')} ${this.id}`);
    return this;
  }

  exec(cmd) {
    exec(cmd);
  }

  kill() {
    if (!this.focusedWindow) return;
    this.client.DestroyWindow(this.focusedWindow.id);
    this.focusedWindow = null;
  }

  redraw() {
    const all = Window.getAll().filter(w => w !== this);
    all.forEach(c => c.draw());
  }

  increaseCurrent(v = 2) {
    const wrap = Wrapper.getById(this.focusedWindow.parent);
    wrap.increase(v, this.focusedWindow.id);
  }

  increaseOthers(v = 2) {
    const wrap = Wrapper.getById(this.focusedWindow.parent);
    wrap.decrease(v, this.focusedWindow.id);
  }

  flip() {
    Workspace.getByCoords(...this.mouse).flip();
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
    this.emit('info', `Checking if ${wid} is desktop`);
    if (this.desktopId === await this.getWinName(wid)) {
      this.emit('info', `${wid} is now desktop`);
      this.desktop = wid;
    }
  }

  handleMap(wid) {
    if (this.desktop === wid) {
      this.client.MoveWindow(wid, 0, 0);
      this.client.ResizeWindow(wid, this.xscreen.pixel_width, this.xscreen.pixel_height);
      this.client.MapWindow(wid);
      return;
    }

    if (!!Window.getById(wid)) return;
    this.client.ChangeWindowAttributes(wid, X11.eventMasks.window);

    const wrapper = (Wrapper.getByCoords(...this.mouse).children.length > 0 && this.split)
      ? new Wrapper(Workspace.getByCoords(...this.mouse))
      : Wrapper.getByCoords(...this.mouse);

    const win = new Window(wrapper, wid, this.x11);
    Workspace.getById(wrapper.parent).redraw();
  }

  handleDestroy(wid) {
    this.emit('info', `Destroy Request for ${wid}`);
    const win = Window.getById(wid);
    if (!win) return;

    const p = Window.getById(win.parent);
    const wrap = Wrapper.getAll().find(w => win.ancestors.includes(w.id));
    const ws = Workspace.getAll().find(w => win.ancestors.includes(w.id));
    p.remove(win);
    ws.redraw();
  }

  handleEnter(wid) {
    this.focusedWindow = Window.getById(wid);
    this.client.SetInputFocus(wid);
  }

  async listen() {
    if (this.debug) return;
    this.client.on('event', async e => {
      const { wid, name } = e;
      if (!wid) return;

      switch (name) {
        case 'MapRequest': this.handleMap(wid); break;
        case 'DestroyNotify': this.handleDestroy(wid); break;
        case 'CreateNotify': await this.setDesktop(wid); break;
        case 'EnterNotify': this.handleEnter(wid); break;
      }
    });
  }
}

module.exports = Manager;