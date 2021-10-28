import ioHook from 'iohook';
import xinit from './xinit.js';
import Window from './window.js';
import { v4 as uuid } from 'uuid';
import Logger from 'spice-logger';
import Wrapper from './wrapper.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { exec } from 'child_process';
import Container from './container.js';
import Workspace from './workspace.js';
import getScreenInfo from './screen.js';
const { client, display, eventMasks } = await xinit;
const __dirname = dirname(fileURLToPath(import.meta.url));

export default class Manager {
  constructor(opts = { dbug: false }) {
    this.screen = display.screen[0];
    this.debug = opts.debug;
    this.id = uuid();
    this.workspaces = [];
    this.desktop = null;
    this.current = {
      ws: null,
      window: null,
      wrapper: null,
    };

    if (this.debug) return;
    Logger.info(`Initializing Window Manager...`);
    const screen0 = display.screen[0];
    client.ChangeWindowAttributes(screen0.root, eventMasks.manager, Logger.error);
    Logger.info(`${screen0.root} is now the window manager`);

    return this.init();
  }

  get desktopId() {
    return `desktop_${this.id}`;
  }

  async init() {
    const screens = await getScreenInfo();

    screens.forEach(s => {
      const ws = new Workspace({ screen: s });
      this.workspaces.push(ws);
    });

    this.current.workspace = this.workspaces[0];

    ioHook.on('mousemove', e => {
      this.current.workspace = Workspace.getByCoords(e.x, e.y);
      this.current.wrapper = Wrapper.getByCoords(e.x, e.y);
    });

    ioHook.on('keydown', e => {
      if (e.keycode == 28 && e.metaKey && !e.shiftKey) {
        exec('kitty');
      }
      if (e.keycode == 28 && e.metaKey && e.shiftKey) {
        this.current.wrapper = new Wrapper(this.current.workspace);
        exec('kitty');
      }
    });

    ioHook.start();
    this.listen();

    exec(`${join(__dirname, 'desktop.cjs')} ${this.id}`);
  }

  redraw() {
    const all = Window.getAll().filter(w => w !== this);
    all.forEach(c => c.draw());
  }

  listen() {
    if (this.debug) return;
    client.on('event', e => {
      const { wid, name } = e;

      if (name === 'CreateNotify') {
        if (!wid) return;
        client.GetProperty(0, wid, client.atoms.WM_NAME, client.atoms.STRING, 0, 10000000, (err, prop) => {
          Logger.info(`Checking if ${wid} is desktop`);
          if (err) return Logger.error(err);
          const name = prop.data.toString();
          Logger.info(`${this.desktopId}, name`);
          if (!this.desktop && this.desktopId == name) {
            Logger.info(`${wid} is now desktop`);
            this.desktop = wid;
          }
        });
      }

      if (name === 'MapRequest') {
        Logger.info(`Map request for ${wid}`);

        if (this.desktop === wid) {
          client.MoveWindow(wid, 0, 0);
          client.ResizeWindow(wid, this.screen.pixel_width, this.screen.pixel_height);
          client.MapWindow(wid);
          return;
        }

        if (!!Container.getById(wid)) return;
        client.ChangeWindowAttributes(wid, eventMasks.window);

        const ws = this.current.workspace
          || Workspace.getAll()[0];
        let wrapper = this.current.wrapper
          || Wrapper.getById(ws.children[ws.children.length - 1]);

        if (!wrapper) wrapper = new Wrapper(ws);

        Logger.info(ws.id, wrapper.id);
        const win = new Window({ id: wid }, wrapper);
        this.redraw();
      }

      if (name === 'EnterNotify') {
        client.SetInputFocus(wid);
      }

      if (name === 'DestroyNotify') {
        const win = Window.getById(wid);
        Logger.info(`Destroy Request for ${win?.id}`);
        if (!win) return;
        const p = Window.getById(win.parent);
        p.destroy(win);
        this.redraw();
      }
    });

    // client.on('event', e => {
    //   const { wid, name } = e;
    //   // Logger.info(`Event ${name} for ${wid}`);
    //   switch (name) {

    //     case 'CreateNotify':
    //       if (!wid) break;
    //       client.GetProperty(0, wid, client.atoms.WM_NAME, client.atoms.STRING, 0, 10000000, (err, prop) => {
    //         Logger.info(`Checking if ${wid} is desktop`);
    //         if (err) return Logger.error(err);
    //         const name = prop.data.toString();
    //         if (!this.desktop && this.desktopId == name) {
    //           Logger.info(`${wid} is now desktop`);
    //           this.desktop = wid;
    //         }
    //       });
    //       break;
  }
}