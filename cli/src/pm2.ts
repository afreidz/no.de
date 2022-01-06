import pm2 from 'pm2';
import { join } from 'path';

const logopts = {
  error_file: join(process.env.HOME, '.config', 'no.de', 'logs', 'no.de-error.log')
}

export function connect() {
  return new Promise((r, x) => {
    pm2.connect(err => {
      if (err) return x(err);
      r(true);
    });
  });
}

export function disconnect() {
  return pm2.disconnect();
}

export async function start(opts: any = {}) {
  await connect();

  const logopts = {
    out_file: join(process.env.HOME, '.config', 'no.de', 'logs', `${opts.name}-out.log`),
    error_file: join(process.env.HOME, '.config', 'no.de', 'logs', `${opts.name}-error.log`),
  }

  return new Promise(r => {
    pm2.start({ ...opts, ...logopts }, (err, apps) => {
      if (err) return disconnect();
      r(apps);
      disconnect();
    });
  });
}

export async function stop(name) {
  await connect();
  return new Promise(r => {
    pm2.delete(name, (err, apps) => {
      if (err) return disconnect();
      r(apps);
      disconnect();
    });
  });
}
