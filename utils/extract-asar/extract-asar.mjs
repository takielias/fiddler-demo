import fs from 'node:fs';
import path from 'node:path';
import * as asar from '@electron/asar';

const [archive, dest] = process.argv.slice(2);
let missing = 0;

for (const entry of asar.listPackage(archive, { isPack: false })) {
  const rel = entry.replace(/^[\\/]/, '');
  const target = path.join(dest, rel);
  const stat = asar.statFile(archive, rel, true);

  if (stat.files) {
    fs.mkdirSync(target, { recursive: true });
    continue;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  try {
    fs.writeFileSync(target, asar.extractFile(archive, rel));
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
    missing++;
    console.warn(`skipping ${rel}: listed as unpacked but not shipped`);
  }
}

console.log(`extracted ${archive} to ${dest} (${missing} missing unpacked files skipped)`);
