import x11 from 'x11';
const { SubstructureNotify, SubstructureRedirect, ResizeRedirect, EnterWindow, PropertyChange, KeyPress } = x11.eventMask;

export default new Promise((resolve, reject) => {
  x11.createClient((err, display) => {
    if (err) return reject(err);
    return resolve({
      keySyms: x11.keySyms,
      client: display.client,
      display,
      eventMasks: {
        manager: { eventMask: SubstructureNotify | SubstructureRedirect | ResizeRedirect | KeyPress },
        window: { eventMask: EnterWindow | KeyPress },
      },
    });
  });
});