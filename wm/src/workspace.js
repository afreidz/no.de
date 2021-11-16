const Splitter = require('./splitter.js');
const updateLayout = require('./layout.js');
const Container = require('./container.js');

class Workspace extends Container {
  #active;

  constructor(geo = { x: 0, y: 0, w: 1, h: 1, }, i = 0, ratios = []) {
    super({ dir: 'ltr' });
    this.floatContainer = null;
    this.#active = false;
    this.ratios = ratios;
    this.screen = i;
    this.geo = geo;
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

  flip() {
    this.dir = this.dir === 'ltr' ? 'ttb' : 'ltr';
    this.children.forEach(c => {
      Container.getById(c).dir = this.dir === 'ltr' ? 'ttb' : 'ltr';
    });
  }

  append(c) {
    if (c.constructor.name === 'Float') {
      this.floatContainer = c;
      c.geo = this.geo;
    } else {
      super.append(c);
      c.dir = this.dir === 'ltr' ? 'ttb' : 'ltr';
      if (!this.ratios[this.children.indexOf(c.id)]) {
        this.ratios[this.children.indexOf(c.id)] = 1;
      }
    }
  }

  remove(c) {
    super.remove(c);
    this.ratios.splice(this.children.indexOf(c.id), 1);

    const remain = this.ratios.reduce((a, b) => (a + b), 0) - this.children.length;
    const spread = remain / this.children.length;

    this.ratios.forEach((r, i) => {
      this.ratios[i] = this.ratios[i] - spread;
    });
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