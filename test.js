#!/usr/bin/env bash
":" //# comment; exec /usr/bin/env node --input-type=module --es-module-specifier-resolution=node - "$@" < "$0"
import Workspace from 'spice-wm/lib/workspace';
import Wrapper from 'spice-wm/lib/wrapper';
import Manager from 'spice-wm/lib/manager';

const manager = await (new Manager({ debug: true }));
console.log(manager);