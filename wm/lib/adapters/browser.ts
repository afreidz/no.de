import Window from '../window.js';
import Manager from '../manager.js';
import Container from '../container.js';

export default class BrowserManager extends Manager {
  draw() {
    document.body.innerHTML = '';
    render(this.root);
  }

  createWindow(wid: number, split?: Boolean) {
    this.split = !!split;
    super.createWindow(wid);
    this.draw();
  }

  destroyWindow(win: Window) {
    super.destroyWindow(win);
    this.draw();
  }
}

function render(node: Container) {
  const d = document.createElement('div');
  d.style.width = `${node.geo.w}px`;
  d.style.height = `${node.geo.h}px`;
  d.style.position = 'absolute';
  d.style.left = `${node.geo.x}px`;
  d.style.top = `${node.geo.y}px`;
  d.innerHTML = `${node.constructor.name}`;
  d.classList.add(node.constructor.name.toLowerCase());
  if (node.fullscreen || node.floating) d.classList.add('fs');
  if (node.isRoot || node.workspace.active) document.body.append(d);
  node.children.forEach(c => render(c));
}
