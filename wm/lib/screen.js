import xinit from './xinit.js';
const { client, display } = await xinit;

export default async function () {
  const RandR = await new Promise(r => {
    client.require('randr', (err, ext) => r(ext));
  });

  const outputs = await new Promise(r => {
    RandR.GetScreenResources(display.screen[0].root, (err, res) => r(res.crtcs));
  });

  return new Promise(async r => {
    const info = [];
    for (const output of outputs) {
      info.push(await new Promise(r => {
        RandR.GetCrtcInfo(output, 0, (err, i) => r(i));
      }));
    }
    r(info.filter(s => !!s.output.length).map(s => {
      return {
        x: s.x,
        y: s.y,
        w: s.width,
        h: s.height,
      }
    }));
  });
}