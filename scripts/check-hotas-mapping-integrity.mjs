import { readFile } from 'node:fs/promises';
import path from 'node:path';

const strictMode = process.argv.includes('--strict');
const rootDir = process.cwd();

const mapPath = path.join(rootDir, 'app', 'utils', 'starCitizenActionMap.js');
const bindingsPath = path.join(rootDir, 'app', 'data', 'starcitizen-keybindings.js');

const [mapSource, bindingsSource] = await Promise.all([
  readFile(mapPath, 'utf-8'),
  readFile(bindingsPath, 'utf-8'),
]);

const mappedFeatureIds = new Set(
  [...mapSource.matchAll(/'[^']+'\s*:\s*'([^']+)'/g)].map((match) => match[1])
);

const keybindingIds = new Set(
  [...bindingsSource.matchAll(/id:\s*'([^']+)'/g)].map((match) => match[1])
);

const missingTargets = [...mappedFeatureIds].filter((id) => !keybindingIds.has(id)).sort();

console.log(`Mapped feature IDs: ${mappedFeatureIds.size}`);
console.log(`Keybinding feature IDs: ${keybindingIds.size}`);
console.log(`Missing map targets: ${missingTargets.length}`);

if (missingTargets.length > 0) {
  missingTargets.forEach((id) => console.log(` - ${id}`));
  const message = strictMode
    ? 'HOTAS mapping integrity FAILED (strict mode).'
    : 'HOTAS mapping integrity WARNING: missing targets found.';
  console.log(message);

  if (strictMode) {
    process.exitCode = 1;
  }
} else {
  console.log('HOTAS mapping integrity passed.');
}
