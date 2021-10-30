const x11 = require('x11');
const { SubstructureNotify, SubstructureRedirect, ResizeRedirect, EnterWindow, PropertyChange, KeyPress } = x11.eventMask;

const display = new Promise((resolve, reject) => {
  x11.createClient((err, display) => {
    if (err) return reject(err);
    return resolve(display);
  });
});

class X11 {
  constructor() {
    this.client = null;
    this.display = null;

    return this.init();
  }

  async init() {
    const display = await display;
    this.client = display.client;
    this.display = display;
  }

  static eventMasks = {
    manager: { eventMask: SubstructureNotify | SubstructureRedirect | ResizeRedirect | KeyPress },
    window: { eventMask: EnterWindow | KeyPress },
  };
}

module.exports = X11;