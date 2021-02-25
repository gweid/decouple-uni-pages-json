const fs = require('fs')

const { pagesJsonPath, routerConfigPath } = require('./config')

function createPagesJson(tip) {
  try {
    const content = require(routerConfigPath)
    fs.writeFileSync(pagesJsonPath, JSON.stringify(content, null, 2))

    console.log(tip)
  } catch (error) {
    console.log(error)
  }
}

module.exports = createPagesJson