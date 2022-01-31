import iohook from 'iohook';
import IPCClient from '@no.de/ipc';
import { EventEmitter } from 'events';

export default function() {
  const ee = new EventEmitter();
  const ipc = new IPCClient(['wm']);
  let meta: Boolean = false;
  let ctrl: Boolean = false;

  iohook.on('keyup', e => {
    if (e.metaKey) meta = false;
    if (e.ctrlKey) ctrl = false;
    if (e.keycode == 1) ipc.send('wm', { msg: 'command', command: 'close-modal' });
  });
      
  iohook.on('keydown', e => {
    if (e.metaKey) meta = true;
    if (e.ctrlKey) ctrl = true;
  });
      
  iohook.on('mouseup', e => ee.emit('drag', null));
  iohook.on('mousedown', e => ee.emit('drag', { x: e.x, y: e.y }));
  iohook.on('mousedrag', e => {
    if(meta && !ctrl) ee.emit('move', e);
    if(meta && ctrl) ee.emit('resize', e);
  });
  iohook.on('mousemove', e => ee.emit('mouse', { x: e.x, y: e.y }));
  iohook.on('mouseclick', e => {
    if (e.clicks == 2 && meta) {
      ee.emit('float');
    } else {
      ee.emit('raise');
    }
  });
  iohook.start();
  return ee;
}

