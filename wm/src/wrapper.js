const Container = require('./container.js');
const gap = 5;

class Wrapper extends Container {
  constructor(p, i = null) {
    const parent = Container.getById(p);
    super();
    this.dir = parent
      ? parent.dir === 'ttb' ? 'ltr' : 'ttb'
      : 'ttb';
    this.gaps = [gap, gap, gap, gap];
    this.ratio = 1;
    parent?.append(this, i);
  }

  get ratioOverage() {
    return this.children.length - this.children.reduce((r, id) => {
      return r + (Container.getById(id).ratio || 1);
    }, 0);
  }

  append(c, i) {
    super.append(c, i);
    const ratioDiff = this.ratioOverage / (this.children.length - 1);
    this.children.forEach(id => {
      const w = Container.getById(id);
      if (w === c) return;
      w.ratio += ratioDiff;
    });
  }

  remove(c) {
    super.remove(c);
    const ws = Container.getById(this.parent);
    if (this.children.length === 0 && ws.children.length > 1) {
      ws.remove(this);
      return this;
    }

    const ratioDiff = this.ratioOverage / this.children.length;
    this.children.forEach(id => {
      const w = Container.getById(id);
      w.ratio += ratioDiff;
    });

  }
}
module.exports = Wrapper;