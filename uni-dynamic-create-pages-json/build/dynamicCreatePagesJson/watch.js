const fs = require('fs')
const path = require('path')

class watchFileChange {
  constructor() {
    // 需要监听的目录
    this.dirArr = [
      path.join(path.resolve(), './pages')
    ]
    this.fileName = 'router.js'
    console.log(path.join(path.resolve(), './pages'))
  }

  startWatch() {
    this.dirArr.forEach(dir => {
      // fs.watch()
    })
  }
}

module.exports = new watchFileChange()