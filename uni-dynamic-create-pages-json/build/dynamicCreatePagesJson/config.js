const path = require('path')

const pagesJsonPath = path.join(path.resolve(), './src/pages.json')
const routerConfigPath = path.join(path.resolve(), './src/routerConfig.js')
const watchFileReg = /((router\.js)|(routerConfig\.js))/

module.exports = {
  pagesJsonPath,
  routerConfigPath,
  watchFileReg
}