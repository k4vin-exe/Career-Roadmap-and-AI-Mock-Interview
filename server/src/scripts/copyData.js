import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const src = path.resolve(__dirname, '../data/roadmaps.json');
const destDir = path.resolve(__dirname, '../../dist/data');
const dest = path.resolve(destDir, 'roadmaps.json');

if (fs.existsSync(src)) {
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  console.log('✅ roadmaps.json successfully copied to dist/data');
}
