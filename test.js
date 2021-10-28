#!/usr/bin/env bash
":" //# comment; exec /usr/bin/env node --input-type=module --es-module-specifier-resolution=node - "$@" < "$0"
import Workspace from 'spice-wm/lib/workspace';
import Wrapper from 'spice-wm/lib/wrapper';

const ws1 = new Workspace({ screen: { x: 0, y: 0, w: 1920, h: 1080 } });
const ws2 = new Workspace({ screen: { x: 1920, y: 0, w: 1920, h: 1080 } });
const ws1w1 = new Wrapper(ws1);
const ws2w1 = new Wrapper(ws2);
const ws2w2 = new Wrapper(ws2);