#!/usr/bin/env node
const Manager = require('./lib/manager');

(async () => {
  const manager = await (new Manager());
})();