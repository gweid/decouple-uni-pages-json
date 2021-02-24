const fs = require('fs')

const { pagesJsonPath, routerConfigPath} = require('./config')

function createPagesJson(tip) {
  const content = require(routerConfigPath)
  
  fs.writeFileSync(pagesJsonPath, JSON.stringify(content, null, 2))

  console.log(tip)
}

module.exports = createPagesJson