const Winston = require('winston');
const { join } = require('path');

const logger = Winston.createLogger({
  level: 'info',
  format: Winston.format.simple(),
  transports: [
    new Winston.transports.File({ filename: join(__dirname, '/logs', 'all.log') }),
    new Winston.transports.Console(),
  ],
});

module.exports = logger;