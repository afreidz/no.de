import Workspace from './workspace';
import Container, { ContainerConstructor, Geography } from './container';

interface RootConstructor extends ContainerConstructor {
  screens: Array<Geography>,
};

export default class Root extends Container {
  constructor(opts: RootConstructor) {
    super(opts);
    this.isRoot = true;
    this.screens = opts.screens;
  }

  append(c: Workspace, i?: number) {
    super.append(c, i);
  }

  appendTo() {
    throw new Error('container is root');
  }

  remove(c: Workspace) {
    super.remove(c);
  }
}
