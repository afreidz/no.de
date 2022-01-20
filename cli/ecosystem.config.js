const { join } = require('path');
const config = require('../no.de.config.json');

const ns = 'no.de';
const base = join(__dirname, '../');
const uiport = config.ui?.port || 7000;
const display = config.wm?.display || 1;
const ipcport = config.ipc?.port || 7001;

const uiurls = {
  desktop: `http://localhost:${uiport}/desktop`,
};

const apps = [{
  name: 'ipc',
  namespace: ns,
  script: `npm start`, 
  cwd: join(base, 'ipc'),
  env: { PORT: ipcport },
}, {
  cwd: base,
  name: 'wm',
  namespace: ns,
  autorestart: false,
  script: `startx ${join(base, 'wm/startwm')} -- vt${display}`
}, {
  name: 'hkd',
  namespace: ns,
  restart_delay: 1000,
  env: { DISPLAY: `:${display}` },
  script: `/usr/bin/sxhkd -c ${join(base, 'sxhkdrc')}`
}, {
  namespace: ns,
  name: 'cursor',
  autorestart: false,
  env: { DISPLAY: `:${display}` },
  script: 'xsetroot -cursor_name left_ptr',
}];

if (config.wm?.ui?.desktop) {
  apps.push({
    name: 'ui',
    namespace: ns,
    script: `npm start`,
    env: { PORT: uiport },
    cwd: join(base, 'ui'),
  });
}

if (config.wm?.ui?.desktop) {
  apps.push({
    namespace: ns,
    name: 'desktop',
    restart_delay: 1000,
    env: { DISPLAY: `:${display}`},
    script: `${join(base, 'ui/bin', 'webview.cjs')} --title ${ns}-desktop --type "DESKTOP" --url ${uiurls.desktop}`
  })
}

if (config.wm?.compositor) {
  apps.push({
    cwd: base,
    namespace: ns,
    name: 'compositor',
    restart_delay: 1000,
    env: { DISPLAY: `:${display}` },
    script: 'picom --config ./picom --experimental-backends',
  })
}

module.exports = { apps }
