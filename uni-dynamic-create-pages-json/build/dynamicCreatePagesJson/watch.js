const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')

const { pagesJsonPath, routerConfigPath, watchFileReg } = require('./config')

const createPagesJson = require('./create')

function debounce(func, wait = 1000) {
  let timeId
  return function () {
    const context = this
    const args = arguments
    clearTimeout(timeId)
    timeId = setTimeout(function() {
      func.apply(context, args)
    }, wait)
  }
}

class WatchFileChange {
  constructor() {
    // 需要监听的目录
    this.dirArr = [
      path.join(path.resolve(), './src/pages'),
      routerConfigPath
    ]

    this.pagesJsonPath = pagesJsonPath
    this.routerConfigPath = routerConfigPath

    this.startWatch()
  }

  startWatch() {
    console.log('启动动态创建 pages.json 监听...')

    chokidar
      .watch(this.dirArr, {
        ignored: /\.vue$/,
        depth: 4 // 监听下面多少层子目录
      })
      .on('all', debounce((event, path) => {
        if (path.match(watchFileReg)) {
          // 删除 require 引用缓存
          delete require.cache[require.resolve(path)]
          delete require.cache[require.resolve(this.routerConfigPath)]

          createPagesJson(`\n${path} 发生变化, 已重新构建 pages.json...\n`) 
        }
      }, 500))
  }
}

module.exports = new WatchFileChange()