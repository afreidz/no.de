const x11 = require('x11');
const {
  KeyPress,
  EnterWindow,
  LeaveWindow,
  ButtonPress,
  Button1Motion,
  ButtonRelease,
  ResizeRedirect,
  PropertyChange,
  SubstructureNotify,
  SubstructureRedirect,
} = x11.eventMask;

console.log(x11.eventMask);

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
    this.display = await display;
    this.client = this.display.client;
    return this;
  }

  static eventMasks = {
    manager: { eventMask: SubstructureNotify | SubstructureRedirect },
    window: { eventMask: EnterWindow | LeaveWindow },
  };
}

module.exports = X11;