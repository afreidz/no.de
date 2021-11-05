const { join } = require('path');
const Winston = require('winston');
const { EventEmitter } = require('events');

const logger = Winston.createLogger({
  level: 'info',
  format: Winston.format.simple(),
  transports: [
    new Winston.transports.File({ filename: join(__dirname, '/logs', 'all.log') }),
    new Winston.transports.Console(),
  ],
});

class LogEmitter extends EventEmitter {
  constructor(scope = '') {
    super();
    this.scope = scope;

    this.on('error', async (msg, data) => {
      logger.error(`${scope} | ${msg}`);
    });

    this.on('info', async (msg, data) => {
      logger.info(`${scope} | ${msg}`);
    });
  }
}

module.exports = LogEmitter;