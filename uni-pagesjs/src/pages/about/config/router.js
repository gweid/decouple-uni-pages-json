module.exports = (pagesJson, loader) => {
  return [
    {
      root: 'pages/about',
      pages: [
        {
          path: 'about',
          style: {
            navigationBarTitleText: 'about'
          }
        }
      ]
    }
  ]
}