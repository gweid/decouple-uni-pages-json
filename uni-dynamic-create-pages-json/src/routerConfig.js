const Detail = require('./pages/detail/config/router.js')
const About = require('./pages/about/config/router.js')

const routes = {
  globalStyle: {
		navigationBarTextStyle: 'black',
		navigationBarTitleText: 'uni-app',
		navigationBarBackgroundColor: '#F8F8F8',
		backgroundColor: '#f5f5f5'
	},
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