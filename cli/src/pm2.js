const pm2 = require('pm2');

function connect() {
  return new Promise((r, x) => {
    pm2.connect(err => {
      if (err) return x(err);
      r();
    });
  });
}

function disconnect() {
  return pm2.disconnect();
}

async function start(opts = {}) {
  await connect();
  return new Promise(r => {
    pm2.start(opts, (err, apps) => {
      if (err) return disconnect();
      r(apps);
      disconnect();
    });
  });
}

async function stop(name) {
  await connect();
  return new Promise(r => {
    pm2.stop(name, (err, apps) => {
      if (err) return disconnect();
      r(apps);
      disconnect();
    });
  });
}

module.exports = {
  stop,
  start,
  connect,
  disconnect,
};