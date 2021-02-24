### uniapp 解偶 pages.json



#### pages.json 痛点

1. 主包、分包、还有一些配置项相互混合，模块化困难，难以移植；而且一旦项目页面开始变多，pages.json 文件将变得十分庞大，增加维护成本
2. 团队开发，多人同时编辑该文件，代码提交，签出可能会遇到冲突等一系列问题



#### 理想状态

pages 文件夹为各模块的根目录，其中一个文件夹就是一个模块，里面包含视图层，逻辑层，私有路由配置文件。各功能模块的私有化配置，仅局限在各自的目录下，不与框架目录产生耦合关系。各开发人员的工作空间仅限于当前模块的工作目录。



#### uni 的 pages.js

在 uni-app 中其实是可以使用 pages.js 的形式的（貌似官方文档找不到，估计还不完善）。只需要在 pages.json 同级目录下新建 pages.js 即可。

> 有了 pages.js 之后，uni-app 将会默认使用 pages.js，pages.json 会失效。但是不能删除 pages.json。可以将一些其他配置放在 pages.json或者直接是一个空 json {}



**基本使用**

在 pages.js 中：

```
module.exports = function(pagesJson, loader) {

  loader.addDependency((require.resolve('./pages.js')))
  delete require.cache[require.resolve('./pages.js')]

  loader.addDependency((require.resolve('./pages/detail/config/router.js')))
  delete require.cache[require.resolve('./pages/detail/config/router.js')]

  loader.addDependency((require.resolve('./pages/about/config/router.js')))
  delete require.cache[require.resolve('./pages/about/config/router.js')]

  const pages = [
    {
      path: 'pages/index/index',
      style: {
        navigationBarTitleText: 'home'
      }
    },
    {
      path: 'pages/mine/mine',
      style: {
        navigationBarTitleText: 'mine'
      }
    }
  ]

  const subPackages = [
    ...require('./pages/detail/config/router.js')(pagesJson,loader),
    ...require('./pages/about/config/router.js')(pagesJson,loader)
  ]

  return {
    ...pagesJson,
    pages,
    subPackages
  }
}
```

- pages.js 导出一个函数，函数接受两个参数
  - pagesJson 这个就是解析的 pages.json 的内容
  - loader 由 webpack-uni-page-loader 暴露出来的一个钩子，里面有 addDependency 方法，用来告诉webpack，pages.js还依赖了哪些文件，这样对依赖的文件也可以实行热重载
- 返回的就是一个对象，其实就是类似原来 pages.json 的内容



在其他模块中的 router 中，也应该遵循 pages.js 中的函数模式

module/config/router.js：

```
module.exports = (pagesJson, loader) => {
  return [
    {
      root: 'pages/detail',
      pages: [
        {
          path: 'detail',
          style: {
            navigationBarTitleText: 'detail'
          }
        }
      ]
    }
  ]
}
```



**uni-app 打包 pages.js **

在 webpack-uni-pages-loader：

```
const {
  parsePages,
  normalizePath,
  parsePagesJson,
  parseManifestJson
} = require('@dcloudio/uni-cli-shared')
const {pagesJsonJsFileName} = require('@dcloudio/uni-cli-shared/lib/pages')

module.exports = function (content, map) {
  
  ......

  const manifestJsonPath = path.resolve(process.env.UNI_INPUT_DIR, 'manifest.json')
  const pagesJsonJsPath = path.resolve(process.env.UNI_INPUT_DIR, pagesJsonJsFileName)
  const manifestJson = parseManifestJson(fs.readFileSync(manifestJsonPath, 'utf8'))

  this.addDependency(manifestJsonPath)
  // loader 用到了外部资源 pagesJsonJsPath，那么需要声明这些外部资源的信息，用于在监控模式（watch mode）下验证可缓存的 loder 以及重新编译
  // webpack-loader 的 addDependency 的作用：给当前处理文件添加依赖文件，依赖发送变化时，会重新调用 loader 处理该文件
  this.addDependency(pagesJsonJsPath)

  // 开放出去一个 loader 钩子，里面有一个方法 addDependency，用来告诉 webpack，pages.js 还依赖了哪些文件，这样对依赖的文件也可以实行热重载
  const pagesJson = parsePagesJson(content, {
    addDependency: (file) => {
      (process.UNI_PAGES_DEPS || (process.UNI_PAGES_DEPS = new Set())).add(normalizePath(file))
      this.addDependency(file)
    }
  })
  
  ......

  this.callback(null, '', map)
}
```

- 将 pages.js 添加为 webpack-uni-pages-loader 的依赖

- 开放出去一个 loader 钩子，里面有一个方法 addDependency，用来告诉 webpack，pages.js 还依赖了哪些文件，这样对依赖的文件也可以实行热重载

  

uni-cli-shared\lib\pages.js：

 ```
function parsePagesJson (content, loader) {
  return processPagesJson(parseJson(content, true), loader)
}

const pagesJsonJsFileName = 'pages.js'

// 处理好 pagesJson 再返回
function processPagesJson (pagesJson, loader = {
  addDependency: function () {}
}) {
  const pagesJsonJsPath = path.resolve(process.env.UNI_INPUT_DIR, pagesJsonJsFileName)
  if (fs.existsSync(pagesJsonJsPath)) {
    delete require.cache[pagesJsonJsPath]
    // 从 pagesJsonJsPath 引入 pages.js，pages.js 中导出的是一个函数
    const pagesJsonJsFn = require(pagesJsonJsPath)
    if (typeof pagesJsonJsFn === 'function') {
      // 执行这个函数，生成基本的路由配置
      pagesJson = pagesJsonJsFn(pagesJson, loader)
      if (!pagesJson) {
        console.error(`${pagesJsonJsFileName}  必须返回一个 json 对象`)
      }
    } else {
      console.error(`${pagesJsonJsFileName} 必须导出 function`)
    }
  }
  // 将 subpackages 转换成 subPackages
  if (pagesJson.subpackages && !pagesJson.subPackages) {
    pagesJson.subPackages = pagesJson.subpackages
    delete pagesJson.subpackages
  }
  
  ......
  
  return pagesJson
}
 ```



**使用 uni-pages-hot-modules 简化手动添加依赖**





#### node 监听文件变化动态生成 pages.json

