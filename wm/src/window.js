const Container = require('./container.js');

class Window extends Container {
  #floating;
  constructor(parent, id) {
    super(parent, id);
    this.ratio = 1;
    this.mapped = false;
    this.#floating = false;
    this.parentCache = null;
  }

  get floating() {
    return this.#floating;
  }

  set floating(v) {
    this.#floating = !!v;

    if (!!v) {
      const p = Container.getById(this.parent);
      const fc = Container.getById(this.root).floatContainer;

      this.parentCache = p.id;
      this.x = 10;
      this.y = 10;
      this.w = 800;
      this.h = 600;

      p.remove(this);
      fc.append(this);
    } else {
      const p = Container.getById(this.parentCache);
      p.append(this);
      this.parentCache = null;
    }
  }
}

module.exports = Window;