const updateLayout = require('./layout.js');
const Container = require('./container.js');
let count = 1;

class Workspace extends Container {
  #active;

  constructor(geo = { x: 0, y: 0, w: 1, h: 1, }, screen = 0, text = count) {
    super();
    this.floatContainer = null;
    this.#active = false;
    this.screen = screen;
    this.text = text;
    this.dir = 'ltr';
    this.geo = geo;

    count += 1;
  }

  get active() {
    return this.#active;
  }

  set active(v) {
    this.#active = !!v;

    if (!!v) {
      const others = Workspace.getByScreen(this.screen).filter(ws => ws.id !== this.id);
      others.forEach(ws => (ws.active = false));
    }
  }

  serialize() {
    return {
      dir: this.dir,
      text: this.text,
      screen: this.screen,
      active: this.active,
      children: this.children.length,
    }
  }

  flip() {
    this.dir = this.dir === 'ltr' ? 'ttb' : 'ltr';
    this.children.forEach(c => {
      Container.getById(c).dir = this.dir === 'ltr' ? 'ttb' : 'ltr';
    });
  }

  append(c, i = null) {
    if (c.constructor.name === 'Float') {
      this.floatContainer = c;
      c.geo = this.geo;
    } else {
      super.append(c, i);
    }
  }

  getWrapperByCoords(x, y) {
    this.children.map(c => (Container.getById(c))).find(wrap => {
      return x >= wrap.geo.x
        && x <= (wrap.geo.x + wrap.geo.w)
        && y >= wrap.geo.y
        && y <= (wrap.geo.y + wrap.geo.h);
    });
  }

  static getByScreen(s) {
    return Workspace.getAll().filter(ws => ws.screen === s);
  }
}

module.exports = { Workspace, Container };