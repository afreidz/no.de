import * as x11 from 'x11';
import Manager from './lib/adapters/xorg/index.js';

async function init(): Promise<any> {
  const { client, display } = await new Promise((resolve, reject) => {
    x11.createClient((err, display) => {
      if (err) return reject(err);
      return resolve({ display, client: display.client });
    });
  });

  const RandR: any = await new Promise(r => {
    client.require('randr', (err, ext) => {
      r(ext);
    });
  });

  const outputs: any = await new Promise(r => {
    RandR.GetScreenResources(display.screen[0].root, (err, res) => {
      r(res.crtcs);
    });
  });

  return new Promise(async r => {
    const info = [];
    for (const output of outputs) {
      info.push(await new Promise(r => {
        RandR.GetCrtcInfo(output, 0, (err, i) => r(i));
      }));
    }
    r({
      screens: info.filter(s => !!s.output.length).map((s, i) => {
        return {
          i: i,
          x: s.x,
          y: s.y,
          w: s.width,
          h: s.height,
        }
      }),
      geo: {
        x: 0,
        y: 0,
        w: display.screen[0].pixel_width,
        h: display.screen[0].pixel_height,
      }
    });
  });
}

(async () => {
  await Manager.setup();
  const { geo, screens } = await init();
  const manager = new Manager(screens, geo);
  manager.listen();

  screens.forEach(s => {
    manager.addWorkspace(s, true);
  });

  console.log(`Hello from the xorg adapter of no.de running on Display: ${process.env.DISPLAY}`);

})();
