const fs = require('fs')
const path = require('path')
const loaderUtils = require('loader-utils')

const {
  parsePages,
  normalizePath,
  parsePagesJson,
  parseManifestJson
} = require('@dcloudio/uni-cli-shared')

const {
  getPagesJson
} = require('@dcloudio/uni-cli-shared/lib/cache')

const {
  pagesJsonJsFileName
} = require('@dcloudio/uni-cli-shared/lib/pages')

const parseStyle = require('./util').parseStyle

const emitFileCaches = {}

function checkEmitFile (filePath, jsonObj, changedEmitFiles) {
  const content = JSON.stringify(jsonObj, null, 2)
  if (emitFileCaches[filePath] !== content) {
    changedEmitFiles.push(filePath)
    emitFileCaches[filePath] = content
  }
}

module.exports = function (content, map) {
  // content = JSON.stringify(require('@dcloudio/uni-cli-shared/lib/uni_modules').getPagesJson(content))
  if (this.resourceQuery) {
    const params = loaderUtils.parseQuery(this.resourceQuery)
    if (params) {
      if (params.type === 'style') {
        return `export default ${JSON.stringify(getPagesJson())}`
      } else if (params.type === 'stat') {
        return `export default ${JSON.stringify(process.UNI_STAT_CONFIG || {})}`
      }
    }
  }
  // add deps
  // global.uniModules.forEach(module => {
  //   const uniModulePagesJsonPath = path.resolve(process.env.UNI_INPUT_DIR, 'uni_modules', module, 'pages.json')
  //   if (fs.existsSync(uniModulePagesJsonPath)) {
  //     this.addDependency(uniModulePagesJsonPath)
  //   }
  // })

  // 下面三种情况使用 ./index-new.js
  if (
    process.env.UNI_USING_COMPONENTS ||
    process.env.UNI_PLATFORM === 'h5' ||
    process.env.UNI_PLATFORM === 'quickapp-native'
  ) {
    return require('./index-new').call(this, content, map)
  }

  this.cacheable && this.cacheable()

  const manifestJsonPath = path.resolve(process.env.UNI_INPUT_DIR, 'manifest.json')
  const pagesJsonJsPath = path.resolve(process.env.UNI_INPUT_DIR, pagesJsonJsFileName)
  const manifestJson = parseManifestJson(fs.readFileSync(manifestJsonPath, 'utf8'))

  this.addDependency(manifestJsonPath)
  // loader 用到了外部资源 pagesJsonJsPath，那么需要声明这些外部资源的信息，用于在监控模式（watch mode）下验证可缓存的 loder 以及重新编译
  // webpack-loader 的 addDependency 的作用：给当前处理文件添加依赖文件，依赖发送变化时，会重新调用 loader 处理该文件
  this.addDependency(pagesJsonJsPath)

  // 开放出去一个 loader 钩子，里面有一个方法 addDependency，用来告诉 webpack，pages.js还 依赖了哪些文件，这样对依赖的文件也可以实行热重载
  const pagesJson = parsePagesJson(content, {
    addDependency: (file) => {
      (process.UNI_PAGES_DEPS || (process.UNI_PAGES_DEPS = new Set())).add(normalizePath(file))
      this.addDependency(file)
    }
  })

  if (manifestJson.transformPx === false) {
    process.UNI_TRANSFORM_PX = false
  } else {
    process.UNI_TRANSFORM_PX = true
  }
  if (process.env.UNI_PLATFORM === 'h5') {
    return require('./platforms/h5')(pagesJson, manifestJson)
  }

  const changedEmitFiles = []

  function checkPageEmitFile (pagePath, pageStyle) {
    checkEmitFile(pagePath, parseStyle(pageStyle), changedEmitFiles)
  }

  parsePages(pagesJson, function (page) {
    checkPageEmitFile(page.path, page.style)
  }, function (root, page) {
    checkPageEmitFile(normalizePath(path.join(root, page.path)), page.style)
  })

  const jsonFiles = require('./platforms/' + process.env.UNI_PLATFORM)(pagesJson, manifestJson)

  if (jsonFiles && jsonFiles.length) {
    jsonFiles.forEach(jsonFile => {
      jsonFile && checkEmitFile(jsonFile.name, jsonFile.content, changedEmitFiles)
    })
  }

  changedEmitFiles.forEach(name => {
    this.emitFile(name + '.json', emitFileCaches[name])
  })

  this.callback(null, '', map)
}
