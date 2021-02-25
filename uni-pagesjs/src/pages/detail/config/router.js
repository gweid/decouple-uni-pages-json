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
        },
        {
          path: 'reportDetail',
          style: {
            navigationBarTitleText: 'reportDetail'
          }
        }
      ]
    }
  ]
}
