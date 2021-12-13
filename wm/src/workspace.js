const Float = require('./float.js');
const Wrapper = require('./wrapper.js');
const Container = require('./container.js');
let count = 1;

class Workspace extends Container {
  constructor(geo = { x: 0, y: 0, w: 1, h: 1, }, screen = 0, text = count) {
    super();
    this.floatContainer = null;
    this.screen = screen;
    this.active = false;
    this.text = text;
    this.dir = 'ltr';
    this.geo = geo;

    count += 1;
  }

  get ratioOverage() {
    return this.children.length - this.children.reduce((r, id) => {
      return r + (Container.getById(id).ratio || 1);
    }, 0);
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
      c.parent = this.id;
      c.geo = this.geo;
    } else {
      super.append(c, i);
      c.dir = this.dir === 'ltr' ? 'ttb' : 'ltr';
      const ratioDiff = this.ratioOverage / (this.children.length - 1);
      this.children.forEach(id => {
        const w = Container.getById(id);
        if (w === c) return;
        w.ratio += ratioDiff;
      });
    }
  }

  remove(c) {
    super.remove(c);

    const ratioDiff = this.ratioOverage / this.children.length;
    this.children.forEach(id => {
      const w = Container.getById(id);
      w.ratio += ratioDiff;
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