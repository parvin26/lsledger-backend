import sharp from 'sharp';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logoPath = path.join(__dirname, '..', 'public', 'logo.png');

const { data, info } = await sharp(logoPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const threshold = 25; // treat pixels this dark or darker as background

for (let i = 0; i < data.length; i += channels) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  if (r <= threshold && g <= threshold && b <= threshold) {
    data[i + 3] = 0; // make transparent
  }
}

const outPath = path.join(__dirname, '..', 'public', 'logo-transparent.png');
await sharp(data, { raw: { width, height, channels } })
  .png()
  .toFile(outPath);

const { renameSync } = await import('fs');
renameSync(outPath, logoPath);
console.log('Logo background set to transparent:', logoPath);
