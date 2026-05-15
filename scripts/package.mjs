import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import archiver from 'archiver';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);
const pkg = require(path.join(rootDir, 'package.json'));

const distDir = path.join(rootDir, 'dist');
const releaseDir = path.join(rootDir, 'release');
const zipName = `session-copy-v${pkg.version}.zip`;
const zipPath = path.join(releaseDir, zipName);

async function packageRelease() {
  if (!(await fs.pathExists(path.join(distDir, 'manifest.json')))) {
    console.error('dist/manifest.json not found. Run "npm run build" first.');
    process.exit(1);
  }

  const manifest = await fs.readJson(path.join(distDir, 'manifest.json'));
  if (manifest.version !== pkg.version) {
    console.error(
      `Version mismatch: dist/manifest.json=${manifest.version}, package.json=${pkg.version}`
    );
    process.exit(1);
  }

  await fs.ensureDir(releaseDir);

  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  await new Promise((resolve, reject) => {
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(distDir, false, (entry) => {
      if (entry.name.endsWith('.map') || entry.name === '.DS_Store') return false;
      return entry;
    });
    archive.finalize();
  });

  const sizeKb = ((await fs.stat(zipPath)).size / 1024).toFixed(1);
  console.log(`Package ready: ${zipPath} (${sizeKb} KB)`);
}

packageRelease().catch((err) => {
  console.error(err);
  process.exit(1);
});
