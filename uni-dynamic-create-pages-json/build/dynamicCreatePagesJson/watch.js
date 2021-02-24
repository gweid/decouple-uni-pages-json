const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')

class WatchFileChange {
  constructor() {
    // 需要监听的目录
    this.dirArr = [
      path.join(path.resolve(), './src/pages')
    ]

    this.basePath = path.resolve()

    this.routerConfigPath = path.join(this.basePath, './src/routerConfig.js')

    this.pagesJsonPath = path.join(this.basePath, './src/pages.json')

    this.startWatch()
  }

  startWatch() {
    console.log('启动动态创建 pages.json 监听...')

    // const sourcePath = path.join(this.basePath, './src/test.json')

    chokidar
      .watch(this.dirArr, {
        ignored: /\.vue$/,
        depth: 4 // 监听下面多少层子目录
      })
      .on('all', (event, path) => {
        if (/router\.js$/.test(path)) {
          console.log(`\n${path} 变化了, 重新构建 pages.json...\n`)
          const content = require(this.routerConfigPath)
          
          // 删除 require 引用缓存
          delete require.cache[require.resolve(path)]
          delete require.cache[require.resolve(this.routerConfigPath)]
  
          fs.writeFileSync(this.pagesJsonPath, JSON.stringify(content))
        }
      })
  }
}

module.exports = new WatchFileChange()