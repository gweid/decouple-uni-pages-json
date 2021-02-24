const Detail = require('./pages/detail/config/router.js')
const About = require('./pages/about/config/router.js')

const routes = {
  pages: [
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
  ],
  subPackages: [
    Detail,
    About
  ]
}

module.exports = routes