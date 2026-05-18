import esbuild from 'esbuild';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import vue from 'unplugin-vue/esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);
const pkg = require(path.join(rootDir, 'package.json'));

const isWatch = process.argv.includes('--watch');
const isRelease = process.env.RELEASE === '1';
const outDir = path.join(rootDir, 'dist');

const esbuildCommon = {
  bundle: true,
  sourcemap: !isRelease,
  minify: isRelease,
  target: 'chrome114',
  platform: 'browser',
  legalComments: 'none',
  format: 'iife',
  define: { 'process.env.NODE_ENV': '"production"' }
};

/** Icons (manifest) + popup logo only — store screenshots stay in repo, not in dist. */
async function copyExtensionAssets() {
  await fs.copy(
    path.join(rootDir, 'assets', 'icons'),
    path.join(outDir, 'assets', 'icons')
  );
  const logoSrc = path.join(rootDir, 'assets', 'images', 'logo512.png');
  const logoDest = path.join(outDir, 'assets', 'images', 'logo512.png');
  await fs.ensureDir(path.dirname(logoDest));
  await fs.copy(logoSrc, logoDest);
}

async function syncDocsVersion() {
  const versionPath = path.join(rootDir, 'docs', 'version.json');
  await fs.writeJson(versionPath, { version: pkg.version }, { spaces: 2 });
  console.log(`docs/version.json -> ${pkg.version}`);
}

async function writeDistManifest() {
  const pkgJson = await fs.readJson(path.join(rootDir, 'package.json'));
  const manifest = await fs.readJson(path.join(rootDir, 'manifest.json'));
  manifest.version = pkgJson.version;
  await fs.writeJson(path.join(outDir, 'manifest.json'), manifest, { spaces: 2 });
  console.log(`Manifest version -> ${pkgJson.version}${isRelease ? ' (release)' : ''}`);
  return pkgJson.version;
}

async function copyStaticFiles() {
  if (!isWatch) {
    await fs.emptyDir(outDir);
  }
  await fs.ensureDir(outDir);

  await writeDistManifest();

  await copyExtensionAssets();
  await fs.copy(path.join(rootDir, 'changelog'), path.join(outDir, 'changelog'));

  const popupDir = path.join(outDir, 'popup');
  await fs.ensureDir(popupDir);
  await fs.copy(path.join(rootDir, 'src/popup/popup.css'), path.join(popupDir, 'popup.css'));

  let popupHtml = await fs.readFile(path.join(rootDir, 'src/popup/popup.html'), 'utf8');
  popupHtml = popupHtml.replace(
    '<script type="module" src="main.ts"></script>',
    '<script src="popup.js"></script>'
  );
  await fs.writeFile(path.join(popupDir, 'popup.html'), popupHtml);

  const license = path.join(rootDir, 'LICENSE');
  if (await fs.pathExists(license)) {
    await fs.copy(license, path.join(outDir, 'LICENSE'));
  }

  await syncDocsVersion();
  console.log('Static files copied');
}

async function buildJs() {
  const config = {
    ...esbuildCommon,
    plugins: [vue()],
    entryPoints: {
      background: path.join(rootDir, 'src/background.js'),
      'content/before': path.join(rootDir, 'src/content/before.js'),
      'content/after': path.join(rootDir, 'src/content/after.js'),
      'popup/popup': path.join(rootDir, 'src/popup/main.ts')
    },
    outdir: outDir
  };

  if (isWatch) {
    const ctx = await esbuild.context(config);
    await ctx.watch();
    console.log('Watching for changes...');

    const pkgPath = path.join(rootDir, 'package.json');
    let pkgTimer;
    fs.watch(pkgPath, () => {
      clearTimeout(pkgTimer);
      pkgTimer = setTimeout(() => {
        void writeDistManifest().then((v) => {
          console.log(`package.json changed — reload the extension in chrome://extensions (v${v})`);
        });
      }, 80);
    });
  } else {
    await esbuild.build(config);
    console.log('JavaScript bundled');
  }
}

async function main() {
  try {
    await copyStaticFiles();
    await buildJs();
    console.log(`Build complete -> ${outDir}`);
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

main();
