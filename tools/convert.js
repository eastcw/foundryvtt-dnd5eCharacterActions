const utils = require('./utils');
const fse = require('fs-extra');

Promise.all([
  fse.copy('../.github', 'output/.github'),
  fse.copy('../.vscode', 'output/.vscode'),
  fse.copy('../src', 'output/src'),
  // fse.copy('../.env', 'output/.env'),
  fse.copy('../.gitignore', 'output/.gitignore'),
  // fse.copy('../public', 'output/public'),
  fse.copy('../package.json', 'output/package.json'),
  fse.copy('../README.md', 'output/README.md'),
  fse.copy('../.eslintignore', 'output/.eslintignore'),
  fse.copy('../.eslintrc.js', 'output/.eslintrc.js'),
  fse.copy('../.nvmrc', 'output/.nvmrc'),
  fse.copy('../.prettierignore', 'output/.prettierignore'),
  fse.copy('../.prettierrc.js', 'output/.prettierrc.js'),
  fse.copy('../CONTRIBUTING.md', 'output/CONTRIBUTING.md'),
  fse.copy('../gulpfile.js', 'output/gulpfile.js'),
  fse.copy('../LICENSE', 'output/LICENSE'),
  fse.copy('../package-lock.json', 'output/package-lock.json'),
  fse.copy('../rollup.config.js', 'output/rollup.config.js'),
  fse.copy('../tsconfig.eslint.json', 'output/tsconfig.esling.json'),
  fse.copy('../tsconfig.json', 'output/tsconfig.json'),
])
  .then(() => {
    utils.createJsConfig('output/jsconfig.json');

    const allFiles = utils.buildTree('output/src');
    utils.transformTsToJs(allFiles);
  })
  .catch((err) => console.log(err));
