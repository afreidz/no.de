const { join } = require('path');
const config = require('../no.de.config.json');

const ns = 'no.de';
const base = join(__dirname, '../');
const uiport = config.ui?.port || 7000;
const display = config.wm?.display || 1;
const ipcport = config.ipc?.port || 7001;

const uiurls = config.ui?.urls;
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
  script: `startx ${join(base, 'wm/startwm')} -- :${display} vt${display}`
}, {
  name: 'hkd',
  namespace: ns,
  restart_delay: 1000,
  env: { DISPLAY: `:${display}` },
  script: `/usr/bin/sxhkd -c ${join(base, 'sxhkdrc')}`
}];

if (Object.values(config.wm?.ui || {}).some(Boolean)) {
  apps.push({
    name: 'ui',
    namespace: ns,
    script: `npm start`,
    env: { PORT: uiport },
    cwd: join(base, 'ui'),
  });
}

if (config.wm?.ui?.desktop) {
  const url = uiurls.desktop.startsWith('/')
    ? `http://localhost:${uiport}${uiurls.desktop}`
    : uiurls.desktop;

  apps.push({
    namespace: ns,
    name: 'desktop',
    restart_delay: 1000,
    env: { DISPLAY: `:${display}`},
    script: `${join(base, 'ui/bin', 'webview.cjs')} --title ${ns}-desktop --url ${url}`
  })
}

if (config.wm?.ui?.modal) {
  const url = `http://localhost:${uiport}`

  apps.push({
    namespace: ns,
    name: 'modal',
    restart_delay: 1000,
    env: { DISPLAY: `:${display}`},
    script: `${join(base, 'ui/bin', 'webview.cjs')} --title ${ns}-modal --url ${url}`
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
