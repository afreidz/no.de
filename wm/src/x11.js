const x11 = require('x11');
const { get_property } = require('x11-prop');
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

  getAtom(atom) {
    return new Promise(r => {
      this.client.InternAtom(false, atom, (err, a) => {
        if (err) return r('');
        r(a);
      });
    });
  }

  getProp(wid, prop) {
    return new Promise(r => {
      get_property(this.client, wid, prop, null, (err, p) => {
        if (err) return r('');
        const val = Array.isArray(p)
          ? p.map(e => e.toString())
          : p;
        r(val);
      });
    });
  }

  static eventMasks = {
    manager: { eventMask: SubstructureNotify | SubstructureRedirect },
    window: { eventMask: EnterWindow | LeaveWindow },
  };
}

module.exports = X11;