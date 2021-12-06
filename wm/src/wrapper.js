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

  remove(c) {
    super.remove(c);
    const ws = Container.getById(this.parent);
    if (this.children.length === 0 && ws.children.length > 1) ws.remove(this);
  }
}
module.exports = Wrapper;