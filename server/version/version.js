const git = require('git-describe');
const path = require('path');
const fs = require('fs-extra');

const info = git.gitDescribeSync({ longSemver: true });
const file = path.resolve(__dirname, '..', '..', 'dist', 'version.json');

info.date = new Date();

fs.writeFileSync(file, JSON.stringify(info, null, 4), { encoding: 'utf-8' });

console.log(`Wrote version info ${info.raw} to ${path.relative(path.resolve(__dirname, '..'), file)}`);