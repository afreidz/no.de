import Winston from 'winston';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

const logger = Winston.createLogger({
  level: 'info',
  format: Winston.format.simple(),
  transports: [
    new Winston.transports.File({ filename: join(__dirname, '/logs', 'all.log') }),
    new Winston.transports.Console(),
  ],
});

export default logger;