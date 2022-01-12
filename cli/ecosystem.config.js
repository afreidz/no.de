const { join } = require('path');

const display = 2;
const ns = 'no.de';
const base = join(__dirname, '../');

const uiurls = {
  desktop: 'http://localhost:7000/desktop',
};

module.exports = {
  apps: [{
    name: 'ui',
    namespace: ns,
    env: { PORT: 7000 },
    script: `npm start`,
    cwd: join(base, 'ui'),
  },{
    name: 'ipc',
    namespace: ns,
    env: { PORT: 7001 },
    script: `/usr/bin/env ts-node ${join(base, 'ipc/index.ts')}` 
  }, {
    name: 'wm',
    namespace: ns,
    autorestart: false,
    script: `startx ${join(base, 'wm/index.ts')} -- :${display}`
  }, {
    name: 'hkd',
    namespace: ns,
    restart_delay: 4000,
    env: { DISPLAY: `:${display}` },
    script: `/usr/bin/sxhkd -c ${join(base, 'sxhkdrc')}`
  }, {
    namespace: ns,
    name: 'desktop',
    restart_delay: 1000,
    env: { DISPLAY: `:${display}`},
    script: `${join(base, 'ui/bin', 'webview.cjs')} --title ${ns}-desktop --type "DESKTOP" --url ${uiurls.desktop}`
  }, {
    cwd: base,
    namespace: ns,
    name: 'compositor',
    restart_delay: 4000,
    env: { DISPLAY: `:${display}` },
    script: 'picom --config ./picom --experimental-backends',
  }]
}
