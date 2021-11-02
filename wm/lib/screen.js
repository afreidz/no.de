const X11 = require('./x11');

module.exports = async function () {
  const x11 = await (new X11());
  const { client, display } = x11;
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
    r(info.filter(s => !!s.output.length).map((s, i) => {
      return {
        i: i,
        x: s.x,
        y: s.y,
        w: s.width,
        h: s.height,
      }
    }));
  });
}