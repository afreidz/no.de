import ini from 'ini';
import Fuse from 'fuse.js';
import { basename } from 'path';
import { readFile } from 'fs/promises';
import { evaluate, Unit } from 'mathjs';
import { spawn, exec } from 'child_process';

export async function post(request) {
  const action = JSON.parse(request.body);
  if (action.type === 'app') {
    if (action.exec) exec(`sh -c 'gtk-launch ${action.exec} --display=:2'`);
    exec(`sh -c 'no.de wm -c toggle-brain -a false'`);
  }
}

export async function get(request) {
  const data = await cmd(`find /usr/share/applications ~/.local/share/applications /var/lib/snapd/desktop -name '*.desktop'`);
  const mode = request.query.get('mode') || 'default';
  const paths = data.split('\n').filter(Boolean);
  const query = request.query.get('query');
  let results = [];
  const apps = [];

  if (mode === 'default' || mode === 'calculator') {
    try {
      const p = evaluate(query);
      if (!p) return;
      results.push({ item: { name: p.toString(), type: 'calculator' } });
    } catch (err) {
      console.log(err);
    }
  }

  if (mode === 'default' || mode === 'launch') {
    for (const p of paths) {
      const data = ini.parse(await readFile(p, 'utf8'))['Desktop Entry'];
      if (data && data.NoDisplay !== true) {
        apps.push({
          type: 'app',
          name: data.Name,
          exec: basename(p),
        });
      }
    }
    if (query && query !== '') {
      results = [...results, ...(new Fuse(apps, { keys: ['name'] }).search(query))];
    }
  }

  return {
    body: JSON.stringify(results, null, 2)
  }
}

async function cmd(c) {
  const proc = spawn('sh', ['-c', c]);
  let stdout = '';
  let stderr = '';

  for await (const chunk of proc.stdout) stdout += chunk;
  for await (const chunk of proc.stderr) stderr += chunk;

  const exit = await new Promise(r => proc.on('close', r));

  if (exit !== 0) {
    console.error(c, stderr);
    throw new Error(`Command Failed.`);
  }

  return stdout;
}