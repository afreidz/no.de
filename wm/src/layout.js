const Container = require('./container.js');

module.exports = function set(node, parent = null) {
  const n = Container.getById(node);
  const p = Container.getById(parent);
  let geo = {};

  if (!p) {
    geo.x = n.geo.x;
    geo.y = n.geo.y;
    geo.w = n.geo.w;
    geo.h = n.geo.h;
  } else {
    if (p.dir === 'ttb') {
      const ma = (p.w / p.children.length) * n.ratio;

      geo.w = ma - (p.gaps ? (p.gaps[1] + p.gaps[3]) : 0);
      geo.h = p.h - (p.gaps ? (p.gaps[0] + p.gaps[2]) : 0);
      geo.y = p.y + (p.gaps ? p.gaps[0] : 0);
      geo.x = !!p.children[p.children.indexOf(node) - 1]
        ? Container.getById(p.children[p.children.indexOf(node) - 1]).x
        + Container.getById(p.children[p.children.indexOf(node) - 1]).w
        + (p.gaps ? (p.gaps[1] + p.gaps[3]) : 0)
        : p.x + (p.gaps ? p.gaps[3] : 0);

    } else {
      const ma = (p.h / p.children.length) * n.ratio;

      geo.h = ma - (p.gaps ? (p.gaps[0] + p.gaps[2]) : 0);
      geo.w = p.w - (p.gaps ? (p.gaps[1] + p.gaps[3]) : 0);
      geo.x = p.x + (p.gaps ? p.gaps[3] : 0);
      geo.y = !!p.children[p.children.indexOf(node) - 1]
        ? Container.getById(p.children[p.children.indexOf(node) - 1]).y
        + Container.getById(p.children[p.children.indexOf(node) - 1]).h
        + (p.gaps ? (p.gaps[0] + p.gaps[2]) : 0)
        : p.y + (p.gaps ? p.gaps[0] : 0);
    }
  }

  n.geo = geo;

  if (n.children) n.children.forEach(c => set(c, n.id));
}