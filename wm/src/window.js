const Container = require('./container.js');

class Window extends Container {
  constructor(opts = {}) {
    super(opts);
    this.mapped = false;
  }
}

module.exports = Window;