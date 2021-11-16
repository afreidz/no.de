const Container = require('./container.js');
const gap = 5;

class Splitter extends Container {
  constructor(opts = {}) {
    super({
      ...opts,
      decorate: false,
      dir: opts.parent
        ? Container.getById(opts.parent).dir === 'ttb'
          ? 'ltr'
          : 'ttb'
        : 'ttb',
      gaps: [gap, gap, gap, gap],
    });

    this.ratios = opts.ratios || [];
  }

  append(c, r = 1) {
    super.append(c);
    if (!this.ratios[this.children.indexOf(c.id)]) {
      this.ratios[this.children.indexOf(c.id)] = r;
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
}
module.exports = Splitter;