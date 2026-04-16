import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist', 'assets');
const jsBudget = Number(process.env.BUNDLE_BUDGET_JS || 350000);
const cssBudget = Number(process.env.BUNDLE_BUDGET_CSS || 220000);

async function getFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return getFiles(fullPath);
      }

      return fullPath;
    })
  );

  return files.flat();
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(2)} KiB`;
}

const files = await getFiles(distDir);
const totals = { css: 0 };
let largestJsChunk = { name: null, size: 0 };

for (const file of files) {
  const fileStat = await stat(file);
  if (file.endsWith('.js')) {
    if (fileStat.size > largestJsChunk.size) {
      largestJsChunk = { name: path.basename(file), size: fileStat.size };
    }
  }
  if (file.endsWith('.css')) {
    totals.css += fileStat.size;
  }
}

console.log(`Largest JS chunk: ${largestJsChunk.name || 'n/a'} ${formatBytes(largestJsChunk.size)}`);
console.log(`Total CSS: ${formatBytes(totals.css)}`);

if (largestJsChunk.size > jsBudget) {
  throw new Error(`Largest JS chunk budget exceeded: ${largestJsChunk.size} > ${jsBudget}`);
}

if (totals.css > cssBudget) {
  throw new Error(`CSS bundle budget exceeded: ${totals.css} > ${cssBudget}`);
}