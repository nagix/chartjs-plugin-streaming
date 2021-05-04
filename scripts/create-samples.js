/* eslint-disable no-process-exit */

const glob = require('glob');
const replace = require('replacestream');
const fs = require('fs-extra');
const path = require('path');

const root = path.resolve(__dirname, '..');
const files = glob.sync('samples/**/*', {cwd: root});

(async() => {
  await fs.emptyDir(path.join(root, 'dist', 'samples'));

  await Promise.all(files.map((file) => new Promise((resolve, reject) => {
    const dest = fs.createWriteStream(path.join(root, 'dist', file));
    fs.createReadStream(path.join(root, file))
      .pipe(replace(/src="((?:\.\.\/)+)dist\//, 'src="$1'))
      .pipe(dest);
    dest.on('finish', () => resolve);
    dest.on('error', reject);
  })));
})().catch((error) => {
  console.error(`Failed to create samples: ${error.message || error}.`);
  process.exit(1);
});
