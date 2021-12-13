const Wrapper = require('./wrapper.js');
const Container = require('./container.js');

class Window extends Container {
  #floating;
  constructor(id) {
    super(id);
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
      const ws = Container.getById(this.root);
      const fc = ws.floatContainer;

      let p = Container.getById(this.parentCache);
      if (!p) {
        p = new Wrapper();
        ws.append(p);
      }

      if (this.parent === fc.id) fc.remove(this);
      p.append(this);

      this.parentCache = null;
    }
  }
}

module.exports = Window;