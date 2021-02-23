// 使用 uni-pages-hot-modules 简化热更新
global.hotRequire = require('uni-pages-hot-modules')

// function hotRequire(path, pagesJson, loader) {
//   loader.addDependency((require.resolve(path)))
//   delete require.cache[require.resolve(path)]

//   return require(path)(pagesJson, loader)
// }

module.exports = function(pagesJson, loader) {
  hotRequire(loader)

  // loader.addDependency((require.resolve('./pages.js')))
  // delete require.cache[require.resolve('./pages.js')]

  // loader.addDependency((require.resolve('./pages/detail/config/router.js')))
  // delete require.cache[require.resolve('./pages/detail/config/router.js')]

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
    // ...hotRequire('./pages/detail/config/router.js', pagesJson, loader)
    ...hotRequire('./pages/detail/config/router.js')(),
    ...hotRequire('./pages/about/config/router.js')()
  ]

  return {
    ...pagesJson,
    pages,
    subPackages
  }
}
