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

    this.pagesJsonPath = path.join(this.basePath, './src/pages.json')

    this.fileName = 'router.js'

    this.startWatch()
  }

  readPagesJson(path) {
    return fs.readFileSync(path)
  }

  startWatch() {
    console.log('启动动态创建 pages.json 监听...')

    const jsonObj = {
      name: 'hahahahaa'
    }

    const sourcePath = path.join(this.basePath, './src/test.json')

    this.dirArr.forEach(dir => {
      chokidar
        .watch(dir, {
          ignored: /\.vue$/,
          depth: 4 // 监听下面多少层子目录
        })
        .on('all', (event, path) => {
          if (/router\.js$/.test(path)) {
            console.log(`${path} 变化了, 重新构建 pages.json...`)
            let content = fs.readFileSync(path, 'utf-8')
            fs.writeFileSync(sourcePath, JSON.stringify(content))
          }
        })
    })
  }
}

module.exports = new WatchFileChange()