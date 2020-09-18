module.exports = [
  {
    title: '前言',
    collapsable: false,
    children: [
      ['', '说明'],
    ]
  },
  {
    title: '基础',
    collapsable: false,
    children: [
      {
        title: '简易路由实现',
        children: ['./start-router']
      },
      {
        title: '丰富路由功能',
        children: [
          './params-router', './dynamic-router', './nested-router',
          './passing-router',
          './cache-router-view-router',
          './redirect-and-alias-router',
        ],
      }
    ]
  },
  {
    title: '工具',
    collapsable: true,//可折叠
    children: [['./util-router', '公共方法']],
  },
]