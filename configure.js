const { join } = require('path');
const { appendFile, truncate } = require('fs/promises');
const config = require('./no.de.config.json');

const hkdrc = join(__dirname, 'sxhkdrc');
const heading = ` ***Automatically generated from no.de -- DO NOT EDIT!***\n\n`;

module.exports = async function generate() {
  await appendFile(hkdrc, '');
  await truncate(hkdrc, 0);
  await appendFile(hkdrc, `#${heading}`);

  for (const kb of config.wm.keybinds) {
    const text = `${kb.key}\n\t${kb.cmd}\n\n`;
    await appendFile(hkdrc, text);
  }
}
